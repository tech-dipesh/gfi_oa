import { readFile } from "node:fs/promises"
import { pool } from "@/infra/db"

await pool.query(await readFile("src/infra/schema.sql", "utf8"))
console.log("tables ready")
await pool.end()
