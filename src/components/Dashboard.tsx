"use client"

import Link from "next/link"
import { useState } from "react"
import Detail from "@/components/Detail"
import Upload from "@/components/Upload"
import { AlertIcon, Bar, LabelBadge } from "@/components/ui"
import { roles } from "@/jobs/roles"
import { api } from "@/infra/api"
import type { Row } from "@/candidates/types"
import type { Role } from "@/scoring/types"

type Sort = "score" | "years" | "met"
type View = "all" | "match" | "both" | "uncertain" | "issues" | "mine"

const views: { id: View; name: string }[] = [
  { id: "all", name: "Everyone" },
  { id: "match", name: "Classified for this role" },
  { id: "both", name: "Both roles" },
  { id: "uncertain", name: "Uncertain" },
  { id: "issues", name: "Has reading issues" },
  { id: "mine", name: "My uploads" },
]

const sorts: { id: Sort; name: string }[] = [
  { id: "score", name: "Score" },
  { id: "years", name: "Relevant years" },
  { id: "met", name: "Must-haves met" },
]

export default function Dashboard({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial)
  const [role, setRole] = useState<Role>("lca")
  const [view, setView] = useState<View>("all")
  const [sort, setSort] = useState<Sort>("score")
  const [q, setQ] = useState("")
  const [open, setOpen] = useState<string | null>(null)
  const info = roles[role]
  const count = (fn: (r: Row) => boolean) => rows.filter(fn).length
  const stats = [
    { n: rows.length, t: "resumes" },
    { n: count((r) => r.label === "lca"), t: "LCA matches" },
    { n: count((r) => r.label === "ux"), t: "UI/UX matches" },
    { n: count((r) => r.label === "both"), t: "match both" },
    { n: count((r) => r.label === "uncertain"), t: "uncertain" },
    { n: count((r) => r.issues > 0), t: "with reading issues" },
  ]
  const byView = rows.filter((r) => {
    if (view === "match") return r.label === role || r.label === "both"
    if (view === "both") return r.label === "both"
    if (view === "uncertain") return r.label === "uncertain"
    if (view === "issues") return r.issues > 0
    if (view === "mine") return r.mine
    return true
  })
  const term = q.trim().toLowerCase()
  const found = term ? byView.filter((r) => `${r.tag} ${r.title} ${r.lca.evidence.join(" ")} ${r.ux.evidence.join(" ")}`.toLowerCase().includes(term)) : byView
  const shown = found.toSorted((a, b) => {
    if (sort === "years") return b[role].years - a[role].years || a[role].rank - b[role].rank
    if (sort === "met") return b[role].met - a[role].met || a[role].rank - b[role].rank
    return a[role].rank - b[role].rank
  })
  const done = (next: Row[], id: string) => {
    setRows(next)
    setOpen(id)
  }
  const remove = async (id: string) => {
    await api.delete(`/candidates/${id}`)
    const { data } = await api.get<Row[]>("/candidates")
    setRows(data)
    setOpen(null)
  }
  return (
    <>
      <section className="on-dark bg-night text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight">Resume ranking for two roles</h1>
            <p className="mt-4 max-w-xl text-lg text-white/80">Every resume is read, classified and ranked against the LCA Consultant and UI/UX Intern job descriptions. Open any candidate to see the evidence behind the score.</p>
            <dl className="mt-8 grid grid-cols-3 gap-x-6 gap-y-5 sm:max-w-lg">
              {stats.map((s) => (
                <div key={s.t}>
                  <dd className="text-3xl font-semibold text-brand-soft">{s.n}</dd>
                  <dt className="text-sm text-white/80">{s.t}</dt>
                </div>
              ))}
            </dl>
          </div>
          <Upload onDone={done} />
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div role="tablist" aria-label="Job profile" className="flex flex-wrap gap-3">
          {(["lca", "ux"] as const).map((r) => (
            <button key={r} type="button" role="tab" aria-selected={role === r} onClick={() => setRole(r)} className={`rounded-pill px-6 py-2.5 font-medium transition-colors duration-150 ${role === r ? "bg-brand text-white" : "bg-wash text-ink hover:bg-line"}`}>
              {roles[r].name}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{info.name}</h2>
            <p className="mt-1 text-sm text-muted">{info.place}</p>
            <p className="mt-2">{info.intro}</p>
          </div>
          <div>
            <h3 className="font-medium text-ink">What the job asks for</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">{info.asks.map((a) => <li key={a}>{a}</li>)}</ul>
            <Link href="/method" className="mt-3 inline-block font-medium text-brand-strong underline underline-offset-4">How the score is calculated</Link>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-end gap-4">
          <label className="grow text-sm font-medium text-ink sm:max-w-xs">
            Search
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name tag, title or evidence" className="mt-1 block w-full rounded-pill bg-wash px-4 py-2 text-base font-normal text-ink placeholder:text-muted" />
          </label>
          <label className="text-sm font-medium text-ink">
            Show
            <select value={view} onChange={(e) => setView(e.target.value as View)} className="mt-1 block rounded-pill bg-wash px-4 py-2 text-base font-normal text-ink">
              {views.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-ink">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="mt-1 block rounded-pill bg-wash px-4 py-2 text-base font-normal text-ink">
              {sorts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <p className="pb-2 text-sm text-muted" role="status">{shown.length} of {rows.length} shown</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left">
            <caption className="sr-only">Candidates ranked for {info.name}</caption>
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th scope="col" className="py-3 pr-3 font-medium">Rank</th>
                <th scope="col" className="py-3 pr-3 font-medium">Candidate</th>
                <th scope="col" className="py-3 pr-3 font-medium">Classified</th>
                <th scope="col" className="py-3 pr-3 font-medium">Score</th>
                <th scope="col" className="hidden py-3 pr-3 font-medium md:table-cell">Evidence</th>
                <th scope="col" className="hidden py-3 pr-3 font-medium sm:table-cell">{info.yearsLabel}</th>
                <th scope="col" className="hidden py-3 pr-3 font-medium sm:table-cell">Must-haves</th>
                <th scope="col" className="py-3 font-medium">Reading</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer border-b border-line transition-colors duration-150 hover:bg-wash">
                  <td className="py-3 pr-3 font-semibold text-ink">#{r[role].rank}</td>
                  <td className="py-3 pr-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(r.id) }} aria-haspopup="dialog" className="text-left font-medium text-ink underline-offset-4 hover:underline">{r.tag}</button>
                    <span className="block max-w-56 truncate text-sm text-muted">{r.title || "No title found"}</span>
                    {r.mine && <span className="text-sm font-medium text-brand-strong">Your upload</span>}
                  </td>
                  <td className="py-3 pr-3"><LabelBadge label={r.label} /></td>
                  <td className="w-32 py-3 pr-3"><span className="font-semibold text-ink">{r[role].score}</span><Bar value={r[role].score} /></td>
                  <td className="hidden max-w-64 py-3 pr-3 md:table-cell">{r[role].evidence.length ? r[role].evidence.slice(0, 3).join(", ") : <span className="text-muted">No matching evidence</span>}</td>
                  <td className="hidden py-3 pr-3 sm:table-cell">{r[role].years}</td>
                  <td className="hidden py-3 pr-3 sm:table-cell">{r[role].met} of {r[role].total}</td>
                  <td className="py-3">
                    {r.status === "failed" ? <span className="inline-flex items-center gap-1 font-medium text-bad"><AlertIcon />Unreadable</span> : r.issues ? <span className="inline-flex items-center gap-1 font-medium text-warn"><AlertIcon />{r.issues} to check</span> : <span className="text-muted">Clean</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="py-10 text-center text-muted">No candidates match these filters. Clear the search or choose Everyone.</p>}
        </div>
      </main>
      {open && <Detail key={open} id={open} role={role} onClose={() => setOpen(null)} onRemove={remove} />}
    </>
  )
}
