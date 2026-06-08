import { FuelTankerInteractive } from "@/components/FuelTankerInteractive";
import { SiteFooter } from "@/components/MarketingSections";
import { SiteNav } from "@/components/SiteNav";
import { getSolutionBySlug, solutions } from "@/lib/solutions";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SolutionInteractivePage({ params }: Props) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) notFound();

  return (
    <main className="min-h-dvh bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteNav />

      <section className="relative overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--surface)] px-5 pb-14 pt-32 sm:px-8 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 hud-grid opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/solutions"
            className="font-hud text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-faint)] transition hover:text-[color:var(--foreground)]"
          >
            ← Back to solutions
          </Link>
          <p className="mt-4 font-hud text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--data-soft)]">
            {solution.name}
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
            Interactive telematics layout
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-[1.8] text-[color:var(--text-muted)] sm:text-lg">
            Click the circular hotspots on the layout to explore the key modules
            and capabilities for this solution profile.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <FuelTankerInteractive
            imageSrc={solution.imageSrc}
            imageAlt={solution.imageAlt}
            name={solution.name}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}
