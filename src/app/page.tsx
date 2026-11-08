import Dashboard from "@/components/Dashboard"
import { listRows } from "@/candidates/queries"
import { readSid } from "@/infra/http"

export const dynamic = "force-dynamic"

export default async function Home() {
  return <Dashboard initial={await listRows(await readSid())} />
}
