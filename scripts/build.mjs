import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const contentPath = "content/site.yaml";
const templatePath = "templates/index.template.html";
const outPath = "docs/index.html";

const site = yaml.load(fs.readFileSync(contentPath, "utf8"));
const template = fs.readFileSync(templatePath, "utf8");

const updatesHtml = (site.updates || [])
  .slice()
  .reverse()
  .map(u => `
    <div class="update">
      <div class="date">${escapeHtml(u.date)}</div>
      <div>${escapeHtml(u.text)}</div>
    </div>
  `).join("");

const html = template
  .replaceAll("{{NAME}}", escapeHtml(site.name))
  .replaceAll("{{TITLE}}", escapeHtml(site.title))
  .replaceAll("{{TAGLINE}}", escapeHtml(site.tagline))
  .replaceAll("{{EMAIL}}", escapeHtml(site.email))
  .replaceAll("{{UPDATES}}", updatesHtml);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, "utf8");

fs.mkdirSync("docs/recorder", { recursive: true });
fs.copyFileSync("recorder/index.html", "docs/recorder/index.html");
fs.copyFileSync("recorder/recorder.js", "docs/recorder/recorder.js");

console.log("Built:", outPath, "and copied recorder into docs/recorder");

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
