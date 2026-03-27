import fs from "fs";
import path from "path";

const FRAME_EXT = /\.(webp|png|jpe?g|svg|avif|gif)$/i;

/**
 * Lists frame filenames under public/terminal (sorted). No manifest.json needed —
 * the server reads the folder when the page is built / requested.
 */
export function readTerminalManifest(): string[] {
  const terminalDir = path.join(process.cwd(), "public", "terminal");
  try {
    if (!fs.existsSync(terminalDir)) return [];
    return fs
      .readdirSync(terminalDir)
      .filter((f) => FRAME_EXT.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    return [];
  }
}
