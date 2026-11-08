import { parseResume } from "@/resumes/parse"
import { kindOf, readText } from "@/resumes/text"
import type { Extracted, Parsed } from "@/resumes/types"

const blank: Parsed = {
  tag: "", title: "", summary: "", skills: {}, tools: [], education: [], jobs: [], projects: [],
  certs: [], langs: [], awards: [], links: [], statedYears: null, totalYears: 0, issues: [],
}

const fail = (msg: string, raw = ""): Extracted => ({ raw, status: "failed", parsed: { ...blank, issues: [{ level: "error", msg }] } })

export async function extractResume(buf: Buffer, name: string, now = new Date()): Promise<Extracted> {
  const kind = kindOf(name)
  if (!kind) return fail("Unsupported file type, please upload a .docx, .pdf or .txt resume")
  try {
    const raw = await readText(buf, kind)
    if (raw.length < 80) return fail("No readable text found. The file may be empty, a scanned image, or built from text boxes", raw)
    const parsed = parseResume(raw, now)
    const status = parsed.issues.some((i) => i.level === "warn") ? "partial" : "ok"
    return { raw, parsed, status }
  } catch (err) {
    return fail(`The file could not be opened: ${err instanceof Error ? err.message : "unknown error"}`)
  }
}
