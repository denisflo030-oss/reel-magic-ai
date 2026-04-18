const API = "https://reel-magic-ai.onrender.com";

export async function uploadVideo(file: File) {
  const form = new FormData();
  form.append("video", file);

  const res = await fetch(`${API}/api/videos/upload`, {
    method: "POST",
    body: form,
  });

  return res.json();
}

export async function analyzeUrl(url: string) {
  const res = await fetch(`${API}/api/videos/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return res.json();
}