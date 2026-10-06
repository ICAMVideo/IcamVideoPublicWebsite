/**
 * Moving "trusted by" ribbon — a logo wall of partner/customer marks on
 * uniform white chips (so different logo backgrounds stay consistent on the
 * paper ground).
 *
 * To add/replace a logo: drop an official, rights-cleared file into
 * /public/partners/ and set its `logo` path below. Entries without a `logo`
 * show a clean text lockup (no broken images, no unofficial copies shipped).
 *   e.g. { name: "Engen", logo: "/partners/engen.svg" }
 */
const PARTNERS: { name: string; logo?: string }[] = [
  { name: "Engen", logo: "/partners/engen.png" },
  { name: "TotalEnergies", logo: "/partners/totalenergies.svg" },
  { name: "Lieben Group", logo: "/partners/lieben.png" },
];

function Chip({ name, logo }: { name: string; logo?: string }) {
  return (
    <span className="mx-3 inline-flex h-20 min-w-[11rem] items-center justify-center rounded-xl bg-white px-8 shadow-[var(--shadow-soft)]">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} className="max-h-12 w-auto object-contain" draggable={false} />
      ) : (
        <span className="whitespace-nowrap font-display text-xl text-[color:var(--ink)]/70 sm:text-2xl">
          {name}
        </span>
      )}
    </span>
  );
}

export function PartnersRibbon() {
  const seq = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  const track = [...seq, ...seq];

  return (
    <section className="border-y border-[color:var(--line)] bg-[color:var(--paper)] py-12 sm:py-16">
      <p className="mb-9 px-5 text-center text-sm font-medium text-[color:var(--ink-3)] sm:px-8">
        Trusted by fleets and fuel operators across Southern Africa
      </p>
      <div className="marquee-group relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[color:var(--paper)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[color:var(--paper)] to-transparent" />
        <div className="marquee marquee--partners" aria-hidden>
          {track.map((p, i) => (
            <Chip key={i} name={p.name} logo={p.logo} />
          ))}
        </div>
        <span className="sr-only">
          Partners: {PARTNERS.map((p) => p.name).join(", ")}
        </span>
      </div>
    </section>
  );
}
