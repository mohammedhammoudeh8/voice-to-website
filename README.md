# Voice-to-Website (GitHub Pages + Audio Updates)

Live URL (after you enable Pages):  
`https://mohammedhammoudeh8.github.io/voice-to-website`

This proof-of-concept lets you:
1. Record audio in the browser
2. Upload it into the repo (`inbox/`)
3. GitHub Actions transcribes it (OpenAI Whisper API)
4. The transcript is appended to the single source-of-truth file (`content/site.yaml`)
5. The site rebuilds into `docs/` and GitHub Pages serves it

---

## Setup (fork/clone)

### Enable GitHub Pages
Repo → **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
Save.

### Add OpenAI key (for transcription)
Repo → **Settings → Secrets and variables → Actions → New repository secret**
- Name: `OPENAI_API_KEY`
- Value: your OpenAI API key

> Without `OPENAI_API_KEY`, the workflow still builds the site, but skips transcription.

---

## Update the website with voice
1. Open your Pages site:
   `https://mohammedhammoudeh8.github.io/voice-to-website`
2. Click **Open Recorder App**
3. Create a **fine-grained GitHub PAT** with access to this repo:
   - Permissions: **Contents: Read/Write**
4. Paste the token in the recorder page → **Save token**
5. Record → Stop → Upload

A GitHub Action runs automatically, transcribes your audio, updates `content/site.yaml`, rebuilds the site into `docs/`, and pushes changes.

---

## Single source of truth
Edit:
- `content/site.yaml`

Then rebuild locally (optional):
```bash
npm install
npm run build
```

---

## Demo script (what to show in class)
1. Open the live site
2. Open Recorder App
3. Record 5–10 seconds (say a new update)
4. Upload
5. Show GitHub Actions running
6. Refresh the site → your update appears under **Latest Updates**
