# iCAM Video Telematics — Design System

The marketing site lives in an **editorial light** world: warm paper ground, warm
near-black ink, one deep-navy accent, a high-contrast serif for display and a
clean grotesque for everything else. It is image-led and scroll-told — the home
page is a storyline, not a stack of feature cards. Documented from the shipped
build (`src/app/page.tsx` → `src/components/story/*`).

## Voice of the world
Calm, confident, premium. Quiet typography carries meaning; large verified
photography carries emotion. No cards as page structure, no eyebrow kickers, no
gradient text, no glass. Emphasis comes from scale, weight and whitespace.

## Color — warm paper + single navy accent
| Token | Value | Role |
|---|---|---|
| `--paper` | `#f6f3ec` | Page ground |
| `--paper-2` | `#efe9dd` | Image tiles / deeper band |
| `--paper-3` | `#e7e0d1` | Image placeholder ground |
| `--ink` | `#17140d` | Primary text (warm near-black) |
| `--ink-2` | `#4c463b` | Body / secondary (warm, never gray) |
| `--ink-3` | `#8a8173` | Captions, de-emphasis |
| `--line` | `rgba(23,20,13,.13)` | Hairline rules |
| `--line-2` | `rgba(23,20,13,.24)` | Stronger rule |
| `--accent` | `#090088` | The one accent — links, marks, index numbers |
| `--accent-2` | `#1613b0` | Accent hover |
| `--on-image` | `#f7f4ed` | Text over photography |

Single-accent strategy: colour never fills regions; the navy appears only as
links, step indices, spec bullets and hairline underlines. Over full-bleed photos
text is `--on-image` on a warm dark gradient scrim.

## Type
- **Display** — `Libre Caslon Display` (serif, 400). Hero `clamp(2.9rem, 9vw, 6rem)`; section headings `clamp(2rem, 5vw, 3.4rem)`; close `clamp(2.6rem, 7vw, 5.4rem)`. Tracking `-0.02em`, line-height ~1.0–1.06.
- **Text / UI** — `Hanken Grotesk` (400–700). Body `1rem–1.25rem`, line-height ~1.65, measure `≤66ch`.
- **Mono** — `IBM Plex Mono` for step indices and the ledger meta only.
- Line-by-line display reveal via `.reveal-line` (clip + translateY, Emil ease).

## Space & layout
- Container `max-width: 1400px`; gutters `px-5 / sm:px-8 / lg:px-12`.
- Section rhythm `clamp(5rem, 12–14vh, 9–10rem)` vertical; more space above a heading than below.
- Corners are square (editorial); no rounded cards. Depth is photography + hairlines, not boxes/shadows on content.
- `--shadow: 0 24px 60px -34px rgba(23,20,13,.45)` reserved for the one pinned image in the capability scene.

## Motion (Emil grammar)
- Ease `--ease: cubic-bezier(.23,1,.32,1)`, in-out `cubic-bezier(.77,0,.175,1)`.
- **Signature interaction:** the capability scene — a sticky image that cross-fades (opacity + 1.06→1 scale, 900ms) between See / Know / Prevent / Respond as the verbs scroll (IntersectionObserver, `-48%` root margin).
- Full-bleed images drift + scale against scroll (`ParallaxImage`, framer `useScroll`/`useTransform`).
- Display headings reveal line-by-line; body blocks fade + rise + de-blur once in view; spec numbers count up.
- Smooth scroll via **Lenis** (`SmoothScroll`). All motion respects `prefers-reduced-motion` (fades kept, movement dropped).

## Browser surfaces (themed)
Selection → accent on `--on-image`; focus ring → 2px accent, 3px offset; custom scrollbar on paper with `--line-2` thumb; links inherit colour, underline via animated hairline.

## Components (`src/components/story/`)
`StoryNav` (transparent over hero → paper/blur after 0.7vh) · `StoryHero` · `CapabilityScene` (sticky) · `ParallaxImage` · `LineReveal` · `Reveal` · `Counter`.

## Imagery
Full-bleed WebP in `public/story/` (hero, see, know, prevent, respond, footprint, mining, close) — **Unsplash-licensed placeholders** standing in for iCAM-owned photography (provenance embedded in each file). Vehicle-type images under `public/<Type>/` are existing iCAM assets.

## Scope
This world governs every page: the home storyline (`/`), the solutions index
(`/solutions`) and the per-vehicle detail pages (`/solutions/[slug]`), all using
`StoryNav` + `StoryFooter`. The previous designs' components and their legacy
tokens/utilities have been removed.
