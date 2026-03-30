import { BrandLogo } from "@/components/BrandLogo";
import { FuelTankerInteractive } from "@/components/FuelTankerInteractive";
import { SiteNav } from "@/components/SiteNav";
import Link from "next/link";

export default function FuelTankerSolutionPage() {
  return (
    <main className="min-h-dvh bg-[color:var(--background)] text-zinc-900">
      <SiteNav />

      <section className="border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 pb-14 pt-32 sm:px-8 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/solutions"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 transition hover:text-zinc-800"
          >
            ← Back to solutions
          </Link>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
            Fuel tanker
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Interactive telematics layout
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-[1.75] text-zinc-600 sm:text-lg">
            Click the circular hotspots on the truck map to explore key modules
            and capabilities used in fuel tanker deployments.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <FuelTankerInteractive />
        </div>
      </section>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex shrink-0" aria-hidden>
                <BrandLogo className="h-10 w-auto sm:h-11" alt="" priority={false} />
              </span>
              <span className="text-sm font-semibold text-white">
                iCAM Video Telematics
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              South African provider of integrated video telematics, GPS tracking,
              AI-assisted safety, and fleet intelligence.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm text-zinc-500 sm:items-end">
            <a
              href="mailto:hello@icamvideo.com"
              className="text-zinc-400 transition hover:text-white"
            >
              hello@icamvideo.com
            </a>
            <span className="text-zinc-600">
              © {new Date().getFullYear()} iCAM Video. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
