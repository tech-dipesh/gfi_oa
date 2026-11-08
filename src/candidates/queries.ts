import { pool } from "@/infra/db"
import type { Parsed, Status } from "@/resumes/types"
import type { Detail, Row, RoleRow } from "@/candidates/types"
import type { Evaluation, Label, RoleScore } from "@/scoring/types"

interface Entry {
  id: string
  session_id: string | null
  file_name: string
  tag: string
  title: string
  status: Status
  label: Label
  parsed: Parsed
  scoring: Evaluation
  created_at: Date
}

const cols = "id, session_id, file_name, tag, title, status, label, parsed, scoring, created_at"

const metCount = (r: RoleScore) => r.musts.filter((m) => m.status === "met").length

const byFit = (key: "lca" | "ux") => (a: Entry, b: Entry) =>
  b.scoring[key].score - a.scoring[key].score || metCount(b.scoring[key]) - metCount(a.scoring[key]) || b.scoring[key].years - a.scoring[key].years || a.tag.localeCompare(b.tag)

const roleRow = (r: RoleScore, rank: number): RoleRow => ({ score: r.score, rank, evidence: r.evidence, years: r.years, met: metCount(r), total: r.musts.length })

export function toRows(records: Entry[], sid?: string): Row[] {
  const lcaOrder = records.toSorted(byFit("lca"))
  const uxOrder = records.toSorted(byFit("ux"))
  return records.map((r) => ({
    id: r.id,
    tag: r.tag,
    title: r.title,
    fileName: r.file_name,
    status: r.status,
    label: r.label,
    mine: Boolean(sid) && r.session_id === sid,
    totalYears: r.parsed.totalYears,
    issues: r.parsed.issues.filter((i) => i.level !== "info").length,
    lca: roleRow(r.scoring.lca, lcaOrder.indexOf(r) + 1),
    ux: roleRow(r.scoring.ux, uxOrder.indexOf(r) + 1),
  }))
}

export async function listRows(sid?: string) {
  const { rows } = await pool.query<Entry>(`select ${cols} from candidates where session_id is null or session_id = $1 order by created_at, id`, [sid ?? ""])
  return toRows(rows, sid)
}

export async function getDetail(id: string, sid?: string): Promise<Detail | null> {
  const { rows } = await pool.query<Entry & { raw_text: string }>(`select ${cols}, raw_text from candidates where id = $1 and (session_id is null or session_id = $2)`, [id, sid ?? ""])
  if (!rows[0]) return null
  const all = await listRows(sid)
  const row = all.find((r) => r.id === id)
  if (!row) return null
  return { row, parsed: rows[0].parsed, scoring: rows[0].scoring, raw: rows[0].raw_text }
}

export async function getFile(id: string, sid?: string) {
  const { rows } = await pool.query<{ file: Buffer; file_name: string }>("select file, file_name from candidates where id = $1 and (session_id is null or session_id = $2)", [id, sid ?? ""])
  return rows[0] ?? null
}
