import { cookies } from "next/headers"
import { z } from "zod"

type RouteHandler<Context> = (req: Request, ctx: Context) => Promise<Response>

export function withErrorHandling<Context = unknown>(handler: RouteHandler<Context>): RouteHandler<Context> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      console.error(err)
      return Response.json({ error: err instanceof Error ? err.message : "something went wrong" }, { status: 500 })
    }
  }
}

export const readSid = async () => (await cookies()).get("sid")?.value

export async function ensureSid() {
  const jar = await cookies()
  const sid = jar.get("sid")?.value ?? crypto.randomUUID()
  jar.set("sid", sid, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" })
  return sid
}

export const idSchema = z.uuid("Please enter a valid candidate id")

export const bad = (error: unknown, status = 400) => Response.json({ error }, { status })
