import { getDetail } from "@/candidates/queries"
import { pool } from "@/infra/db"
import { bad, idSchema, readSid, withErrorHandling } from "@/infra/http"

type Ctx = { params: Promise<{ id: string }> }

export const GET = withErrorHandling<Ctx>(async (_req, ctx) => {
  const parsed = idSchema.safeParse((await ctx.params)?.id)
  if (!parsed.success) return bad(parsed.error.issues[0].message)
  const detail = await getDetail(parsed.data, await readSid())
  if (!detail) return bad("candidate not found", 404)
  return Response.json(detail)
})

export const DELETE = withErrorHandling<Ctx>(async (_req, ctx) => {
  const parsed = idSchema.safeParse((await ctx.params).id)
  const sid = await readSid()
  if (!parsed.success || !sid) return bad("only your own uploads can be removed", 403)
  const { rowCount } = await pool.query("delete from candidates where id = $1 and session_id = $2", [parsed.data, sid])
  if (!rowCount) return bad("candidate not found", 404)
  return Response.json({ ok: true })
})
