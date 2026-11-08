import { readFile } from "node:fs/promises"
import { extractResume } from "@/resumes/extract"
import { evaluate } from "@/scoring/classify"
for (const n of process.argv.slice(2)) {
  const f = `data/resumes/anonymized_${n}.docx`
  const { raw, parsed } = await extractResume(await readFile(f), f)
  const ev = evaluate(parsed, raw)
  const r = ev.lca.score >= ev.ux.score ? ev.lca : ev.ux
  console.log(n, parsed.title, ev.label, ev.reason)
  r.parts.forEach((x) => console.log(`  ${x.points}/${x.max} ${x.label}: ${x.note}`))
  r.musts.forEach((x) => console.log(`  [${x.status}] ${x.label}: ${x.note}`))
}
