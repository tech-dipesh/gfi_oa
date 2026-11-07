import type { Edu, Issue, Job, Parsed, Project } from "@/resumes/types"
import { toYears, unionMonths, ym } from "@/resumes/years"

const heads: [string, RegExp][] = [
  ["summary", /^(professional |career )?(summary|profile|objective)$/i],
  ["experience", /^(work |professional |relevant )?(experience|employment( history)?)$/i],
  ["projects", /^(key |academic )?projects?( ?\/ ?deliverables)?$/i],
  ["education", /^(education|academics?|education & training)$/i],
  ["skills", /^(core |key |technical )?skills$/i],
  ["tools", /^(tools( ?\/ ?technologies| & technologies)?|technologies)$/i],
  ["certs", /^(certifications?( & licenses)?|licen[cs]es|courses)$/i],
  ["langs", /^languages$/i],
  ["awards", /^(awards?( ?\/ ?honou?rs| & honou?rs)?|honou?rs|achievements)$/i],
]

const bullet = /^\s*(?:[•·●▪◦*]|[-–]\s)\s*/
const mon = "(?<![a-z])(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?"
const part = `(?:${mon}(?:\\s*(?:(?:19|20)\\d{2}|[’']\\d{2}|\\d{2}(?!\\d)))?|\\d{1,2}[/.](?:19|20)\\d{2}|(?:19|20)\\d{2})`
const range = new RegExp(`(${part})\\s*(?:-|–|—|to)\\s*(${part}|present|current|now|ongoing|till date)`, "i")
const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
const degreeRe = /\b(b\.?\s?(e|tech|sc|a|com|des|ba)|b\.arch|m\.?\s?(e|tech|sc|a|com|des|ba)|m\.arch|bachelors?|masters?|post[- ]?graduate|pgdm|mba|ph\.?\s?d|diploma|doctorate|higher secondary|hsc|ssc|hse|sse|xii?|12th|10th|madhymik|secondary)\b/i
const schoolRe = /\b(higher secondary|hsc|ssc|hse|sse|xii?|12th|10th|madhymik|secondary)\b/i
const instRe = /\b(college|university|institute|school|academy|iit|nit|iiit|board)\b/i
const scoreRe = /^(cgpa|gpa|percentage|grade|score)\b/i
const linkRe = /(https?:\/\/\S+|(?:www\.)?(?:behance|dribbble|linkedin|github|figma)\.(?:net|com)\S*)/gi
const durRe = /\b(\d+(?:\.\d+)?)\s*(months?|mos?|years?|yrs?)\b/i

const strip = (s: string) => s.replace(bullet, "").trim()
const list = (s: string) => s.split(/[,;|•]/).map((x) => x.trim()).filter(Boolean)

function stamp(s: string, now: Date, end: boolean) {
  if (/present|current|now|ongoing|till/i.test(s)) return ym(now)
  const full = /((?:19|20)\d{2})/.exec(s)
  const short = /(?:[’']|[a-z]\s*)(\d{2})(?!\d)/i.exec(s)
  const year = full ? Number(full[1]) : short ? 2000 + Number(short[1]) : 0
  if (!year) return 0
  const num = /(\d{1,2})[/.](?:19|20)\d{2}/.exec(s)
  const m = num ? Number(num[1]) - 1 : monthNames.findIndex((n) => new RegExp(`(?<![a-z])${n}`, "i").test(s))
  return year * 12 + (m >= 0 && m < 12 ? m : end ? 11 : 0)
}

function header(line: string, now: Date, issues: Issue[]): Job | null {
  const found = range.exec(line)
  const left = (found ? line.slice(0, found.index) : line).replace(/[\s|,—–-]+$/, "")
  if (!found && !/\s[—–]\s/.test(line)) return null
  if (!found && line.length > 140) return null
  const [title = "", ...rest] = left.split(/\s[—–-]\s|\s\|\s/)
  const job: Job = { title: title.trim(), company: rest.join(" - ").trim(), start: "", end: "", from: 0, to: 0, months: 0, text: "" }
  if (!found) {
    const dur = durRe.exec(line)
    if (dur) {
      job.months = Math.round(Number(dur[1]) * (/^y/i.test(dur[2]) ? 12 : 1))
      issues.push({ level: "info", msg: `Role "${job.title}" gives only a duration (${dur[0]}), counted without exact dates` })
      return job
    }
    issues.push({ level: "warn", msg: `Role "${job.title}" has no dates, so its duration is not counted` })
    return job
  }
  job.start = found[1]
  job.end = found[2]
  job.to = stamp(found[2], now, true)
  const bare = !/\d/.test(found[1])
  const endYear = /(?:19|20)\d{2}/.exec(found[2])?.[0] ?? String(now.getFullYear())
  job.from = stamp(bare ? `${found[1]} ${endYear}` : found[1], now, false)
  if (bare && job.from > job.to) job.from -= 12
  job.months = job.to >= job.from ? job.to - job.from + 1 : 0
  if (job.to < job.from) issues.push({ level: "warn", msg: `Role "${job.title}" ends before it starts (${found[1]} to ${found[2]})` })
  if (job.from > ym(now) + 12) issues.push({ level: "warn", msg: `Role "${job.title}" starts in the future (${found[1]})` })
  return job
}

function parseJobs(lines: string[], now: Date, issues: Issue[]) {
  const jobs: Job[] = []
  for (const line of lines) {
    const job = bullet.test(line) ? null : header(line, now, issues)
    if (job) {
      jobs.push(job)
      continue
    }
    const last = jobs.at(-1)
    if (last) last.text += `${last.text ? "\n" : ""}${strip(line)}`
  }
  return jobs
}

function parseProjects(lines: string[]) {
  const projects: Project[] = []
  for (const line of lines) {
    const text = strip(line)
    const isTitle = !bullet.test(line) && !text.endsWith(".") && text.length < 120
    const last = projects.at(-1)
    if (isTitle && !(last && !last.text && text.length > 90)) projects.push({ name: text, text: "" })
    else if (last) last.text += `${last.text ? "\n" : ""}${text}`
  }
  return projects
}

function parseEducation(lines: string[], now: Date, issues: Issue[]) {
  const out: Edu[] = []
  for (const line of lines.map(strip)) {
    if (scoreRe.test(line)) continue
    const open = out.at(-1) && !out.at(-1)?.school
    if (degreeRe.test(line) && !(open && instRe.test(line)) && !/,\s*(19|20)\d{2}/.test(line)) {
      out.push({ degree: line, school: "", year: "", higher: !schoolRe.test(line) })
      continue
    }
    const last = out.at(-1)
    if (!last || last.school) continue
    const years = line.match(/(?:19|20)\d{2}/g) ?? []
    last.school = line.replace(/,?\s*(expected in |completed in )?(\d{1,2}[/.])?(?:19|20)\d{2}.*$/i, "").trim()
    last.year = years.at(-1) ?? ""
    const top = Number(last.year)
    if (top > now.getFullYear() + 6) issues.push({ level: "warn", msg: `Education year ${top} looks wrong for "${last.degree}"` })
    if (years.length > 1 && Number(years[0]) > Number(years[1])) issues.push({ level: "warn", msg: `Education dates run backwards for "${last.degree}"` })
  }
  return out
}

function parseSkills(lines: string[]) {
  const skills: Record<string, string[]> = {}
  for (const line of lines.map(strip)) {
    const at = line.indexOf(":")
    const label = at > 0 && at < 30 ? line.slice(0, at).trim().toLowerCase() : "other"
    const values = list(at > 0 && at < 30 ? line.slice(at + 1) : line)
    skills[label] = [...(skills[label] ?? []), ...values]
  }
  return skills
}

export function parseResume(text: string, now = new Date()): Parsed {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const top: string[] = []
  const secs: Record<string, string[]> = {}
  let current = ""
  for (const line of lines) {
    const key = line.length <= 40 && !bullet.test(line) ? heads.find(([, re]) => re.test(line))?.[0] : undefined
    if (key) {
      current = key
      secs[key] = [...(secs[key] ?? [])]
      continue
    }
    if (current) secs[current].push(line)
    else top.push(line)
  }
  const issues: Issue[] = []
  const missing = ["experience", "education", "skills"].filter((k) => !secs[k]?.length)
  if (missing.length) issues.push({ level: "warn", msg: `Section not found: ${missing.join(", ")}. Scoring falls back to the whole text` })
  if (!Object.keys(secs).length) issues.push({ level: "warn", msg: "No standard section headings recognised, fields below may be empty" })
  const jobs = parseJobs(secs.experience ?? [], now, issues)
  if (secs.experience?.length && !jobs.length) issues.push({ level: "warn", msg: "Experience section found but no roles could be read from it" })
  const summary = (secs.summary ?? []).join(" ")
  const loose = jobs.filter((j) => !j.from).reduce((a, j) => a + j.months, 0)
  const totalYears = toYears(unionMonths(jobs) + loose)
  const stated = /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b/i.exec(summary)
  const statedYears = stated ? Number(stated[1]) : null
  if (statedYears !== null && jobs.length && Math.abs(statedYears - totalYears) > 1.5)
    issues.push({ level: "info", msg: `Summary claims ${statedYears} years but dated roles add up to ${totalYears}` })
  if (/\biso\s*(?:[:/,)]|$|\s{2,}|and\b)/i.test(text) || /\biso\s+\/s\b/i.test(text))
    issues.push({ level: "info", msg: "ISO standard numbers are blank in the source file, so they cannot be confirmed" })
  return {
    tag: top[0] ?? "",
    title: top[1] ?? "",
    summary,
    skills: parseSkills(secs.skills ?? []),
    tools: (secs.tools ?? []).flatMap((l) => list(strip(l))),
    education: parseEducation(secs.education ?? [], now, issues),
    jobs,
    projects: parseProjects(secs.projects ?? []),
    certs: (secs.certs ?? []).map(strip),
    langs: (secs.langs ?? []).flatMap((l) => list(strip(l))),
    awards: (secs.awards ?? []).map(strip),
    links: [...new Set(text.match(linkRe) ?? [])],
    statedYears,
    totalYears,
    issues,
  }
}
