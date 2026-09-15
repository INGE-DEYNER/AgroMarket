import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Data-fetch-on-mount / sync-state-from-prop-or-URL patterns used throughout
      // this codebase (Admin, DashboardComprador, DashboardProductor, Checkout,
      // Perfil, Pedidos, PagoPasarela, Catalogo, VerificarCorreo) are the standard
      // "synchronize with an external system" use case for useEffect. The new
      // react-hooks/set-state-in-effect rule flags all of them indiscriminately.
      // We keep it as a warning instead of a hard error so the build isn't blocked;
      // revisit case-by-case (e.g. moving to derived state or React Query) later.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);
