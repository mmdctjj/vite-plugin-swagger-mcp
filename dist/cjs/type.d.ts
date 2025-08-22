export interface SwaggerDocument {
    swagger: "2.0";
    info: InfoObject;
    host?: string;
    basePath?: string;
    schemes?: ("http" | "https" | "ws" | "wss")[];
    consumes?: string[];
    produces?: string[];
    paths: PathsObject;
    definitions?: {
        [key: string]: SchemaObject;
    };
    parameters?: {
        [key: string]: ParameterObject;
    };
    responses?: {
        [key: string]: ResponseObject;
    };
    securityDefinitions?: {
        [key: string]: SecuritySchemeObject;
    };
    security?: SecurityRequirementObject[];
    tags?: TagObject[];
    externalDocs?: ExternalDocsObject;
}
export interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: {
        name?: string;
        url?: string;
        email?: string;
    };
    license?: {
        name: string;
        url?: string;
    };
    version: string;
}
export interface PathsObject {
    [path: string]: PathItemObject;
}
export type PathItemObject = Record<string, OperationObject>;
export interface OperationObject {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocsObject;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: ParameterObject[];
    responses: {
        [statusCode: string]: ResponseObject;
    };
    schemes?: ("http" | "https" | "ws" | "wss")[];
    deprecated?: boolean;
    security?: SecurityRequirementObject[];
}
export type ParameterObject = BodyParameterObject | NonBodyParameterObject;
export interface BodyParameterObject {
    name: string;
    in: "body";
    description?: string;
    required?: boolean;
    schema: SchemaObject;
}
export interface NonBodyParameterObject {
    name: string;
    in: "query" | "header" | "path" | "formData";
    description?: string;
    required?: boolean;
    type: string;
    format?: string;
    allowEmptyValue?: boolean;
    items?: ItemsObject;
    collectionFormat?: string;
    default?: any;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    enum?: any[];
    multipleOf?: number;
}
export interface ItemsObject {
    type: string;
    format?: string;
    items?: ItemsObject;
    collectionFormat?: string;
    default?: any;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    enum?: any[];
    multipleOf?: number;
}
export interface ResponseObject {
    description: string;
    schema?: SchemaObject;
    headers?: {
        [name: string]: HeaderObject;
    };
    examples?: {
        [mimeType: string]: any;
    };
}
export interface HeaderObject extends ItemsObject {
    description?: string;
}
export interface SchemaObject {
    $ref?: string;
    originalRef?: string;
    format?: string;
    title?: string;
    description?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    enum?: any[];
    type?: string;
    items?: SchemaObject;
    allOf?: SchemaObject[];
    properties?: Record<string, SchemaObject>;
    additionalProperties?: SchemaObject | boolean;
    required?: string[];
}
export interface SecuritySchemeObject {
    type: "basic" | "apiKey" | "oauth2";
    description?: string;
    name?: string;
    in?: "query" | "header";
    flow?: "implicit" | "password" | "application" | "accessCode";
    authorizationUrl?: string;
    tokenUrl?: string;
    scopes?: {
        [scopeName: string]: string;
    };
}
export interface SecurityRequirementObject {
    [name: string]: string[];
}
export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocsObject;
}
export interface ExternalDocsObject {
    description?: string;
    url: string;
}
