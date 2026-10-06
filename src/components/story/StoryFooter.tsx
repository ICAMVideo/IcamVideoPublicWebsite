import Link from "next/link";
import { CONTACT, TAGLINE } from "@/lib/brand";

/** Editorial footer for inner pages (paper ground). The home page closes on
 *  its own full-bleed footer inside the contact section. */
export function StoryFooter() {
  return (
    <footer className="border-t border-[color:var(--line)] bg-[color:var(--paper-2)]">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-2xl leading-none">iCAM</span>
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[color:var(--ink-3)]">
                Video Telematics
              </span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--ink-2)]">
              Proudly South African video telematics — video, GPS, AI safety and
              24/7 monitoring for the fleets that keep the region moving.
            </p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--accent)]"
            >
              <span className="relative">
                {CONTACT.email}
                <span className="absolute -bottom-1 left-0 h-px w-full bg-current opacity-40 transition-opacity group-hover:opacity-100" />
              </span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <nav className="text-sm" aria-label="Footer">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-3)]">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-[color:var(--ink-2)]">
              <li><Link href="/#capabilities" className="transition-colors hover:text-[color:var(--ink)]">What we do</Link></li>
              <li><Link href="/solutions" className="transition-colors hover:text-[color:var(--ink)]">Solutions</Link></li>
              <li><Link href="/#footprint" className="transition-colors hover:text-[color:var(--ink)]">Coverage</Link></li>
              <li><Link href="/#contact" className="transition-colors hover:text-[color:var(--ink)]">Get in touch</Link></li>
            </ul>
          </nav>

          <div className="text-sm">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-3)]">
              Contact
            </p>
            <ul className="mt-5 space-y-3 text-[color:var(--ink-2)]">
              <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-[color:var(--ink)]">{CONTACT.phone}</a></li>
              <li><a href={`tel:${CONTACT.phoneAlt.replace(/\s/g, "")}`} className="transition-colors hover:text-[color:var(--ink)]">{CONTACT.phoneAlt}</a></li>
              <li className="leading-relaxed text-[color:var(--ink-3)]">{CONTACT.addressLines.join(", ")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-[color:var(--line)] pt-6 text-xs text-[color:var(--ink-3)] sm:flex-row sm:items-center sm:justify-between">
          <span>{TAGLINE} · Proudly South African</span>
          <span>© {new Date().getFullYear()} iCAM Video Telematics. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
