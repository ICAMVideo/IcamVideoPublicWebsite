/**
 * Continuously-moving horizontal image ribbon — image-forward, no text.
 * Pauses on hover. Duplicates the set once for a seamless -50% loop.
 */
type Img = { src: string; alt: string };

export function ImageMarquee({ images }: { images: Img[] }) {
  const track = [...images, ...images];
  return (
    <section className="overflow-hidden bg-[color:var(--ink)] py-4">
      <div className="marquee-group">
        <div className="marquee marquee--images">
          {track.map((im, i) => (
            <figure
              key={i}
              className="mx-2 h-[clamp(13rem,28vw,20rem)] w-[clamp(19rem,40vw,30rem)] shrink-0 overflow-hidden bg-[color:var(--ink)]"
            >
              <img
                src={im.src}
                alt={im.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
