import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";

export default [
  // Base JavaScript config for all JS files
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  // JSX/React config
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Test files with Vitest globals
  {
    files: ["**/*.test.{js,jsx}", "**/*.spec.{js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        // Vitest globals
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      "dist/",
      "build/",
      "node_modules/",
      "coverage/",
      ".vite/",
      "*.config.*",
      "vite.config.*",
      "vitest.config.*",
    ],
  },
];