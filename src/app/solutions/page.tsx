import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteNav } from "@/components/SiteNav";

type SolutionCard = {
  name: string;
  href?: string;
  featured?: boolean;
  accent?: boolean;
};

const solutions: SolutionCard[] = [
  { name: "Tipper / Side Tipper" },
  { name: "Tautliner / Box Body" },
  { name: "Fuel Tanker", href: "/solutions/fuel-tanker", featured: true },
  { name: "Bus" },
  { name: "Yellow Metal / Mining" },
  { name: "Taxi / Car" },
  { name: "Ambulance / Security" },
  { name: "All", accent: true },
] as const;

export default function SolutionsPage() {
  return (
    <main className="min-h-dvh bg-[color:var(--background)] text-zinc-900">
      <SiteNav />

      <section className="border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 pb-14 pt-32 sm:px-8 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
            Our Solutions
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Vehicle-specific telematics configurations
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-[1.75] text-zinc-600 sm:text-lg">
            Solution packs are structured by fleet type so hardware, camera
            configuration, and platform workflows align with real operating
            conditions.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((item, i) => {
            const card = (
              <article
                className={`rounded-2xl border p-6 shadow-[0_1px_0_rgba(15,20,25,0.04)] transition ${
                  item.accent
                  ? "border-[color:var(--accent)] bg-[color:var(--surface-elevated)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)]"
                } ${item.href ? "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-20px_rgba(15,23,42,0.45)]" : ""}`}
              >
                <p className="text-xs font-semibold tabular-nums text-zinc-400">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{item.name}</h2>
                {item.featured ? (
                  <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white p-3">
                    <Image
                      src="/FuelSolution/truck.png"
                      alt="Fuel tanker telematics overview"
                      width={1200}
                      height={860}
                      className="h-auto w-full rounded-lg object-contain"
                    />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Open interactive view
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-2">
                    <div className="h-2.5 w-5/6 rounded bg-zinc-200" />
                    <div className="h-2.5 w-2/3 rounded bg-zinc-200/80" />
                  </div>
                )}
              </article>
            );

            if (!item.href) return <div key={item.name}>{card}</div>;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                {card}
              </Link>
            );
          })}
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
