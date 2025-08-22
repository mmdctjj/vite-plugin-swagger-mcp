import type { Plugin } from "vite";
export default function vitePluginMcp({ swaggerUrl, token, }: {
    swaggerUrl: string;
    token?: string;
}): Plugin;
