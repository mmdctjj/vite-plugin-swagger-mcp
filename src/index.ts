import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import * as http from "node:http";
import type { Connect, Plugin, ViteDevServer } from "vite";
import { z } from "zod";
import { SchemaObject, SwaggerDocument } from "./type";

export class SwaggerMcpServer {
  private swaggerUrl: string;
  private token?: string;
  private swaggerDoc?: SwaggerDocument;

  constructor(swaggerUrl: string, token?: string) {
    this.swaggerUrl = swaggerUrl;
    this.token = token;
  }

  private async loadSwagger(): Promise<SwaggerDocument> {
    const res = await fetch(this.swaggerUrl, {
      headers: this.token ? { Authorization: `${this.token}` } : {},
    });
    const data = await res.json();
    this.swaggerDoc = data as SwaggerDocument;
    return this.swaggerDoc!;
  }

  /** 1. 获取模块列表 */
  async getModules() {
    const doc = await this.loadSwagger();
    return (doc.tags ?? []).map((t) => ({
      name: t.name,
      description: t.description || "",
    }));
  }

  /**
   * 递归解析引用类型，获取最底层类型定义
   * @param doc Swagger文档对象
   * @param ref 引用路径，如 '#/definitions/统一响应体«PageWrapper«VideoCreateResponse»»'
   * @param visited 已访问的引用路径，用于防止循环引用
   * @returns 最底层的类型定义
   */
  private resolveRef(
    doc: SwaggerDocument,
    ref?: string,
    visited: Set<string> = new Set()
  ): SchemaObject | undefined {
    if (!ref) return undefined;

    // 提取定义名称，处理泛型语法如 "统一响应体«PageWrapper«VideoCreateResponse»»"

    // 防止循环引用
    if (visited.has(ref)) return undefined;
    visited.add(ref);

    // 获取定义
    const definition = doc.definitions?.[ref];
    if (!definition) return undefined;

    // 如果定义是引用类型，继续解析
    if (definition.originalRef) {
      return this.resolveRef(doc, definition.originalRef, visited);
    }

    // 处理泛型类型，如包含items的情况
    if (definition.properties) {
      Object.keys(definition.properties).forEach((key) => {
        const prop = definition.properties?.[key];
        if (prop?.originalRef) {
          const resolvedProp = this.resolveRef(
            doc,
            prop.originalRef,
            new Set(visited)
          );
          if (resolvedProp && definition.properties) {
            (definition.properties as any)[key] = resolvedProp;
          }
        }
        if (prop?.items?.originalRef) {
          const resolvedProp = this.resolveRef(
            doc,
            prop?.items?.originalRef,
            new Set(visited)
          );
          if (resolvedProp && definition.properties) {
            (definition.properties as any)[key] = resolvedProp;
          }
        }
      });
    }

    return definition;
  }

  /** 2. 获取某模块下的接口 */
  async getModuleApis(module: string) {
    const doc = await this.loadSwagger();
    const apis: any[] = [];
    Object.keys(doc.paths).forEach((path) => {
      Object.keys(doc.paths[path]).map((method) => {
        const op = doc.paths[path][method]?.tags?.includes(module);
        if (op) {
          const originalRef =
            doc.paths[path][method].responses?.["200"]?.schema?.originalRef;
          const resolvedDefinition = this.resolveRef(doc, originalRef);

          apis.push({
            path,
            method,
            summary: doc.paths[path][method].summary || "",
          });
        }
      });
    });
    return apis;
  }

  /** 3. 获取某个接口的类型 */
  async getApiTypes(path: string, method: string) {
    const doc = await this.loadSwagger();
    const op = doc.paths[path]?.[method.toLowerCase()];
    if (!op) throw new Error("接口不存在");
    const originalRef =
      doc.paths[path][method.toLowerCase()].responses?.["200"]?.schema
        ?.originalRef;
    const resolvedDefinition = this.resolveRef(doc, originalRef);

    return {
      path,
      method,
      ...doc.paths[path][method],
      definitions: resolvedDefinition,
    };
  }
}

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

export default function vitePluginSwaggerMcp({
  swaggerUrl,
  token,
}: {
  swaggerUrl: string;
  token?: string;
}): Plugin {
  return {
    name: "vite-plugin-swagger-mcp",
    enforce: "pre",
    async configureServer(server: ViteDevServer) {
      try {
        let transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            transports[sessionId] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
          }
        };
        const swaggerServer = new SwaggerMcpServer(swaggerUrl, token);

        // 实例化 MCP Server
        const mcpServer = new McpServer({
          name: "swagger-mcp-server",
          version: "0.1.0",
        });

        // 注册工具

        /***
         * 获取模块列表
         */
        mcpServer.tool("getModules", "获取模块列表", async () => {
          const res = await swaggerServer.getModules();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res),
              },
            ],
          };
        });

        /***
         * 获取特定模块下的所有接口及返回值类型
         */
        mcpServer.tool(
          "getModuleApis",
          "获取特定模块下的所有接口及返回值类型",
          {
            module: z.string().describe("模块名称"),
          },
          async ({ module }) => {
            if (!module) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({ error: "模块名称不能为空" }),
                  },
                ],
              };
            }
            const res = await swaggerServer.getModuleApis(module);
            return {
              content: [{ type: "text", text: JSON.stringify(res) }],
            };
          }
        );

        /***
         * 获取特定接口的参数及返回值类型
         */
        mcpServer.tool(
          "getApiTypes",
          "获取特定接口的参数及返回值类型",
          { path: z.string(), method: z.string() },
          async (args) => ({
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await swaggerServer.getApiTypes(args.path, args.method)
                ),
              },
            ],
          })
        );

        // Connect to the MCP mcpServer
        await mcpServer.connect(transport);
        console.log(
          "MCP server connected:",
          `http://localhost:${server.config?.server?.port}/_mcp/sse/swagger`
        );

        server.middlewares.use(
          async (
            req: Connect.IncomingMessage,
            res: http.ServerResponse,
            next: Connect.NextFunction
          ) => {
            // 1. 检查路径
            const url = new URL(req.url || "", `http://${req.headers.host}`);

            if (url.pathname === "/_mcp/sse/swagger") {
              // 2. 允许 GET (建立连接) 和 POST (发送消息)
              if (req.method === "GET" || req.method === "POST") {
                try {
                  // 如果是 POST 且没有会话 ID，尝试从查询参数或 header 中补全 (取决于 SDK 版本需求)
                  // StreamableHTTPServerTransport 通常会自动处理 session 逻辑
                  await transport.handleRequest(req, res);
                } catch (err) {
                  console.error("MCP Transport Error:", err);
                  res.statusCode = 500;
                  res.end("Internal Server Error");
                }
                return; // 处理完后直接返回，不要调用 next()
              }
            }

            // 如果不是 MCP 的请求，交给 Vite 处理
            next();
          }
        );
      } catch (error) {
        console.log("MCP server error", error);
      }
    },
  };
}
