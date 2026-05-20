import { transform } from "esbuild";
import { readdir, readFile, writeFile, unlink } from "fs/promises";
import { join, extname, basename, dirname } from "path";

const SRC_DIR = "artifacts/squadgod/src";

async function walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const allFiles = await walkDir(SRC_DIR);
  const targets = allFiles.filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));

  console.log(`Found ${targets.length} TypeScript files to convert`);

  for (const filePath of targets) {
    const ext = extname(filePath);
    const outExt = ext === ".tsx" ? ".jsx" : ".js";
    const outPath = filePath.slice(0, -ext.length) + outExt;

    const source = await readFile(filePath, "utf8");

    const loader = ext === ".tsx" ? "tsx" : "ts";
    const result = await transform(source, {
      loader,
      jsx: "preserve",
      target: "esnext",
      format: "esm",
      // Keep import.meta, don't bundle, just strip types
    });

    await writeFile(outPath, result.code, "utf8");
    await unlink(filePath);
    console.log(`  ${filePath} → ${outPath}`);
  }

  console.log("Done!");
}

main().catch(err => { console.error(err); process.exit(1); });
