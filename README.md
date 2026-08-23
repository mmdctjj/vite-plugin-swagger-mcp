
[![NPM version](https://img.shields.io/npm/v/vite-plugin-swagger-mcp.svg?style=flat)](https://npmjs.com/package/vite-plugin-swagger-mcp)
[![NPM downloads](http://img.shields.io/npm/dm/vite-plugin-swagger-mcp.svg?style=flat)](https://npmjs.com/package/vite-plugin-swagger-mcp)

# vite-plugin-swagger-mcp

A vite plugin to generate mcp server from swagger

## Usage

```bash
$ pnpm add vite-plugin-swagger-mcp -D
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import swaggerMcp from 'vite-plugin-swagger-mcp'

export default defineConfig({
  plugins: [
    swaggerMcp({
      swaggerUrl: 'http://ip:port/path/v2/api-docs',
      token: 'xxxx',
    }),
  ],
})
```
```
npm run dev

# MCP server connected
```
Then the MCP server will be available at http://ip:port/_mcp/swagger.

### MCP endpoint

The server runs on the latest MCP SDK v2 (`@modelcontextprotocol/server` 2.x) and speaks the 2026-07-28 Streamable HTTP protocol on a single endpoint, with automatic fallback for older clients:

- `http://ip:port/_mcp/swagger` (recommended)

`/_mcp/sse/swagger` is kept as a legacy alias for backward compatibility.

> Requires **Node.js >= 20**.

When using VSCode, Cursor, Windsurf, Claude Code, the module will automatically update the config files for you.

## LICENSE

MIT
