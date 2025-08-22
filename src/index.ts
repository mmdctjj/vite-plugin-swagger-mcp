import type { Plugin, ViteDevServer, Connect } from "vite";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as http from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import { SwaggerMcpServer } from "./swagger";

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

export default function vitePluginMcp({
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
         * 获取最新接口文档
         */
        mcpServer.tool("updateSwaggerDoc", "获取最新接口文档", async () => {
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
        console.log("MCP server connected");

        server.middlewares.use(
          async (
            req: Connect.IncomingMessage,
            res: http.ServerResponse,
            next: Connect.NextFunction
          ) => {
            if (
              req.method === "POST" &&
              req.url?.startsWith("/_mcp/sse/swagger")
            ) {
              if (!req.headers["mcp-session-id"] && transport.sessionId) {
                // 自动补充
                req.headers["mcp-session-id"] = transport.sessionId;
              }
              // Handle the request
              await transport.handleRequest(req, res);
            } else {
              next();
            }
          }
        );
      } catch (error) {
        console.log("MCP server error", error);
      }
    },
  };
}
