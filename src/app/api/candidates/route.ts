import { listRows } from "@/candidates/queries"
import { readSid, withErrorHandling } from "@/infra/http"

export const GET = withErrorHandling(async () => Response.json(await listRows(await readSid())))
