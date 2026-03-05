import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// If no key is set, do not fail the build; just skip transcription.
if (!OPENAI_API_KEY) {
  console.log("No OPENAI_API_KEY set. Skipping transcription.");
  process.exit(0);
}

const inboxDir = "inbox";
const processedDir = "inbox/processed";
const contentPath = "content/site.yaml";

fs.mkdirSync(processedDir, { recursive: true });
if (!fs.existsSync(inboxDir)) fs.mkdirSync(inboxDir, { recursive: true });

const files = fs.readdirSync(inboxDir)
  .filter(f => (f.endsWith(".webm") || f.endsWith(".ogg") || f.endsWith(".wav")));

if (files.length === 0) {
  console.log("No inbox audio files found.");
  process.exit(0);
}

const site = yaml.load(fs.readFileSync(contentPath, "utf8"));
site.updates = site.updates || [];

for (const f of files) {
  const fullPath = path.join(inboxDir, f);
  console.log("Transcribing:", fullPath);

  const transcript = await transcribeWhisper(fullPath);

  const date = new Date().toISOString().slice(0, 10);
  site.updates.push({
    date,
    text: `Audio update: ${transcript}`
  });

  // Move processed file so we don't re-transcribe
  fs.renameSync(fullPath, path.join(processedDir, f));
}

fs.writeFileSync(contentPath, yaml.dump(site, { lineWidth: 120 }), "utf8");
console.log("Updated content:", contentPath);

async function transcribeWhisper(filePath) {
  const fileData = await fs.promises.readFile(filePath);

  const form = new FormData();
  form.append("model", "whisper-1");
  form.append("file", new Blob([fileData]), path.basename(filePath));

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
    body: form
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Transcription failed: ${res.status} ${txt}`);
  }

  const json = await res.json();
  return (json.text || "").trim();
}
