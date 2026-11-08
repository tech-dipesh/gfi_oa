import { readdir, readFile } from "node:fs/promises"
import { ingest } from "@/candidates/ingest"
import { pool } from "@/infra/db"

const dir = "data/resumes"
const names = (await readdir(dir)).toSorted()
await pool.query("delete from candidates where session_id is null")
for (const name of names) await ingest(await readFile(`${dir}/${name}`), name, null)
console.log(`seeded ${names.length} resumes`)
await pool.end()
