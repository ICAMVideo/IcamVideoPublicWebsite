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
