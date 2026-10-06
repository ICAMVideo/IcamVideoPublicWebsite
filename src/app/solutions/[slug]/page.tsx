import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryNav } from "@/components/story/StoryNav";
import { StoryFooter } from "@/components/story/StoryFooter";
import { Reveal } from "@/components/story/primitives";
import { getSolutionBySlug, solutions } from "@/lib/solutions";
import { solutionDetails, defaultDetail } from "@/lib/solutionDetail";
import { CONTACT } from "@/lib/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSolutionBySlug(slug);
  if (!s) return { title: "Solution — iCAM Video Telematics" };
  const d = solutionDetails[slug] ?? defaultDetail;
  return { title: `${s.name} — iCAM Video Telematics`, description: d.lede };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) notFound();
  const detail = solutionDetails[slug] ?? defaultDetail;

  const related = solutions
    .filter((s) => s.slug !== "all" && s.slug !== slug)
    .slice(0, 3);

  return (
    <main className="bg-[color:var(--paper)] text-[color:var(--ink)]">
      <StoryNav pinned />

      {/* hero */}
      <section className="mx-auto max-w-[1400px] px-5 pt-32 sm:px-8 sm:pt-40 lg:px-12">
        <Reveal>
          <Link
            href="/solutions"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]"
          >
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            All solutions
          </Link>
        </Reveal>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <Reveal>
              <h1
                className="font-display text-[color:var(--ink)]"
                style={{ fontSize: "clamp(2.4rem, 6vw, 4.6rem)", lineHeight: 1.02, letterSpacing: "-0.025em" }}
              >
                {solution.name}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="measure mt-6 text-lg leading-relaxed text-[color:var(--ink-2)]">{detail.lede}</p>
            </Reveal>
            <Reveal delay={0.16}>
              <a
                href="#fit"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent)]"
              >
                <span className="relative">
                  What iCAM fits
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-current opacity-40 transition-opacity group-hover:opacity-100" />
                </span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <figure className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-2)] shadow-[var(--shadow-soft)]">
              <img
                src={solution.imageSrc}
                alt={solution.imageAlt}
                decoding="async"
                className="h-full w-full object-contain p-8"
              />
            </figure>
          </Reveal>
        </div>
      </section>

      {/* what we fit */}
      <section id="fit" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-[clamp(4rem,10vh,8rem)] sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <h2
              className="font-display text-[color:var(--ink)]"
              style={{ fontSize: "clamp(1.9rem, 4.5vw, 3rem)", lineHeight: 1.05, letterSpacing: "-0.02em" }}
            >
              What we fit, and why.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[color:var(--ink-2)]">
              The same platform, tuned to this vehicle — video, tracking, safety
              AI and the 24/7 bureau, working as one.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <dl className="border-t border-[color:var(--line-2)]">
              {detail.focus.map((f, i) => (
                <div key={f.title} className="grid grid-cols-[auto_1fr] gap-x-6 border-b border-[color:var(--line)] py-7">
                  <span className="font-mono pt-1 text-xs text-[color:var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <dt className="font-display text-xl text-[color:var(--ink)]">{f.title}</dt>
                    <dd className="mt-2 max-w-xl text-base leading-relaxed text-[color:var(--ink-2)]">{f.body}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* related */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="border-t border-[color:var(--line)] pt-12">
          <h2 className="font-display text-2xl text-[color:var(--ink)]">Other vehicles</h2>
          <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {related.map((s) => (
              <Link key={s.slug} href={`/solutions/${s.slug}`} className="group block">
                <figure className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--paper-2)]">
                  <img
                    src={s.imageSrc}
                    alt={s.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-6 transition-transform duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.05]"
                  />
                </figure>
                <div className="mt-4 flex items-center justify-between border-t border-[color:var(--line)] pt-4">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-[color:var(--ink-3)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--accent)]">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* contact band — iCAM blue */}
      <section className="bg-[color:var(--accent)] text-[color:var(--on-image)]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
          <div className="max-w-2xl">
            <h2
              className="font-display"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.2rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
            >
              Scope it around your {solution.name.toLowerCase()} fleet.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[color:var(--on-image)]/80">
              Tell us what you run and where it goes — we&apos;ll spec the build.
            </p>
          </div>
          <a
            href={`mailto:${CONTACT.email}`}
            className="group inline-flex shrink-0 items-center gap-3 font-display text-xl sm:text-2xl"
          >
            <span className="relative">
              {CONTACT.email}
              <span className="absolute -bottom-1 left-0 h-px w-full bg-[color:var(--on-image)]/50 transition-opacity group-hover:bg-[color:var(--on-image)]" />
            </span>
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </a>
        </div>
      </section>

      <StoryFooter />
    </main>
  );
}

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}
