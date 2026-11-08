"use client"

import axios from "axios"
import { useRef, useState } from "react"
import type { ChangeEvent } from "react"
import { UploadIcon } from "@/components/ui"
import { api } from "@/infra/api"
import type { Row } from "@/candidates/types"

interface Props { onDone: (rows: Row[], id: string) => void }

type State = { kind: "idle" } | { kind: "busy"; name: string } | { kind: "error"; msg: string } | { kind: "done"; msg: string }

export default function Upload({ onDone }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" })
  const input = useRef<HTMLInputElement>(null)
  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setState({ kind: "busy", name: file.name })
    const body = new FormData()
    body.append("file", file)
    try {
      const { data } = await api.post<{ id: string; rows: Row[] }>("/upload", body)
      const row = data.rows.find((r) => r.id === data.id)
      onDone(data.rows, data.id)
      const msg = row
        ? row.status === "failed"
          ? `${file.name} was saved but could not be read. Open it to see why.`
          : `${file.name} ranks #${row.lca.rank} of ${data.rows.length} for LCA and #${row.ux.rank} of ${data.rows.length} for UI/UX.`
        : "Uploaded."
      setState({ kind: "done", msg })
    } catch (err) {
      setState({ kind: "error", msg: axios.isAxiosError<{ error?: string }>(err) ? (err.response?.data?.error ?? "The upload failed. Please try again.") : "The upload failed. Please try again." })
    }
    if (input.current) input.current.value = ""
  }
  return (
    <div id="upload" className="rounded-sm bg-white p-6 text-body">
      <h2 className="text-xl font-semibold text-ink">Test a new resume</h2>
      <p className="mt-2 text-base">Upload a .docx, .pdf or .txt file. It is read, scored and ranked against the pile right away. Only this browser session can see it.</p>
      <label htmlFor="resume-file" className="mt-4 inline-flex items-center gap-2 rounded-pill bg-brand px-6 py-2.5 font-medium text-white transition-colors duration-150 hover:bg-brand-strong has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-strong">
        <UploadIcon />
        {state.kind === "busy" ? "Reading resume" : "Choose a resume"}
        <input id="resume-file" ref={input} type="file" accept=".docx,.pdf,.txt" onChange={pick} disabled={state.kind === "busy"} className="sr-only" />
      </label>
      <p role="status" aria-live="polite" className={`mt-3 min-h-6 text-base ${state.kind === "error" ? "font-medium text-bad" : "text-ink"}`}>
        {state.kind === "busy" ? `Reading ${state.name}` : state.kind === "idle" ? "" : state.msg}
      </p>
    </div>
  )
}
