import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import { parseResume } from "@/resumes/parse"
import { extractResume } from "@/resumes/extract"
import { evaluate } from "@/scoring/classify"

const open = async (name: string) => {
  const file = `data/resumes/anonymized_${name}.docx`
  const { raw, parsed, status } = await extractResume(await readFile(file), file)
  return { raw, parsed, status, ev: evaluate(parsed, raw) }
}

const now = new Date("2026-11-07")

describe("dates", () => {
  const years = (line: string) => parseResume(`AB\nRole\nExperience\n${line}\n• did work`, now).jobs[0]

  it("reads month and year ranges", () => expect(years("Designer — Acme   Mar 2022 - Present").months).toBe(57))
  it("reads MM/YYYY", () => expect(years("Analyst — Acme   11/2025 – 01/2026").months).toBe(3))
  it("reads short years with apostrophe", () => expect(years("Intern — Acme   Sep ’25 – Dec ’25").months).toBe(4))
  it("takes the end year for a bare start month", () => expect(years("Intern — Acme   Jan – April 2026").months).toBe(4))
  it("flags roles without dates", () => expect(parseResume("AB\nRole\nExperience\nIntern — Acme   null\n• work", now).issues.some((i) => i.level === "warn")).toBe(true))
})

describe("pipeline", () => {
  it("ranks an LCA analyst for the LCA role", async () => {
    const { ev } = await open("HM_1793682784257")
    expect(ev.label).toBe("lca")
    expect(ev.lca.score).toBeGreaterThan(ev.ux.score)
  })
  it("ranks a UI/UX designer for the design role", async () => {
    const { ev } = await open("DVJ_1793685080268")
    expect(ev.label).toBe("ux")
  })
  it("reports a file with no text instead of scoring it", async () => {
    const { ev, status } = await open("resume_1793685080327")
    expect(status).toBe("failed")
    expect(ev.label).toBe("uncertain")
    expect(ev.lca.score).toBe(0)
  })
  it("rejects unsupported file types", async () => {
    const out = await extractResume(Buffer.from("x"), "photo.png")
    expect(out.status).toBe("failed")
  })
})
