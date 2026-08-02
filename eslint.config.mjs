import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: { react: reactPlugin },
    rules: {
      // Composants définis à l'intérieur d'un autre composant :
      // React les remonte à chaque render, causant des pertes de focus et
      // des re-montages inutiles. Cette règle bloque le pattern à la compilation.
      "react/no-unstable-nested-components": ["error", { allowAsProps: false }],
    },
  },
]);

export default eslintConfig;
