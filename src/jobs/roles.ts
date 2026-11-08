import type { Role } from "@/scoring/types"

interface Weight { label: string; max: number; rule: string }

interface RoleInfo { name: string; short: string; place: string; intro: string; asks: string[]; weights: Weight[]; yearsLabel: string }

export const roles: Record<Role, RoleInfo> = {
  lca: {
    name: "LCA Consultant",
    short: "LCA",
    place: "Chennai, onsite",
    yearsLabel: "LCA yrs",
    intro: "Builds life cycle inventory datasets, runs LCA studies and benchmarks results against industry peers.",
    asks: [
      "2 to 3 years running LCA projects independently",
      "Hands-on GaBi or SimaPro, at least 3 completed LCA projects",
      "ISO 14040 and 14044, EPD experience preferred",
      "Bachelor's or Master's, environmental domain preferred",
    ],
    weights: [
      { label: "LCA experience", max: 25, rule: "Years in roles whose title or bullets mention LCA. Full marks at 2 years." },
      { label: "LCA software", max: 20, rule: "GaBi or SimaPro 20, other LCA tools (OpenLCA, ecoinvent, Air.e) 10." },
      { label: "LCA projects", max: 10, rule: "Projects and roles that mention LCA. Full marks at 3." },
      { label: "ISO 14040/14044", max: 10, rule: "Cited by number 10. ISO named near LCA but numbers blank 5." },
      { label: "LCA topic keywords", max: 15, rule: "Distinct terms such as LCI, system boundary, cradle-to-gate, PCF. Full marks at 8." },
      { label: "Education", max: 10, rule: "Bachelor's or Master's 5, plus environmental field 5 or related engineering 3." },
      { label: "EPD experience", max: 5, rule: "EPD or environmental product declaration mentioned." },
      { label: "Role duties", max: 5, rule: "Data collection, validation, benchmarking, stakeholder and audit terms. Full marks at 4." },
    ],
  },
  ux: {
    name: "UI/UX Design Intern",
    short: "UI/UX",
    place: "Remote",
    yearsLabel: "Design yrs",
    intro: "First member of the design team, shaping the website and job board for a sustainability platform.",
    asks: [
      "0 to 1 year of UX/UI experience, freshers welcome",
      "Figma and prototyping tools, human-centered design",
      "Understands user psychology, strong aesthetic sense, eye for detail",
      "High-fidelity prototypes and design specifications",
    ],
    weights: [
      { label: "Design tools", max: 25, rule: "Figma 15, plus other design and prototyping tools up to 10." },
      { label: "UX methods", max: 25, rule: "Distinct terms such as wireframes, user flows, personas, accessibility. Full marks at 8." },
      { label: "Design experience", max: 15, rule: "Years in design roles. Full marks at 6 months, since the JD is open to 0 to 1 year." },
      { label: "Projects and portfolio", max: 15, rule: "Design projects up to 10 (full at 3), portfolio link 5." },
      { label: "Education", max: 10, rule: "Design degree 7 or any degree 2, plus a UX course or diploma 3." },
      { label: "User psychology", max: 5, rule: "Psychology, behavior, empathy, cognitive terms. Full marks at 3." },
      { label: "Visual and aesthetic", max: 5, rule: "Typography, layout, branding, illustration terms. Full marks at 4." },
    ],
  },
}

export const labels = { lca: "LCA", ux: "UI/UX", both: "Both", uncertain: "Uncertain" } as const
