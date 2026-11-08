import { readdir, readFile } from "node:fs/promises"
import { extractResume } from "@/resumes/extract"

const dir = "data/resumes"
for (const name of (await readdir(dir)).sort()) {
  const { parsed: p } = await extractResume(await readFile(`${dir}/${name}`), name)
  const short = name.replace("anonymized_", "").replace(".docx", "")
  const zero = p.jobs.filter((j) => !j.months).length
  const edu = p.education.map((e) => `${e.degree.slice(0, 22)}|${e.school.slice(0, 18)}|${e.year}`).join(" ; ")
  console.log(`${short} jobs=${p.jobs.length} zero=${zero} yrs=${p.totalYears} stated=${p.statedYears} proj=${p.projects.length} skills=${Object.keys(p.skills).length} cert=${p.certs.length} edu=[${edu}]`)
  p.issues.filter((i) => i.level !== "info").forEach((i) => console.log(`   ${i.level}: ${i.msg}`))
}
