type SizedBitmap = ImageBitmap | HTMLImageElement | HTMLCanvasElement;

/**
 * CSS `object-cover`–style draw into a rect (cw × ch), centered.
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: SizedBitmap,
  cw: number,
  ch: number
): void {
  const iw = image.width;
  const ih = image.height;
  if (iw <= 0 || ih <= 0) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) * 0.5;
  const dy = (ch - dh) * 0.5;
  ctx.drawImage(image, dx, dy, dw, dh);
}

/**
 * Cover draw with a configurable focal-point bias.
 * `fy` 0 = pin to top, 0.5 = center (default cover), 1 = pin to bottom.
 * On portrait phones, shifting the focal point upward (fy ~0.35) keeps the
 * subject in frame instead of cutting it off at the top.
 */
export function drawImageCoverFocal(
  ctx: CanvasRenderingContext2D,
  image: SizedBitmap,
  cw: number,
  ch: number,
  fx = 0.5,
  fy = 0.5
): void {
  const iw = image.width;
  const ih = image.height;
  if (iw <= 0 || ih <= 0) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) * fx;
  const dy = (ch - dh) * fy;
  ctx.drawImage(image, dx, dy, dw, dh);
}
