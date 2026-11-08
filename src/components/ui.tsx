import type { ReactNode } from "react"
import { labels } from "@/jobs/roles"
import type { Label } from "@/scoring/types"

const icon = "size-4 shrink-0"

export const CheckIcon = () => (
  <svg className={icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
)

export const AlertIcon = () => (
  <svg className={icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 2l6.5 11.5h-13zM8 6.5v3M8 11.5v.01" /></svg>
)

export const MinusIcon = () => (
  <svg className={icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3.5 8h9" /></svg>
)

export const CloseIcon = () => (
  <svg className={icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
)

export const UploadIcon = () => (
  <svg className={icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 13.5h11" /></svg>
)

const tone: Record<Label, string> = {
  lca: "bg-brand text-white",
  ux: "bg-brand-strong text-white",
  both: "bg-ink text-white",
  uncertain: "bg-wash text-muted",
}

export const LabelBadge = ({ label }: { label: Label }) => (
  <span className={`inline-block rounded-pill px-3 py-0.5 text-sm font-medium ${tone[label]}`}>{labels[label]}</span>
)

export const Bar = ({ value, max = 100 }: { value: number; max?: number }) => (
  <span className="block h-1.5 w-full overflow-hidden rounded-pill bg-line" aria-hidden="true">
    <span className="block h-full rounded-pill bg-brand" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
  </span>
)

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-8">
    <h3 className="text-lg font-semibold text-ink">{title}</h3>
    <div className="mt-3">{children}</div>
  </section>
)
