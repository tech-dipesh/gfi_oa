import { pool } from "@/infra/db"
import { extractResume } from "@/resumes/extract"
import { evaluate } from "@/scoring/classify"

export async function ingest(buf: Buffer, name: string, sid: string | null) {
  const { raw, parsed, status } = await extractResume(buf, name)
  const ev = evaluate(parsed, raw)
  const values = [sid, name, parsed.tag || name, parsed.title, status, ev.label, ev.lca.score, ev.ux.score, parsed, ev, raw, buf]
  const { rows } = await pool.query<{ id: string }>(
    "insert into candidates (session_id, file_name, tag, title, status, label, lca_score, ux_score, parsed, scoring, raw_text, file) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id",
    values,
  )
  return rows[0].id
}
