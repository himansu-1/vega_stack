import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable specific rules for production builds
      "@typescript-eslint/no-explicit-any": process.env.NODE_ENV === 'production' ? "off" : "error",
      "@typescript-eslint/ban-ts-comment": process.env.NODE_ENV === 'production' ? "off" : "error",
      "@typescript-eslint/no-unused-vars": process.env.NODE_ENV === 'production' ? "warn" : "error",
    },
  },
];

export default eslintConfig;
