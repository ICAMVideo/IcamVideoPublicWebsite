"use client";

import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type DeskMenuId = "platform" | "solutions";

function ChevronDown({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg
      className={`${className ?? ""} transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const linkClass =
  "flex items-center gap-1 text-[13px] font-medium text-zinc-300 transition-colors hover:text-white";

type FlyoutItem = { href: string; title: string; description: string };

const platformItems: FlyoutItem[] = [
  {
    href: "/#services",
    title: "Video telematics",
    description: "In-cab capture, cloud retention, and structured review",
  },
  {
    href: "/#services",
    title: "Fleet tracking",
    description: "Live GPS, routes, and a single operational picture",
  },
  {
    href: "/#services",
    title: "Driver safety",
    description: "AI-assisted signals, prioritised alerts, coaching workflows",
  },
];

const solutionsItems: FlyoutItem[] = [
  {
    href: "/#overview",
    title: "Fleet operators",
    description: "Regional and mixed fleets with clear day-to-day workflows",
  },
  {
    href: "/#overview",
    title: "Enterprise",
    description: "Scale, roles, and reporting for distributed organisations",
  },
];

function FlyoutPanel({
  id,
  label,
  items,
  onNavigate,
}: {
  id: string;
  label: string;
  items: FlyoutItem[];
  onNavigate: () => void;
}) {
  return (
    <div
      id={id}
      role="menu"
      className="absolute left-0 top-[calc(100%+10px)] z-[80] w-[min(calc(100vw-2rem),320px)] overflow-hidden rounded-xl border border-zinc-600/50 bg-zinc-900/98 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-xl"
    >
      <div className="border-b border-zinc-700/60 bg-zinc-950/80 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-xs leading-snug text-zinc-400">
          {label === "Platform"
            ? "Core capabilities across capture, location, and safety."
            : "How we support different fleet operating models."}
        </p>
      </div>
      <ul className="p-2">
        {items.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              role="menuitem"
              className="group block rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.06]"
              onClick={onNavigate}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-semibold text-white group-hover:text-[color:var(--accent-on-dark)]">
                  {item.title}
                </span>
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 12l4-4-4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-zinc-500 group-hover:text-zinc-400">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const mobileLinkClass =
  "block py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:text-white";

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deskMenu, setDeskMenu] = useState<DeskMenuId | null>(null);
  const [mobileSub, setMobileSub] = useState<DeskMenuId | null>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileSub(null);
  }, []);

  const closeDesk = useCallback(() => setDeskMenu(null), []);

  const toggleDesk = useCallback((id: DeskMenuId) => {
    setDeskMenu((cur) => (cur === id ? null : id));
  }, []);

  const platformMenuId = useId();
  const solutionsMenuId = useId();

  useEffect(() => {
    if (!mobileOpen && !deskMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMobile();
        closeDesk();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, deskMenu, closeMobile, closeDesk]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [mobileOpen]);

  const headerBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deskMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = headerBarRef.current;
      if (el && !el.contains(e.target as Node)) {
        setDeskMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [deskMenu]);

  return (
    <>
      {deskMenu ? (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 z-[58] cursor-default bg-black/35 backdrop-blur-[2px]"
          onClick={closeDesk}
        />
      ) : null}

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-[60]">
        <div
          ref={headerBarRef}
          className="pointer-events-auto relative border-b border-[color:var(--nav-border)] bg-[color:var(--nav-bg)] backdrop-blur-xl backdrop-saturate-150"
          style={{ WebkitBackdropFilter: "blur(16px)" }}
        >
          <div className="mx-auto flex h-[3.25rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6 lg:px-8">
            <Link
              href="/#overview"
              className="flex shrink-0 items-center gap-2.5 text-white"
              aria-label="iCAM Video Telematics, home"
              onClick={() => {
                closeMobile();
                closeDesk();
              }}
            >
              <BrandLogo className="h-8 w-auto sm:h-9" alt="" />
              <span className="text-[15px] font-semibold tracking-tight">
                iCAM Video
              </span>
            </Link>

            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Primary"
            >
              <div className="relative px-3">
                <button
                  type="button"
                  className={`${linkClass} rounded-md px-1 py-1.5 outline-none ring-[color:var(--accent)] focus-visible:ring-2 ${deskMenu === "platform" ? "text-white" : ""}`}
                  aria-expanded={deskMenu === "platform"}
                  aria-haspopup="menu"
                  aria-controls={platformMenuId}
                  onClick={() => toggleDesk("platform")}
                >
                  Platform
                  <ChevronDown open={deskMenu === "platform"} />
                </button>
                {deskMenu === "platform" ? (
                  <FlyoutPanel
                    id={platformMenuId}
                    label="Platform"
                    items={platformItems}
                    onNavigate={closeDesk}
                  />
                ) : null}
              </div>

              <div className="relative px-3">
                <button
                  type="button"
                  className={`${linkClass} rounded-md px-1 py-1.5 outline-none ring-[color:var(--accent)] focus-visible:ring-2 ${deskMenu === "solutions" ? "text-white" : ""}`}
                  aria-expanded={deskMenu === "solutions"}
                  aria-haspopup="menu"
                  aria-controls={solutionsMenuId}
                  onClick={() => toggleDesk("solutions")}
                >
                  Solutions
                  <ChevronDown open={deskMenu === "solutions"} />
                </button>
                {deskMenu === "solutions" ? (
                  <FlyoutPanel
                    id={solutionsMenuId}
                    label="Solutions"
                    items={solutionsItems}
                    onNavigate={closeDesk}
                  />
                ) : null}
              </div>

              <Link
                href="/#services"
                className={`${linkClass} px-3 py-1.5`}
                onClick={closeDesk}
              >
                Resources
              </Link>
              <Link
                href="/#overview"
                className={`${linkClass} px-3 py-1.5`}
                onClick={closeDesk}
              >
                About
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/#contact"
                className="hidden items-center bg-[color:var(--accent)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white shadow-sm transition-colors hover:bg-[color:var(--accent-bright)] sm:inline-flex"
                onClick={() => {
                  closeMobile();
                  closeDesk();
                }}
              >
                Contact
              </Link>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-zinc-200 transition-colors hover:bg-white/5 lg:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className="sr-only">Menu</span>
                {mobileOpen ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4 7H20M4 12H20M4 17H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-4 pt-[4.5rem] sm:p-6 sm:pt-[4.75rem]">
            <div
              className="pointer-events-auto max-h-[min(100dvh-5rem,640px)] w-full max-w-[min(100%,22rem)] overflow-y-auto border border-zinc-700/80 bg-[color:var(--nav-sheet)] shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 border-b border-zinc-700/60 p-5 pb-4">
                <Link
                  href="/#overview"
                  className="flex items-center gap-2.5 text-white"
                  aria-label="iCAM Video Telematics, home"
                  onClick={closeMobile}
                >
                  <BrandLogo
                    className="h-8 w-auto shrink-0"
                    alt=""
                    priority={false}
                  />
                  <span className="text-base font-semibold tracking-tight">
                    iCAM Video
                  </span>
                </Link>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-zinc-200 transition-colors hover:bg-white/5"
                  aria-label="Close menu"
                  onClick={closeMobile}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col px-5 pb-2" aria-label="Mobile">
                <div className="border-b border-zinc-700/50">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium text-white"
                    aria-expanded={mobileSub === "platform"}
                    onClick={() =>
                      setMobileSub((s) =>
                        s === "platform" ? null : "platform"
                      )
                    }
                  >
                    Platform
                    <ChevronDown
                      className="text-zinc-400"
                      open={mobileSub === "platform"}
                    />
                  </button>
                  {mobileSub === "platform" ? (
                    <ul className="space-y-1 pb-4 pl-1">
                      {platformItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href}
                            className="block rounded-lg py-2 pl-3 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                            onClick={closeMobile}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="border-b border-zinc-700/50">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium text-white"
                    aria-expanded={mobileSub === "solutions"}
                    onClick={() =>
                      setMobileSub((s) =>
                        s === "solutions" ? null : "solutions"
                      )
                    }
                  >
                    Solutions
                    <ChevronDown
                      className="text-zinc-400"
                      open={mobileSub === "solutions"}
                    />
                  </button>
                  {mobileSub === "solutions" ? (
                    <ul className="space-y-1 pb-4 pl-1">
                      {solutionsItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            href={item.href}
                            className="block rounded-lg py-2 pl-3 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                            onClick={closeMobile}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <Link
                  href="/#services"
                  className={`${mobileLinkClass} border-b border-zinc-700/50`}
                  onClick={closeMobile}
                >
                  Resources
                </Link>
                <Link href="/#overview" className={mobileLinkClass} onClick={closeMobile}>
                  About
                </Link>
              </nav>

              <div className="p-5 pt-2">
                <Link
                  href="/#contact"
                  className="flex w-full items-center justify-center bg-[color:var(--accent)] py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[color:var(--accent-bright)]"
                  onClick={closeMobile}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
