import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import vitest from "eslint-plugin-vitest";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    files: ["**/*.test.ts"],
    plugins: { vitest },
    rules: vitest.configs.recommended.rules,
    languageOptions: {
        globals: {
            ...vitest.environments.env.globals,
        }
    }
  }
]);
