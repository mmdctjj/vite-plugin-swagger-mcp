import { defineConfig } from "father";

export default defineConfig({
  cjs: {},
  esm: {
    output: "dist/esm",
  },
  prebundle: {
    deps: {},
  },
});
