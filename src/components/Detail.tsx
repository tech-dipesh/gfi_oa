"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { AlertIcon, Bar, CheckIcon, CloseIcon, LabelBadge, MinusIcon, Section } from "@/components/ui"
import { roles } from "@/jobs/roles"
import { useFetchData } from "@/infra/useFetchData"
import type { Detail as DetailData } from "@/candidates/types"
import type { Issue } from "@/resumes/types"
import type { Must, Role } from "@/scoring/types"

interface Props { id: string; role: Role; onClose: () => void; onRemove: (id: string) => void }

const issueText: Record<Issue["level"], { head: string; help: string }> = {
  error: { head: "Could not read", help: "This resume was not scored. Open the original file and review it by hand." },
  warn: { head: "Check this", help: "Part of the resume was not understood, so its scores may be understated." },
  info: { head: "Note", help: "Does not change the score, shown so the reviewer knows what the file contained." },
}

const mustIcon: Record<Must["status"], ReactNode> = {
  met: <CheckIcon />,
  partial: <MinusIcon />,
  missing: <AlertIcon />,
}

const mustText: Record<Must["status"], string> = { met: "Met", partial: "Partly", missing: "Not found" }

const None = () => <p className="text-muted">Not found in this resume</p>

const Chips = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className="flex flex-wrap gap-2">
      {items.map((x, i) => (
        <li key={`${x}-${i}`} className="rounded-pill bg-wash px-3 py-0.5 text-sm text-ink">{x}</li>
      ))}
    </ul>
  ) : (
    <None />
  )

export default function Detail({ id, role: start, onClose, onRemove }: Props) {
  const { data, error, loading } = useFetchData<DetailData>(`/candidates/${id}`)
  const [role, setRole] = useState<Role>(start)
  const head = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    head.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])
  const issues = data?.parsed.issues.toSorted((a, b) => "error warn info".indexOf(a.level) - "error warn info".indexOf(b.level)) ?? []
  const score = data?.scoring[role]
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/50" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="detail-title" ref={head} tabIndex={-1} className="text-2xl font-semibold text-ink">
            {data ? `${data.row.tag}` : "Loading candidate"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close (Escape)" title="Close (Escape)" className="rounded-pill bg-wash p-2 text-ink transition-colors duration-150 hover:bg-line">
            <CloseIcon />
          </button>
        </div>
        {loading && <p className="mt-6" role="status">Loading the extracted details</p>}
        {error && <p className="mt-6 font-medium text-bad" role="alert">{error}</p>}
        {data && score && (
          <>
            <p className="mt-1 text-lg text-body">{data.parsed.title || "No job title found"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <LabelBadge label={data.scoring.label} />
              {data.row.mine && <span className="text-sm font-medium text-brand-strong">Your upload</span>}
              <a href={`/api/candidates/${id}/file`} target="_blank" rel="noreferrer" className="rounded-pill bg-brand px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-strong">Open original file</a>
              {data.row.mine && (
                <button type="button" onClick={() => onRemove(id)} className="rounded-pill bg-wash px-5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-line">Remove upload</button>
              )}
            </div>
            <p className="mt-3">{data.scoring.reason}</p>
            {issues.length > 0 && (
              <Section title="What happened while reading this file">
                <ul className="space-y-3">
                  {issues.map((i, n) => (
                    <li key={n} className={`flex gap-3 ${i.level === "error" ? "text-bad" : i.level === "warn" ? "text-warn" : "text-body"}`}>
                      <AlertIcon />
                      <span>
                        <span className="font-medium">{issueText[i.level].head}: </span>
                        {i.msg}
                        <span className="block text-sm text-muted">{issueText[i.level].help}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {data.row.status !== "failed" && (
              <>
                <Section title="Why it ranks here">
                  <div role="tablist" aria-label="Role" className="flex gap-2">
                    {(["lca", "ux"] as const).map((r) => (
                      <button key={r} type="button" role="tab" aria-selected={role === r} onClick={() => setRole(r)} className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${role === r ? "bg-brand text-white" : "bg-wash text-ink hover:bg-line"}`}>
                        {roles[r].short}: {data.scoring[r].score}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-ink">
                    <span className="text-3xl font-semibold">{score.score}</span> out of 100, rank #{data.row[role].rank} for {roles[role].name}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {score.parts.map((p) => (
                      <li key={p.label}>
                        <div className="flex justify-between gap-4 text-ink">
                          <span className="font-medium">{p.label}</span>
                          <span>{p.points} / {p.max}</span>
                        </div>
                        <Bar value={p.points} max={p.max} />
                        <p className="mt-1 text-sm text-muted">{p.note}</p>
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section title="Must-haves from the job description">
                  <ul className="space-y-2">
                    {score.musts.map((m) => (
                      <li key={m.label} className={`flex gap-3 ${m.status === "met" ? "text-brand-strong" : m.status === "partial" ? "text-warn" : "text-bad"}`}>
                        {mustIcon[m.status]}
                        <span><span className="font-medium">{mustText[m.status]}</span> <span className="text-ink">{m.label}</span> <span className="text-sm text-muted">{m.note}</span></span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}
            <Section title="Extracted from the resume">
              <div className="space-y-6">
                <div><h4 className="mb-2 font-medium text-ink">Summary</h4>{data.parsed.summary ? <p>{data.parsed.summary}</p> : <None />}</div>
                <div>
                  <h4 className="mb-2 font-medium text-ink">Experience, {data.parsed.totalYears} yrs in total</h4>
                  {data.parsed.jobs.length ? (
                    <ul className="space-y-3">
                      {data.parsed.jobs.map((j, n) => (
                        <li key={n}>
                          <span className="font-medium text-ink">{j.title}</span>{j.company && `, ${j.company}`}
                          <span className="block text-sm text-muted">{j.start ? `${j.start} to ${j.end}, ${j.months} months` : j.months ? `${j.months} months, no exact dates` : "No dates found"}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <None />}
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-ink">Education</h4>
                  {data.parsed.education.length ? (
                    <ul className="space-y-1">{data.parsed.education.map((e, n) => <li key={n}><span className="text-ink">{e.degree}</span>{e.school && `, ${e.school}`}{e.year && `, ${e.year}`}</li>)}</ul>
                  ) : <None />}
                </div>
                <div><h4 className="mb-2 font-medium text-ink">Projects</h4><Chips items={data.parsed.projects.map((p) => p.name)} /></div>
                {Object.entries(data.parsed.skills).map(([k, v]) => (
                  <div key={k}><h4 className="mb-2 font-medium capitalize text-ink">{k}</h4><Chips items={v} /></div>
                ))}
                <div><h4 className="mb-2 font-medium text-ink">Tools</h4><Chips items={data.parsed.tools} /></div>
                <div><h4 className="mb-2 font-medium text-ink">Certifications</h4><Chips items={data.parsed.certs} /></div>
                <div><h4 className="mb-2 font-medium text-ink">Languages</h4><Chips items={data.parsed.langs} /></div>
                <div><h4 className="mb-2 font-medium text-ink">Links</h4><Chips items={data.parsed.links} /></div>
              </div>
            </Section>
            <Section title="Text the parser saw">
              <details>
                <summary className="font-medium text-brand-strong">Show raw text</summary>
                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xs bg-wash p-4 text-sm text-ink">{data.raw || "Nothing could be read from this file."}</pre>
              </details>
            </Section>
          </>
        )}
      </aside>
    </div>
  )
}
