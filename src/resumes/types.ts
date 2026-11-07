export type Level = "error" | "warn" | "info"

export interface Issue { level: Level; msg: string }

export interface Job {
  title: string
  company: string
  start: string
  end: string
  from: number
  to: number
  months: number
  text: string
}

export interface Edu { degree: string; school: string; year: string; higher: boolean }

export interface Project { name: string; text: string }

export interface Parsed {
  tag: string
  title: string
  summary: string
  skills: Record<string, string[]>
  tools: string[]
  education: Edu[]
  jobs: Job[]
  projects: Project[]
  certs: string[]
  langs: string[]
  awards: string[]
  links: string[]
  statedYears: number | null
  totalYears: number
  issues: Issue[]
}

export type Status = "ok" | "partial" | "failed"

export interface Extracted { raw: string; parsed: Parsed; status: Status }
