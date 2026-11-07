import vitals from "eslint-config-next/core-web-vitals"
import ts from "eslint-config-next/typescript"

const config = [...vitals, ...ts, { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] }, { rules: { "@typescript-eslint/no-explicit-any": "error", "@typescript-eslint/no-unused-vars": "error" } }]

export default config
