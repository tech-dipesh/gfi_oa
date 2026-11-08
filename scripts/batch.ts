import { readdir, readFile } from "node:fs/promises"
import { extractResume } from "@/resumes/extract"
import { evaluate } from "@/scoring/classify"

const dir = "data/resumes"
const names = await readdir(dir)
const rows = await Promise.all(
  names.map(async (name) => {
    const { raw, parsed, status } = await extractResume(await readFile(`${dir}/${name}`), name)
    const ev = evaluate(parsed, raw)
    return { name: name.replace("anonymized_", "").replace(".docx", ""), title: parsed.title.slice(0, 34), lca: ev.lca.score, ux: ev.ux.score, label: ev.label, yrs: parsed.totalYears, status, issues: parsed.issues.length }
  }),
)
console.table(rows.toSorted((a, b) => a.label.localeCompare(b.label) || b.lca - a.lca))
