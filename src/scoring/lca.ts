import type { Parsed } from "@/resumes/types"
import { found, has, norm, relevantYears, scale } from "@/scoring/match"
import type { Must, Part, RoleScore } from "@/scoring/types"

export const lcaCore = [
  "lca*", "life cycle assessment", "life cycle inventory", "life cycle analysis", "life cycle impact", "life cycle",
  "lci", "lcia", "epd*", "environmental product declaration", "pcf", "product carbon footprint",
  "cradle-to-gate", "cradle-to-grave", "cradle-to-cradle",
]
const strongTools = ["gabi", "simapro", "sima pro"]
const otherTools = ["openlca", "ecoinvent", "umberto", "one click lca", "air.e", "sphera", "thinkstep", "brightway"]
const topics = [
  "life cycle inventory", "lci", "lcia", "system boundar*", "allocation", "cradle-to-gate", "cradle-to-grave",
  "impact assessment", "carbon footprint", "pcf", "ghg", "scope 3", "hotspot*", "ecoinvent", "emission factor*",
  "product category rules", "pcr", "bill of materials", "circular*", "recycl*", "iso 14067", "iso 14025",
]
const duties = ["data collection", "data validation", "benchmark*", "stakeholder*", "client*", "cross-functional", "documentation", "logistics", "supplier*", "audit*", "assumption*"]
const envField = ["environment*", "sustainab*", "ecolog*", "climate", "earth science*", "green"]
const nearField = ["engineering", "chemical", "civil", "science", "energy", "technology", "biotech*", "chemistry"]

export function scoreLca(p: Parsed, t: string): RoleScore {
  const coreHits = found(t, lcaCore)
  const years = relevantYears(p.jobs, lcaCore, ["lca", "life cycle", "epd", "pcf"], p.totalYears)
  const strong = found(t, strongTools)
  const other = found(t, otherTools)
  const projs = p.projects.filter((x) => has(norm(`${x.name} ${x.text}`), lcaCore)).length
  const roles = p.jobs.filter((j) => has(norm(j.title), lcaCore) || has(norm(j.text), lcaCore)).length
  const count = projs + roles
  const isoFull = /iso[\s-]*1404[04]/.test(t)
  const isoAny = /\biso\b/.test(t) && coreHits.length > 0
  const topicHits = found(t, topics)
  const dutyHits = found(t, duties)
  const higher = p.education.filter((e) => e.higher)
  const degrees = norm(higher.map((e) => `${e.degree} ${e.school}`).join(" "))
  const env = has(degrees, envField)
  const near = has(degrees, nearField)
  const epd = has(t, ["epd*", "environmental product declaration"])
  const parts: Part[] = [
    { label: "LCA experience", max: 25, points: scale(years, 2, 25), note: `${years} yrs of LCA-related work (JD asks 2 to 3 yrs, full marks at 2)` },
    { label: "LCA software", max: 20, points: strong.length ? 20 : other.length ? 10 : 0, note: strong.length ? `GaBi/SimaPro: ${strong.join(", ")}` : other.length ? `Other tools only: ${other.join(", ")}` : "No LCA software found" },
    { label: "LCA projects", max: 10, points: scale(count, 3, 10), note: `${projs} LCA projects and ${roles} role${roles === 1 ? "" : "s"} with LCA work (JD asks 3+)` },
    { label: "ISO 14040/14044", max: 10, points: isoFull ? 10 : isoAny ? 5 : 0, note: isoFull ? "Standards cited by number" : isoAny ? "ISO mentioned, numbers blank in the file" : "No ISO standard found" },
    { label: "LCA topic keywords", max: 15, points: scale(topicHits.length, 8, 15), note: `${topicHits.length} topic terms: ${topicHits.slice(0, 6).join(", ") || "none"}` },
    { label: "Education", max: 10, points: (higher.length ? 5 : 0) + (env ? 5 : near ? 3 : 0), note: higher.length ? `${higher[0].degree}${env ? ", environmental field" : near ? ", related field" : ", unrelated field"}` : "No degree found" },
    { label: "EPD experience", max: 5, points: epd ? 5 : 0, note: epd ? "EPD work mentioned" : "No EPD mention" },
    { label: "Role duties", max: 5, points: scale(dutyHits.length, 4, 5), note: `${dutyHits.length} duty terms: ${dutyHits.slice(0, 5).join(", ") || "none"}` },
  ]
  const musts: Must[] = [
    { label: "2+ years running LCA projects", status: years >= 2 ? "met" : years >= 1 ? "partial" : "missing", note: `${years} yrs` },
    { label: "GaBi or SimaPro", status: strong.length ? "met" : other.length ? "partial" : "missing", note: strong.length ? strong.join(", ") : other.length ? `only ${other.join(", ")}` : "not found" },
    { label: "3+ LCA projects", status: count >= 3 ? "met" : count >= 1 ? "partial" : "missing", note: `${count} found` },
    { label: "ISO 14040 and 14044", status: isoFull ? "met" : isoAny ? "partial" : "missing", note: isoFull ? "cited" : isoAny ? "ISO named, numbers blank" : "not found" },
    { label: "Bachelor's or Master's, environmental preferred", status: higher.length && env ? "met" : higher.length ? "partial" : "missing", note: higher.length ? (env ? "environmental" : "not environmental") : "no degree parsed" },
  ]
  const evidence = [
    years > 0 ? `${years} yrs LCA work` : "",
    strong.length ? `${strong.join("/")}` : other.length ? `${other[0]}` : "",
    count > 0 ? `${count} LCA projects` : "",
    isoFull ? "ISO 14040/44" : "",
    epd ? "EPD" : "",
  ].filter(Boolean)
  const score = Math.round(parts.reduce((a, x) => a + x.points, 0) * 10) / 10
  return { score, parts, musts, evidence, years, core: coreHits.length }
}
