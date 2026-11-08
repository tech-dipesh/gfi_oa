import { z } from "zod"
import { ingest } from "@/candidates/ingest"
import { listRows } from "@/candidates/queries"
import { pool } from "@/infra/db"
import { bad, ensureSid, withErrorHandling } from "@/infra/http"

const MAX = 4 * 1024 * 1024
const LIMIT = 10

const fileSchema = z
  .instanceof(File, { error: "Please attach a resume file" })
  .refine((f) => f.size > 0, "The file is empty")
  .refine((f) => f.size <= MAX, "Please upload a file under 4 MB")
  .refine((f) => /\.(docx|pdf|txt)$/i.test(f.name), "Please upload a .docx, .pdf or .txt resume")

export const POST = withErrorHandling(async (req) => {
  const form = await req.formData()
  const parsed = fileSchema.safeParse(form.get("file"))
  if (!parsed.success) return bad(z.flattenError(parsed.error).formErrors[0] ?? "Invalid file")
  const sid = await ensureSid()
  await pool.query("delete from candidates where session_id is not null and created_at < now() - interval '1 day'")
  const { rows } = await pool.query<{ n: string }>("select count(*) as n from candidates where session_id = $1", [sid])
  if (Number(rows[0].n) >= LIMIT) return bad(`You can keep up to ${LIMIT} test uploads. Remove one first`, 429)
  const id = await ingest(Buffer.from(await parsed.data.arrayBuffer()), parsed.data.name, sid)
  const all = await listRows(sid)
  return Response.json({ id, rows: all })
})
