# Voice-to-Website (GitHub Pages + Audio Updates)

Live URL:  
`https://mohammedhammoudeh8.github.io/voice-to-website`

This site lets you:
1. Record audio in the browser
2. Upload it into the repo (`inbox/`)
3. GitHub Actions transcribes it (OpenAI Whisper API)
4. The transcript is appended to the single source-of-truth file (`content/site.yaml`)
5. The site rebuilds into `docs/` and GitHub Pages serves it
