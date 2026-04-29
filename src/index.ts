import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import type { Plugin, ViteDevServer } from "vite";
import { z } from "zod/v4";
import { SchemaObject, SwaggerDocument } from "./type";

// --- 辅助函数：解析 JSON Body ---
async function readJsonBody(req: any): Promise<any> {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const err = new Error("Invalid JSON body");
    (err as any).statusCode = 400;
    throw err;
  }
}

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
      const swaggerServer = new SwaggerMcpServer(swaggerUrl, token);

      // 标准 Streamable HTTP：单 MCP endpoint，POST 发送 JSON-RPC，GET/DELETE 可选（由 transport 处理）
      const mcpServer = new McpServer({
        name: "swagger-mcp-server",
        version: "0.1.0",
      });

      // 注册所有工具
      mcpServer.tool("getModules", "获取模块列表", async () => {
        const res = await swaggerServer.getModules();
        return { content: [{ type: "text", text: JSON.stringify(res) }] };
      });

      mcpServer.tool(
        "getModuleApis",
        "获取特定模块下的所有接口",
        { module: z.string().describe("模块名称") },
        async ({ module }) => {
          const res = await swaggerServer.getModuleApis(module);
          return { content: [{ type: "text", text: JSON.stringify(res) }] };
        }
      );

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

      // 这里使用 stateful session，兼容需要 MCP-Session-Id 的客户端；同时开启 JSON 响应模式以减少 SSE 兼容问题
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
      });

      // 连接一次即可，后续每个 HTTP 请求都走 transport.handleRequest
      await mcpServer.connect(transport);

      const ENDPOINT = "/_mcp/swagger";
      const LEGACY_ENDPOINT = "/_mcp/sse/swagger";

      const handler = async (req: any, res: any) => {
        try {
          if (req.method === "POST") {
            const json = await readJsonBody(req);
            await transport.handleRequest(req, res, json);
            return;
          }

          // GET/DELETE 交给 SDK transport（GET 在 enableJsonResponse=true 时通常会 405）
          if (req.method === "GET" || req.method === "DELETE") {
            await transport.handleRequest(req, res);
            return;
          }

          res.statusCode = 405;
          res.end("Method Not Allowed");
        } catch (error) {
          console.error("[MCP Error]", error);
          if (!res.headersSent) {
            res.statusCode = (error as any)?.statusCode ?? 500;
            res.end(
              res.statusCode === 400 ? "Bad Request" : "Internal Server Error"
            );
          }
        }
      };

      server.middlewares.use(ENDPOINT, handler);
      server.middlewares.use(LEGACY_ENDPOINT, handler);

      console.log(
        `✅ MCP Swagger Server mounted at http://localhost:${server.config?.server?.port}${ENDPOINT}`
      );
    },
  };
}
