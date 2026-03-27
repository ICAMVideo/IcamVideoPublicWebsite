import { HomeExperience } from "@/components/HomeExperience";
import { readTerminalManifest } from "@/lib/terminalFrames";

/** Re-read `public/terminal` on each request so new frames show up in dev without rebuilding. */
export const dynamic = "force-dynamic";

export default function Home() {
  const frames = readTerminalManifest();
  return <HomeExperience frames={frames} />;
}
