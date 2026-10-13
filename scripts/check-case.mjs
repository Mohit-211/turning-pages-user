// Fails when a local import's path differs in case from the file on disk.
// Windows and macOS ignore the difference, but the Linux server does not, so the build breaks there.
// Usage: npm run check:case
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanDirs = ["src", "index.html"];
const exts = ["", ".js", ".jsx", ".ts", ".tsx", ".mjs", ".scss", ".css", ".json"];
const indexFiles = ["index.js", "index.jsx", "index.ts", "index.tsx"];

const codePatterns = [
  /\bimport\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g,
  /\bexport\s+[^'"]*?\sfrom\s+['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const stylePatterns = [
  /@(?:use|import|forward)\s+['"]([^'"]+)['"]/g,
  /url\(\s*['"]?([^'")]+)['"]?\s*\)/g,
];
const htmlPatterns = [/\b(?:src|href)=["']([^"']+)["']/g];

// Spelling of a path as it exists on disk, or null if it doesn't exist (case-insensitively).
function actualPath(abs) {
  let cur = root;
  const parts = [];
  for (const seg of path.relative(root, abs).split(path.sep)) {
    let entries;
    try {
      entries = fs.readdirSync(cur);
    } catch {
      return null;
    }
    const match = entries.includes(seg) ? seg : entries.find((e) => e.toLowerCase() === seg.toLowerCase());
    if (!match) return null;
    parts.push(match);
    cur = path.join(cur, match);
  }
  return parts.join("/");
}

function candidates(base, isStyle) {
  const bases = isStyle ? [base, path.join(path.dirname(base), "_" + path.basename(base))] : [base];
  return bases.flatMap((b) => [...exts.map((e) => b + e), ...indexFiles.map((i) => path.join(b, i))]);
}

function collectFiles(p, out = []) {
  const abs = path.join(root, p);
  if (!fs.existsSync(abs)) return out;
  if (fs.statSync(abs).isFile()) return [...out, abs];
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const child = path.join(p, e.name);
    if (e.isDirectory()) collectFiles(child, out);
    else if (/\.(jsx?|tsx?|mjs|s?css|html)$/.test(e.name)) out.push(path.join(root, child));
  }
  return out;
}

const files = scanDirs.flatMap((d) => collectFiles(d));
const problems = [];
let checked = 0;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const isStyle = /\.s?css$/.test(file);
  const patterns = file.endsWith(".html") ? htmlPatterns : isStyle ? stylePatterns : codePatterns;

  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const spec = m[1].split(/[?#]/)[0];
      if (!spec || /^([a-z]+:|\/\/)/i.test(spec)) continue; // URLs, data: URIs
      let base;
      if (spec.startsWith(".")) base = path.resolve(path.dirname(file), spec);
      else if (spec.startsWith("/")) {
        // Vite serves "/x" from public/ first, then the project root.
        const fromPublic = path.join(root, "public", spec);
        base = candidates(fromPublic, isStyle).some((c) => actualPath(c)) ? fromPublic : path.join(root, spec);
      } else continue; // package import

      checked++;
      const where = `${path.relative(root, file).replaceAll("\\", "/")}:${text.slice(0, m.index).split("\n").length}`;
      const found = candidates(base, isStyle)
        .map((c) => ({ wanted: path.relative(root, c).replaceAll("\\", "/"), actual: actualPath(c) }))
        .filter((c) => c.actual);

      if (found.length === 0) problems.push(`${where}  '${m[1]}' not found`);
      else if (!found.some((c) => c.wanted === c.actual))
        problems.push(`${where}  '${m[1]}' differs in case from ${found[0].actual}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s) in ${checked} local references.`);
  process.exit(1);
}
console.log(`All ${checked} local references match the file names on disk.`);
