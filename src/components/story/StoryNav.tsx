"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/#capabilities", label: "What we do" },
  { href: "/solutions", label: "Solutions" },
  { href: "/#footprint", label: "Coverage" },
];

/** Shared editorial header. On the home page it rides transparent over the
 *  hero, then turns solid on scroll. On inner pages pass `pinned` so it is
 *  solid (ink on paper) from the first paint. */
export function StoryNav({ pinned = false }: { pinned?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const solid = pinned || scrolled;

  useEffect(() => {
    if (pinned) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pinned]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      style={{
        background: solid ? "color-mix(in srgb, var(--paper) 86%, transparent)" : "transparent",
        backdropFilter: solid ? "blur(10px)" : "none",
        WebkitBackdropFilter: solid ? "blur(10px)" : "none",
        borderBottom: solid ? "1px solid var(--line)" : "1px solid transparent",
        color: solid ? "var(--ink)" : "var(--on-image)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-baseline gap-2.5" aria-label="iCAM Video Telematics home">
          <span className="font-display text-2xl leading-none tracking-[-0.01em]">iCAM</span>
          <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.26em] opacity-70 sm:inline">
            Video Telematics
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative text-sm font-medium opacity-80 transition-opacity hover:opacity-100"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-current transition-[width] duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <Link
          href="/#contact"
          className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--on-image)] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] transition-colors duration-300 hover:bg-[color:var(--accent-2)]"
        >
          Get in touch
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </header>
  );
}
