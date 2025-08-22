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
            ...doc.paths[path][method],
            definitions: resolvedDefinition,
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
      doc.paths[path][method].responses?.["200"]?.schema?.originalRef;
    const resolvedDefinition = this.resolveRef(doc, originalRef);

    return {
      path,
      method,
      ...doc.paths[path][method],
      definitions: resolvedDefinition,
    };
  }
}
