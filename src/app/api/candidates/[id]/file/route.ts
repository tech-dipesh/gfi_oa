import { getFile } from "@/candidates/queries"
import { bad, idSchema, readSid, withErrorHandling } from "@/infra/http"

const types: Record<string, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
}

export const GET = withErrorHandling<{ params: Promise<{ id: string }> }>(async (_req, ctx) => {
  const parsed = idSchema.safeParse((await ctx.params).id)
  if (!parsed.success) return bad(parsed.error.issues[0].message)
  const file = await getFile(parsed.data, await readSid())
  if (!file) return bad("resume not found", 404)
  const ext = file.file_name.split(".").pop()?.toLowerCase() ?? ""
  const headers = { "Content-Type": types[ext] ?? "application/octet-stream", "Content-Disposition": `inline; filename="${encodeURIComponent(file.file_name)}"` }
  return new Response(new Uint8Array(file.file), { headers })
})
