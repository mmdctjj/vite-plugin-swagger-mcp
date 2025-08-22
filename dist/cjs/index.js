var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => vitePluginMcp
});
module.exports = __toCommonJS(src_exports);
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_zod = require("zod");
var import_streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var import_node_crypto = require("node:crypto");
var import_swagger = require("./swagger");
var transports = {};
function vitePluginMcp({
  swaggerUrl,
  token
}) {
  return {
    name: "vite-plugin-swagger-mcp",
    enforce: "pre",
    async configureServer(server) {
      try {
        let transport = new import_streamableHttp.StreamableHTTPServerTransport({
          sessionIdGenerator: () => (0, import_node_crypto.randomUUID)(),
          onsessioninitialized: (sessionId) => {
            transports[sessionId] = transport;
          }
        });
        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
          }
        };
        const swaggerServer = new import_swagger.SwaggerMcpServer(swaggerUrl, token);
        const mcpServer = new import_mcp.McpServer({
          name: "swagger-mcp-server",
          version: "0.1.0"
        });
        mcpServer.tool("updateSwaggerDoc", "获取最新接口文档", async () => {
          const res = await swaggerServer.getModules();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res)
              }
            ]
          };
        });
        mcpServer.tool("getModules", "获取模块列表", async () => {
          const res = await swaggerServer.getModules();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(res)
              }
            ]
          };
        });
        mcpServer.tool(
          "getModuleApis",
          "获取特定模块下的所有接口及返回值类型",
          {
            module: import_zod.z.string().describe("模块名称")
          },
          async ({ module: module2 }) => {
            if (!module2) {
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({ error: "模块名称不能为空" })
                  }
                ]
              };
            }
            const res = await swaggerServer.getModuleApis(module2);
            return {
              content: [{ type: "text", text: JSON.stringify(res) }]
            };
          }
        );
        mcpServer.tool(
          "getApiTypes",
          "获取特定接口的参数及返回值类型",
          { path: import_zod.z.string(), method: import_zod.z.string() },
          async (args) => ({
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  await swaggerServer.getApiTypes(args.path, args.method)
                )
              }
            ]
          })
        );
        await mcpServer.connect(transport);
        console.log("MCP server connected");
        server.middlewares.use(
          async (req, res, next) => {
            var _a;
            if (req.method === "POST" && ((_a = req.url) == null ? void 0 : _a.startsWith("/_mcp/sse/swagger"))) {
              if (!req.headers["mcp-session-id"] && transport.sessionId) {
                req.headers["mcp-session-id"] = transport.sessionId;
              }
              await transport.handleRequest(req, res);
            } else {
              next();
            }
          }
        );
      } catch (error) {
        console.log("MCP server error", error);
      }
    }
  };
}
