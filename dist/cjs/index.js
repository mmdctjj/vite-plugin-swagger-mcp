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
  SwaggerMcpServer: () => SwaggerMcpServer,
  default: () => vitePluginSwaggerMcp
});
module.exports = __toCommonJS(src_exports);
var import_mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var import_zod = require("zod");
var import_streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var import_node_crypto = require("node:crypto");
var SwaggerMcpServer = class {
  constructor(swaggerUrl, token) {
    this.swaggerUrl = swaggerUrl;
    this.token = token;
  }
  async loadSwagger() {
    const res = await fetch(this.swaggerUrl, {
      headers: this.token ? { Authorization: `${this.token}` } : {}
    });
    const data = await res.json();
    this.swaggerDoc = data;
    return this.swaggerDoc;
  }
  /** 1. 获取模块列表 */
  async getModules() {
    const doc = await this.loadSwagger();
    return (doc.tags ?? []).map((t) => ({
      name: t.name,
      description: t.description || ""
    }));
  }
  /**
   * 递归解析引用类型，获取最底层类型定义
   * @param doc Swagger文档对象
   * @param ref 引用路径，如 '#/definitions/统一响应体«PageWrapper«VideoCreateResponse»»'
   * @param visited 已访问的引用路径，用于防止循环引用
   * @returns 最底层的类型定义
   */
  resolveRef(doc, ref, visited = /* @__PURE__ */ new Set()) {
    var _a;
    if (!ref)
      return void 0;
    if (visited.has(ref))
      return void 0;
    visited.add(ref);
    const definition = (_a = doc.definitions) == null ? void 0 : _a[ref];
    if (!definition)
      return void 0;
    if (definition.originalRef) {
      return this.resolveRef(doc, definition.originalRef, visited);
    }
    if (definition.properties) {
      Object.keys(definition.properties).forEach((key) => {
        var _a2, _b, _c;
        const prop = (_a2 = definition.properties) == null ? void 0 : _a2[key];
        if (prop == null ? void 0 : prop.originalRef) {
          const resolvedProp = this.resolveRef(
            doc,
            prop.originalRef,
            new Set(visited)
          );
          if (resolvedProp && definition.properties) {
            definition.properties[key] = resolvedProp;
          }
        }
        if ((_b = prop == null ? void 0 : prop.items) == null ? void 0 : _b.originalRef) {
          const resolvedProp = this.resolveRef(
            doc,
            (_c = prop == null ? void 0 : prop.items) == null ? void 0 : _c.originalRef,
            new Set(visited)
          );
          if (resolvedProp && definition.properties) {
            definition.properties[key] = resolvedProp;
          }
        }
      });
    }
    return definition;
  }
  /** 2. 获取某模块下的接口 */
  async getModuleApis(module2) {
    const doc = await this.loadSwagger();
    const apis = [];
    Object.keys(doc.paths).forEach((path) => {
      Object.keys(doc.paths[path]).map((method) => {
        var _a, _b, _c, _d, _e;
        const op = (_b = (_a = doc.paths[path][method]) == null ? void 0 : _a.tags) == null ? void 0 : _b.includes(module2);
        if (op) {
          const originalRef = (_e = (_d = (_c = doc.paths[path][method].responses) == null ? void 0 : _c["200"]) == null ? void 0 : _d.schema) == null ? void 0 : _e.originalRef;
          const resolvedDefinition = this.resolveRef(doc, originalRef);
          apis.push({
            path,
            method,
            ...doc.paths[path][method],
            definitions: resolvedDefinition
          });
        }
      });
    });
    return apis;
  }
  /** 3. 获取某个接口的类型 */
  async getApiTypes(path, method) {
    var _a, _b, _c, _d;
    const doc = await this.loadSwagger();
    const op = (_a = doc.paths[path]) == null ? void 0 : _a[method.toLowerCase()];
    if (!op)
      throw new Error("接口不存在");
    const originalRef = (_d = (_c = (_b = doc.paths[path][method].responses) == null ? void 0 : _b["200"]) == null ? void 0 : _c.schema) == null ? void 0 : _d.originalRef;
    const resolvedDefinition = this.resolveRef(doc, originalRef);
    return {
      path,
      method,
      ...doc.paths[path][method],
      definitions: resolvedDefinition
    };
  }
};
var transports = {};
function vitePluginSwaggerMcp({
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
        const swaggerServer = new SwaggerMcpServer(swaggerUrl, token);
        const mcpServer = new import_mcp.McpServer({
          name: "swagger-mcp-server",
          version: "0.1.0"
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SwaggerMcpServer
});
