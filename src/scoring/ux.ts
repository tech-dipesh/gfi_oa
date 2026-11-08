import type { Parsed } from "@/resumes/types"
import { found, has, norm, relevantYears, scale } from "@/scoring/match"
import type { Must, Part, RoleScore } from "@/scoring/types"

export const uxCore = [
  "ui", "ux", "user interface", "user experience", "figma", "product design*", "interaction design",
  "wireframe*", "graphic design*", "visual design*", "usability*",
]
const otherTools = [
  "adobe xd", "sketch", "framer", "invision", "principle", "protopie", "axure", "balsamiq", "figjam", "miro",
  "marvel", "zeplin", "webflow", "illustrator", "photoshop", "canva", "after effects", "maze", "hotjar",
]
const methods = [
  "user research*", "ux research", "usability*", "wireframe*", "prototyp*", "user flow*", "information architecture",
  "persona*", "design thinking", "journey map*", "user journey*", "a/b test*", "accessibility", "wcag", "design system*",
  "interaction design", "human-centered", "user-centered", "human-centred", "user-centred", "heuristic*", "card sorting",
  "interview*", "low-fidelity", "high-fidelity", "mockup*", "responsive", "design critique", "handoff",
]
const psych = [
  "psycholog*", "behavio*", "cognitive", "empath*", "mental model*", "human-centered", "user-centered",
  "human-centred", "user-centred", "gestalt", "persuasion", "motivation", "nielsen", "dark pattern*", "pain point*",
]
const aesthetic = [
  "typography", "color theory", "colour", "visual hierarchy", "visual design*", "layout*", "branding", "brand identity",
  "illustration*", "graphic design*", "motion", "aesthetic*", "composition", "logo*", "poster*", "animation*", "iconography",
]
const detail = ["accessibility", "wcag", "design system*", "pixel*", "consisten*", "detail*", "responsive", "handoff", "component*"]
const projectTerms = [...uxCore, "mockup*", "redesign*", "landing page", "mobile app", "website", "case study", "prototyp*", "design system*"]
const titleTerms = ["ui", "ux", "designer", "product design*", "design intern", "graphic", "visual design*", "design engineer"]
const designField = ["design", "hci", "human computer", "human-computer", "ux", "fine art*", "visual communication", "multimedia", "animation*", "interaction"]
const uxCert = ["ux", "ui", "user experience", "interaction design", "figma", "design"]
const portfolio = /behance|dribbble|figma\.com|portfolio|framer|webflow|notion\.site|wixsite/i

export function scoreUx(p: Parsed, t: string): RoleScore {
  const coreHits = found(t, uxCore)
  const years = relevantYears(p.jobs, uxCore, titleTerms, p.totalYears)
  const figma = has(t, ["figma"])
  const tools = found(t, otherTools)
  const meth = found(t, methods)
  const psy = found(t, psych)
  const aes = found(t, aesthetic)
  const det = found(t, detail)
  const projs = p.projects.filter((x) => has(norm(`${x.name} ${x.text}`), projectTerms)).length
  const link = p.links.some((l) => portfolio.test(l)) ? 5 : p.links.some((l) => !/linkedin/i.test(l)) ? 2 : 0
  const higher = p.education.filter((e) => e.higher)
  const degrees = norm(higher.map((e) => `${e.degree} ${e.school}`).join(" "))
  const certs = norm(p.certs.join(" "))
  const field = has(degrees, designField)
  const course = field ? has(certs, uxCert) || /post graduate|diploma/.test(degrees) : has(`${degrees} ${certs}`, uxCert)
  const parts: Part[] = [
    { label: "Design tools", max: 25, points: (figma ? 15 : 0) + scale(tools.length, 2, 10), note: `${figma ? "Figma" : "No Figma"}${tools.length ? `, plus ${tools.slice(0, 4).join(", ")}` : ""}` },
    { label: "UX methods", max: 25, points: scale(meth.length, 8, 25), note: `${meth.length} method terms: ${meth.slice(0, 6).join(", ") || "none"}` },
    { label: "Design experience", max: 15, points: scale(years, 0.5, 15), note: `${years} yrs in design roles (JD is open to 0 to 1 yr, full marks at 6 months)` },
    { label: "Projects and portfolio", max: 15, points: scale(projs, 3, 10) + link, note: `${projs} design projects${link === 5 ? ", portfolio link found" : link ? ", a link found" : ", no portfolio link"}` },
    { label: "Education", max: 10, points: Math.min((field ? 7 : higher.length ? 2 : 0) + (course ? 3 : 0), 10), note: higher.length ? `${higher[0].degree}${field ? ", design field" : ""}${course ? ", UX course" : ""}` : "No degree found" },
    { label: "User psychology", max: 5, points: scale(psy.length, 3, 5), note: `${psy.length} terms: ${psy.slice(0, 4).join(", ") || "none"}` },
    { label: "Visual and aesthetic", max: 5, points: scale(aes.length, 4, 5), note: `${aes.length} terms: ${aes.slice(0, 4).join(", ") || "none"}` },
  ]
  const musts: Must[] = [
    { label: "Figma and prototyping tools", status: figma ? "met" : tools.length ? "partial" : "missing", note: figma ? "Figma found" : tools.length ? `only ${tools.slice(0, 3).join(", ")}` : "not found" },
    { label: "Understands user psychology", status: psy.length >= 2 ? "met" : psy.length ? "partial" : "missing", note: psy.slice(0, 3).join(", ") || "not found" },
    { label: "Creative and aesthetic sense", status: aes.length >= 2 ? "met" : aes.length ? "partial" : "missing", note: aes.slice(0, 3).join(", ") || "not found" },
    { label: "Eye for detail", status: det.length ? "met" : "missing", note: det.slice(0, 3).join(", ") || "no signal found" },
    { label: "0 to 1 yr design experience", status: years <= 1 ? "met" : "partial", note: years <= 1 ? `${years} yrs` : `${years} yrs, above the range` },
  ]
  const evidence = [
    figma ? "Figma" : "",
    meth.length ? `${meth.length} UX methods` : "",
    projs > 0 ? `${projs} design projects` : "",
    years > 0 ? `${years} yrs design` : "",
    link === 5 ? "portfolio link" : "",
  ].filter(Boolean)
  const score = Math.round(parts.reduce((a, x) => a + x.points, 0) * 10) / 10
  return { score, parts, musts, evidence, years, core: coreHits.length }
}
