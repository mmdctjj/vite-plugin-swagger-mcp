import { defineConfig } from "father";

export default defineConfig({
  cjs: {},
  esm: { input: "src" },
  prebundle: {
    deps: {},
  },
});
