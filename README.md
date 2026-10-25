# VoicePolish deploy (Vercel)

1. Push this folder to a GitHub repo.
2. vercel.com → Add New Project → import the repo. No build settings needed.
3. Project Settings → Environment Variables: `GROQ_API_KEY` = your key from console.groq.com/keys. Optional: `MODEL` (default llama-3.3-70b-versatile).
4. Deploy. Open the https URL in Chrome, Edge or Safari.

Notes
- Mic + live transcription need https and a browser with SpeechRecognition (not Firefox).
- /api/polish is public and uses your Groq free quota; heavy traffic will hit rate limits. The in-memory rate limit is best-effort only.
- Key stays server-side; never put it in index.html.
