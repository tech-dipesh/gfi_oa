import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import "@fontsource-variable/inter"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ranker",
  description: "Extract And Give a Ranking",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <header className="on-dark bg-night text-white">
          <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg font-semibold">Growth For Impact <span className="font-normal text-brand-soft">Ranker</span></Link>
            <div className="flex gap-5 text-base">
              <Link href="/" className="underline-offset-4 hover:underline">Ranking</Link>
              <Link href="/method" className="underline-offset-4 hover:underline">How it works</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted sm:px-6">Scores are a first-pass aid. A person should read the resume before any decision.</footer>
      </body>
    </html>
  )
}
