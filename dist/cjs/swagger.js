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

// src/swagger.ts
var swagger_exports = {};
__export(swagger_exports, {
  SwaggerMcpServer: () => SwaggerMcpServer
});
module.exports = __toCommonJS(swagger_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SwaggerMcpServer
});
