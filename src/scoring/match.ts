import type { Job } from "@/resumes/types"
import { toYears } from "@/resumes/years"

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const cache = new Map<string, RegExp>()

function termRe(term: string) {
  const hit = cache.get(term)
  if (hit) return hit
  const open = term.endsWith("*")
  const re = new RegExp(`(?<![a-z0-9])${esc(open ? term.slice(0, -1) : term)}${open ? "" : "(?![a-z0-9])"}`)
  cache.set(term, re)
  return re
}

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‐-―−]/g, "-")
    .replace(/(?<=[a-z0-9])\s*-\s*(?=[a-z0-9])/g, "-")
    .replace(/life[- ]?cycle/g, "life cycle")
    .replace(/[ \t]+/g, " ")

export const found = (text: string, terms: string[]) => terms.filter((t) => termRe(t).test(text)).map((t) => t.replace(/\*$/, ""))

export const has = (text: string, terms: string[]) => terms.some((t) => termRe(t).test(text))

export const scale = (n: number, full: number, max: number) => Math.round(max * Math.min(n / full, 1) * 10) / 10

export function relevantYears(jobs: Job[], terms: string[], titleTerms: string[], total: number) {
  const weighted = jobs.map((job) => {
    const text = norm(job.text)
    const title = norm(`${job.title} ${job.company}`)
    const hits = text.split("\n").filter((l) => has(l, terms)).length
    const weight = has(title, titleTerms) || hits >= 2 ? 1 : hits === 1 ? 0.5 : 0
    return job.months * weight
  })
  const months = weighted.reduce((a, b) => a + b, 0)
  return Math.min(toYears(months), total)
}
