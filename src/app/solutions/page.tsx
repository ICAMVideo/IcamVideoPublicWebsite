import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/MarketingSections";
import { SiteNav } from "@/components/SiteNav";
import { solutions } from "@/lib/solutions";

export default function SolutionsPage() {
  return (
    <main className="min-h-dvh bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteNav />

      <section className="relative overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 hud-grid opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-hud text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--data-soft)]">
            Our Solutions
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
            Vehicle-specific telematics configurations
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-[1.8] text-[color:var(--text-muted)] sm:text-lg">
            Solution packs are structured by fleet type so hardware, camera
            configuration and platform workflows align with real operating
            conditions — from tippers and tankers to mining, taxis and buses.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((item, i) => (
            <Link
              key={item.name}
              href={`/solutions/${item.slug}`}
              className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            >
              <article
                className={`hud-corners group h-full overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1 ${
                  item.slug === "all"
                    ? "border-[color:var(--accent)] bg-[color:var(--surface-elevated)]"
                    : "border-[color:var(--border)] bg-[color:var(--surface)] hover:border-[color:var(--accent)]"
                }`}
              >
                <p className="font-hud text-xs font-semibold tabular-nums text-[color:var(--text-faint)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
                  {item.name}
                </h2>
                <div className="mt-5 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 hud-grid opacity-40" />
                  </div>
                  <p className="font-hud mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--data-soft)]">
                    Open interactive view →
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
