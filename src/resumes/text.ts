import mammoth from "mammoth"
import { extractText, getDocumentProxy } from "unpdf"

export type Kind = "docx" | "pdf" | "txt"

export const kindOf = (name: string): Kind | null => {
  const ext = name.toLowerCase().split(".").pop()
  return ext === "docx" || ext === "pdf" || ext === "txt" ? ext : null
}

const clean = (raw: string) =>
  raw
    .replace(/\r/g, "")
    .replace(/[ \t]/g, " ")
    .split("\n")
    .map((l) => l.replace(/ {2,}/g, "   ").trim())
    .filter(Boolean)
    .join("\n")

export async function readText(buf: Buffer, kind: Kind) {
  if (kind === "txt") return clean(buf.toString("utf8"))
  if (kind === "docx") return clean((await mammoth.extractRawText({ buffer: buf })).value)
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const { text } = await extractText(pdf, { mergePages: true })
  return clean(text)
}
