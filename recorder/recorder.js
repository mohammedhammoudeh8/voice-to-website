// recorder/recorder.js
// Uploads audio to your GitHub repo into inbox/
// Then GitHub Actions transcribes + updates the site automatically.

// ✅ Pre-filled for you:
const OWNER = "mohammedhammoudeh8";
const REPO = "voice-to-website";
const BRANCH = "main";

const tokenEl = document.getElementById("token");
const tokenStatus = document.getElementById("tokenStatus");
const statusEl = document.getElementById("status");
const player = document.getElementById("player");

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const uploadBtn = document.getElementById("upload");
const saveTokenBtn = document.getElementById("saveToken");
const clearTokenBtn = document.getElementById("clearToken");

let mediaRecorder;
let chunks = [];
let audioBlob;

loadToken();

saveTokenBtn.onclick = () => {
  localStorage.setItem("gh_pat", tokenEl.value.trim());
  loadToken();
};

clearTokenBtn.onclick = () => {
  localStorage.removeItem("gh_pat");
  tokenEl.value = "";
  loadToken();
};

startBtn.onclick = async () => {
  chunks = [];
  audioBlob = null;
  player.src = "";
  status("Requesting mic access...");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream, { mimeType: pickMimeType() });

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    audioBlob = new Blob(chunks, { type: mediaRecorder.mimeType || "audio/webm" });
    player.src = URL.createObjectURL(audioBlob);
    uploadBtn.disabled = false;
    status("Recording stopped. Ready to upload.");
  };

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  uploadBtn.disabled = true;
  status("Recording...");
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

uploadBtn.onclick = async () => {
  const pat = getToken();
  if (!pat) return status("Missing GitHub token.");

  if (!audioBlob) return status("No audio recorded.");

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `inbox/audio-${ts}.webm`;

  status("Encoding audio...");
  const b64 = await blobToBase64(audioBlob);

  status("Uploading to GitHub...");
  await putFile({
    path: filename,
    contentBase64: b64,
    message: `Add audio inbox: ${filename}`,
    token: pat
  });

  status("✅ Uploaded! GitHub Action should transcribe + update the site shortly.");
  uploadBtn.disabled = true;
};

function status(msg) { statusEl.textContent = msg; }

function loadToken() {
  const saved = localStorage.getItem("gh_pat") || "";
  tokenEl.value = saved;
  tokenStatus.textContent = saved ? "Token saved in this browser ✅" : "No token saved yet.";
}

function getToken() {
  return (tokenEl.value || localStorage.getItem("gh_pat") || "").trim();
}

function pickMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg"
  ];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || "";
}

async function blobToBase64(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function putFile({ path, contentBase64, message, token }) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
  const body = {
    message,
    content: contentBase64,
    branch: BRANCH
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub upload failed: ${res.status} ${txt}`);
  }
}
