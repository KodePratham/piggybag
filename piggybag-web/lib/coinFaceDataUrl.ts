import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cached: string | null = null;

export async function getCoinFaceDataUrl() {
  if (cached) return cached;

  const buffer = await readFile(join(process.cwd(), "public/coin-face.png"));
  cached = `data:image/png;base64,${buffer.toString("base64")}`;
  return cached;
}
