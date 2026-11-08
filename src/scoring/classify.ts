import type { Parsed } from "@/resumes/types"
import { norm } from "@/scoring/match"
import { scoreLca } from "@/scoring/lca"
import { scoreUx } from "@/scoring/ux"
import type { Evaluation, Label, RoleScore } from "@/scoring/types"

export const MIN = 40
export const GAP = 15

const empty: RoleScore = { score: 0, parts: [], musts: [], evidence: [], years: 0, core: 0 }

const qualifies = (r: RoleScore) => r.score >= MIN && r.core > 0

export function classify(lca: RoleScore, ux: RoleScore): { label: Label; reason: string } {
  const a = qualifies(lca)
  const b = qualifies(ux)
  const gap = Math.abs(lca.score - ux.score)
  if (a && b && gap <= GAP) return { label: "both", reason: `Both scores are ${MIN}+ and within ${GAP} points of each other (${lca.score} vs ${ux.score})` }
  if (a && (!b || lca.score > ux.score)) return { label: "lca", reason: `LCA score ${lca.score} clears ${MIN}${b ? ` and leads UI/UX by ${gap}` : `, UI/UX is ${ux.score}`}` }
  if (b) return { label: "ux", reason: `UI/UX score ${ux.score} clears ${MIN}${a ? ` and leads LCA by ${gap}` : `, LCA is ${lca.score}`}` }
  return { label: "uncertain", reason: `Neither score reaches ${MIN} with matching evidence (LCA ${lca.score}, UI/UX ${ux.score})` }
}

export function evaluate(p: Parsed, raw: string): Evaluation {
  if (p.issues.some((i) => i.level === "error")) return { lca: empty, ux: empty, label: "uncertain", reason: "Not scored because the file could not be read" }
  const t = norm(raw.split("\n").slice(1).join("\n"))
  const lca = scoreLca(p, t)
  const ux = scoreUx(p, t)
  return { lca, ux, ...classify(lca, ux) }
}
