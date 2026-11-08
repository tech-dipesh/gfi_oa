export type Role = "lca" | "ux"

export type Label = "lca" | "ux" | "both" | "uncertain"

export interface Part { label: string; points: number; max: number; note: string }

export interface Must { label: string; status: "met" | "partial" | "missing"; note: string }

export interface RoleScore {
  score: number
  parts: Part[]
  musts: Must[]
  evidence: string[]
  years: number
  core: number
}

export interface Evaluation { lca: RoleScore; ux: RoleScore; label: Label; reason: string }
