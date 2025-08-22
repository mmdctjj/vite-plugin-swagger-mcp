import type { Plugin } from "vite";
import { SchemaObject } from "./type";
export declare class SwaggerMcpServer {
    private swaggerUrl;
    private token?;
    private swaggerDoc?;
    constructor(swaggerUrl: string, token?: string);
    private loadSwagger;
    /** 1. 获取模块列表 */
    getModules(): Promise<{
        name: string;
        description: string;
    }[]>;
    /**
     * 递归解析引用类型，获取最底层类型定义
     * @param doc Swagger文档对象
     * @param ref 引用路径，如 '#/definitions/统一响应体«PageWrapper«VideoCreateResponse»»'
     * @param visited 已访问的引用路径，用于防止循环引用
     * @returns 最底层的类型定义
     */
    private resolveRef;
    /** 2. 获取某模块下的接口 */
    getModuleApis(module: string): Promise<any[]>;
    /** 3. 获取某个接口的类型 */
    getApiTypes(path: string, method: string): Promise<{
        definitions: SchemaObject | undefined;
        tags?: string[] | undefined;
        summary?: string | undefined;
        description?: string | undefined;
        externalDocs?: import("./type").ExternalDocsObject | undefined;
        operationId?: string | undefined;
        consumes?: string[] | undefined;
        produces?: string[] | undefined;
        parameters?: import("./type").ParameterObject[] | undefined;
        responses: {
            [statusCode: string]: import("./type").ResponseObject;
        };
        schemes?: ("http" | "https" | "ws" | "wss")[] | undefined;
        deprecated?: boolean | undefined;
        security?: import("./type").SecurityRequirementObject[] | undefined;
        path: string;
        method: string;
    }>;
}
export default function vitePluginSwaggerMcp({ swaggerUrl, token, }: {
    swaggerUrl: string;
    token?: string;
}): Plugin;
