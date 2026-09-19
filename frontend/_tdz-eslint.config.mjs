import base from "./eslint.config.js";
import { defineConfig } from "eslint/config";

// Config temporal para detectar Temporal Dead Zone (variables usadas antes de
// su declaración), que es la causa del "Cannot access 'x' before initialization".
export default defineConfig([
  ...base,
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "no-use-before-define": [
        "error",
        { functions: false, classes: false, variables: true },
      ],
    },
  },
]);