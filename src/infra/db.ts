import { Pool } from "pg"
import { env } from "@/infra/env"

declare global {
  var pool: Pool | undefined
}

export const pool = globalThis.pool ?? new Pool({ connectionString: env.DB_URL, max: 3 })

if (process.env.NODE_ENV !== "production") globalThis.pool = pool
