import { readFileSync, writeFileSync } from "fs";
import path from "path";

function parseMap() {
  const svgPath = path.join(process.cwd(), "node_modules", "@svg-maps", "india", "india.svg");
  const svgContent = readFileSync(svgPath, "utf-8");

  const paths: Array<{ id: string; name: string; d: string }> = [];

  // Split content by `<path` to parse each element robustly
  const parts = svgContent.split("<path");
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const idMatch = part.match(/\bid="([^"]+)"/);
    const labelMatch = part.match(/(?:\baria-label|\bname)="([^"]+)"/);
    const dMatch = part.match(/\bd="([^"]+)"/s); // Match with word boundary \b to avoid matching trailing 'd' in 'id'

    if (idMatch && dMatch) {
      paths.push({
        id: idMatch[1].toUpperCase(),
        name: labelMatch ? labelMatch[1] : "",
        d: dMatch[1].replace(/\s+/g, " ").trim()
      });
    }
  }

  const outPath = path.join(process.cwd(), "data", "indiaMap.ts");
  writeFileSync(
    outPath,
    `export const INDIA_MAP_PATHS = ${JSON.stringify(paths, null, 2)} as const;\n`,
    "utf-8"
  );
  console.log(`Successfully parsed ${paths.length} states from India SVG map to data/indiaMap.ts`);
}

parseMap();
