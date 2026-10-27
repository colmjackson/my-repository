// Copies the web app (index.html stays the source of truth) into www/ for Capacitor.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const out = path.join(root, "www");
const files = ["index.html", "manifest.webmanifest", "sw.js", "icons"];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const f of files) fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
console.log("Built www/ with: " + files.join(", "));
