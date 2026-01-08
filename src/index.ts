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
  return JSON.parse(body || "{}");
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

// 存储会话 ID 对应的 Transport 实例
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
      const swaggerServer = new SwaggerMcpServer(swaggerUrl, token);

      // --- 辅助函数：创建并配置一个新的 MCP Server 实例 ---
      const createNewServer = () => {
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
            content: [{ type: "text", text: JSON.stringify(await swaggerServer.getApiTypes(args.path, args.method)) }],
          })
        );

        return mcpServer;
      };

      const ENDPOINT = "/_mcp/sse/swagger";

      server.middlewares.use(ENDPOINT, async (req, res, next) => {
        try {
          const url = new URL(req.url || "", `http://${req.headers.host}`);
          const sessionId = req.headers["mcp-session-id"] as string || url.searchParams.get("sessionId");

          /* ================= POST 请求处理 ================= */
          if (req.method === "POST") {
            const json = await readJsonBody(req);
            let transport: StreamableHTTPServerTransport;

            // 1. 如果有有效会话，复用 Transport
            if (sessionId && transports[sessionId]) {
              transport = transports[sessionId];
            }
            // 2. 如果是初始化请求，创建新 Transport 和新 Server
            else if (!sessionId) {
              transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                // 如果你的编辑器不支持 SSE 只能接收 JSON 响应，可以设为 true
                // 但大多数现代编辑器建议保持默认（false）以支持标准流
                enableJsonResponse: false,
                onsessioninitialized: (sid) => {
                  transports[sid] = transport;
                },
              });

              transport.onclose = () => {
                if (transport.sessionId) delete transports[transport.sessionId];
              };

              // 为这个 Transport 绑定一个新的 Server 实例，防止 "Already initialized"
              const mcpServer = createNewServer();
              await mcpServer.connect(transport);
            }
            else {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: "Invalid session or not an initialize request" }));
            }

            // 处理请求
            await transport.handleRequest(req, res, json);
            return;
          }

          /* ================= GET 请求处理 (SSE 建立连接) ================= */
          if (req.method === "GET") {
            // 根据 MCP 规范，GET 用于建立 SSE 流
            // 如果使用 StreamableHTTPServerTransport，它会自动处理
            // 如果没有 sessionId，则认为是一个全新的连接请求
            if (!sessionId || !transports[sessionId]) {
              // 如果是初次连接请求且没有 sessionId，让 transport 处理以发送 endpoint 事件
              // 这里创建一个临时的 transport 来引导客户端
              const initTransport = new StreamableHTTPServerTransport();
              await initTransport.handleRequest(req, res);
              return;
            }

            // 已有 session，处理 SSE 流
            await transports[sessionId].handleRequest(req, res);
            return;
          }

          res.statusCode = 405;
          res.end("Method Not Allowed");
        } catch (error) {
          console.error("[MCP Error]", error);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end("Internal Server Error");
          }
        }
      });

      console.log(`✅ MCP Swagger Server mounted at http://localhost:${server.config?.server?.port}${ENDPOINT}`);
    },
  };
}