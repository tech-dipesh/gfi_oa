import type { Parsed, Status } from "@/resumes/types"
import type { Evaluation, Label } from "@/scoring/types"

export interface RoleRow { score: number; rank: number; evidence: string[]; years: number; met: number; total: number }

export interface Row {
  id: string
  tag: string
  title: string
  fileName: string
  status: Status
  label: Label
  mine: boolean
  totalYears: number
  issues: number
  lca: RoleRow
  ux: RoleRow
}

export interface Detail { row: Row; parsed: Parsed; scoring: Evaluation; raw: string }

export interface Ranked { rows: Row[]; of: number }
