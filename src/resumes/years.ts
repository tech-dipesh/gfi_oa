import type { Job } from "@/resumes/types"

export const ym = (d: Date) => d.getFullYear() * 12 + d.getMonth()

export function unionMonths(jobs: Job[]) {
  const spans = jobs.filter((j) => j.months > 0).map((j) => [j.from, j.to] as const)
  const sorted = spans.toSorted((a, b) => a[0] - b[0])
  let total = 0
  let end = -1
  for (const [from, to] of sorted) {
    const start = Math.max(from, end + 1)
    if (to >= start) total += to - start + 1
    end = Math.max(end, to)
  }
  return total
}

export const toYears = (months: number) => Math.round((months / 12) * 10) / 10
