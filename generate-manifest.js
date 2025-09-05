// generate-manifest.js
// Scans /images/{street,landscape,architecture} and writes JSON lists to /data.
// Also picks first 11 root /images files for the homepage grid.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SRC  = path.join(ROOT, "images");
const OUT  = path.join(ROOT, "data");

const CATS = ["street", "landscape", "architecture"];

// case-insensitive image extensions
const exts = new Set([
  ".jpg",".jpeg",".png",".webp",".gif",
  ".JPG",".JPEG",".PNG",".WEBP",".GIF"
]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listImagesIn(dirRel) {
  const dirAbs = path.join(SRC, dirRel);
  if (!fs.existsSync(dirAbs)) return [];
  return fs.readdirSync(dirAbs)
    .filter(name => exts.has(path.extname(name)))
    // newest first feels good for portfolio grids; swap to localeCompare for A→Z
    .sort((a, b) => fs.statSync(path.join(dirAbs, b)).mtimeMs
                  - fs.statSync(path.join(dirAbs, a)).mtimeMs)
    .map(filename => {
      // URL-encode any spaces, etc.
      const safe = encodeURIComponent(filename).replace(/%2F/g, "/");
      return `images/${dirRel}/${safe}`;
    });
}

function main() {
  ensureDir(OUT);

  const manifest = {};

  // per-category lists
  for (const cat of CATS) {
    manifest[cat] = listImagesIn(cat);
    fs.writeFileSync(
      path.join(OUT, `${cat}.json`),
      JSON.stringify(manifest[cat], null, 2)
    );
    console.log(`Wrote data/${cat}.json  (${manifest[cat].length} images)`);
  }

  // homepage selection — first 11 images in /images (not subfolders)
  const homeDir = SRC;
  const homeList = fs.readdirSync(homeDir)
    .filter(name =>
      exts.has(path.extname(name)) &&
      !CATS.includes(name) // ignore folders with these names if present
    )
    .sort((a, b) => fs.statSync(path.join(homeDir, b)).mtimeMs
                  - fs.statSync(path.join(homeDir, a)).mtimeMs)
    .slice(0, 11)
    .map(filename => {
      const safe = encodeURIComponent(filename).replace(/%2F/g, "/");
      return `images/${safe}`;
    });

  manifest.home = homeList;
  fs.writeFileSync(
    path.join(OUT, "home.json"),
    JSON.stringify(homeList, null, 2)
  );
  console.log(`Wrote data/home.json  (${homeList.length} images)`);

  // optional: combined manifest file
  fs.writeFileSync(
    path.join(OUT, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("Wrote data/manifest.json");
}

main();
