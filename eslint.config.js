import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["demo/vendor/", "tmp/", "playwright-report/"] },
  js.configs.recommended,
  {
    files: ["remark-theme.js", "demo/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        remark: "readonly",
        remarkTheme: "readonly",
      },
    },
  },
  {
    files: ["scripts/**", "tests/**", "*.config.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Callbacks of page.evaluate() run in the browser.
    files: ["tests/**"],
    languageOptions: { globals: { ...globals.browser } },
  },
];
