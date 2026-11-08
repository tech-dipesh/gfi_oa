import type { ReactNode } from "react"
import { roles } from "@/jobs/roles"
import { GAP, MIN } from "@/scoring/classify"

const steps = [
  ["Read", "Each .docx, .pdf or .txt is turned into plain text. A file with no readable text is reported, never skipped silently."],
  ["Split", "Section headings (Experience, Projects, Education, Core Skills, Tools, Certifications) split the text into fields. Roles are read with their dates, and overlapping roles are only counted once."],
  ["Match", "Hand-written term lists for each job description are matched against the text. Hyphens and spacing are normalised first, so cradle - to - gate and cradle-to-gate match."],
  ["Score", "Each role has a fixed 100 point rubric below. Every point can be traced to a note on the candidate page."],
  ["Classify and rank", "Scores decide the label. Within a role, ties break on must-haves met, then relevant years."],
]

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-12">
    <h2 className="text-2xl font-semibold text-ink">{title}</h2>
    <div className="mt-4 space-y-3">{children}</div>
  </section>
)

export default function Method() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold text-ink">How the ranking works</h1>
      <p className="mt-4 text-lg">There is no AI model in the scoring. Everything is rule based, so the same resume always gets the same score and every point has a reason a reviewer can read.</p>
      <Block title="The pipeline">
        <ol className="space-y-3">
          {steps.map(([name, text], i) => (
            <li key={name}><span className="font-semibold text-ink">{i + 1}. {name}.</span> {text}</li>
          ))}
        </ol>
      </Block>
      {(["lca", "ux"] as const).map((r) => (
        <Block key={r} title={`${roles[r].name}, 100 points`}>
          <ul className="space-y-3">
            {roles[r].weights.map((w) => (
              <li key={w.label}><span className="font-semibold text-ink">{w.label}, {w.max}.</span> {w.rule}</li>
            ))}
          </ul>
        </Block>
      ))}
      <Block title="Classification">
        <p>A resume qualifies for a role when its score is at least {MIN} and the resume contains at least one core term of that role (LCA, life cycle, EPD for the LCA role. UI, UX, Figma, product design for the design role).</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><span className="font-medium text-ink">Both</span> when it qualifies for both roles and the scores are within {GAP} points.</li>
          <li><span className="font-medium text-ink">LCA or UI/UX</span> when it qualifies for one role, or clearly leads in the one it qualifies for.</li>
          <li><span className="font-medium text-ink">Uncertain</span> when neither role qualifies, or the file could not be read.</li>
        </ul>
      </Block>
      <Block title="What can go wrong">
        <ul className="list-disc space-y-2 pl-5">
          <li>Resumes without standard headings still get scored on their whole text, with a warning, but projects and roles may be missed.</li>
          <li>Roles without dates cannot add to years. They are flagged on the candidate page.</li>
          <li>In the supplied files some numbers were blanked by anonymisation (for example ISO standard numbers). These are flagged and score partly.</li>
          <li>Keyword rules can miss synonyms. Reviewers should open the evidence and the original file before deciding.</li>
        </ul>
      </Block>
    </main>
  )
}
