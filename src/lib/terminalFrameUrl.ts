export function frameSrc(filename: string): string {
  return `/terminal/${encodeURIComponent(filename)}`;
}
