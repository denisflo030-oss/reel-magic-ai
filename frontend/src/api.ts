const API = "https://reel-magic-ai.onrender.com";

// -------------------- UPLOAD --------------------
export async function uploadVideo(file: File) {
  const form = new FormData();
  form.append("video", file);

  const res = await fetch(`${API}/api/videos/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "UPLOAD_FAILED");
  }

  return data;
}

// -------------------- ANALYZE URL --------------------
export async function analyzeUrl(url: string) {
  const res = await fetch(`${API}/api/videos/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "ANALYZE_FAILED");
  }

  return data;
}

// -------------------- ERROR MAPPER (AICI îl pui) --------------------
export function mapApiError(error: string): string {
  switch (error) {
    case "PRIVATE_VIDEO":
      return "Acest video este privat.";
    case "AGE_RESTRICTED":
      return "Video cu restricție de vârstă.";
    case "UNAVAILABLE":
      return "Video indisponibil.";
    case "REGION_BLOCKED":
      return "Blocat în regiunea ta.";
    case "UPLOAD_FAILED":
      return "Upload-ul a eșuat.";
    case "ANALYZE_FAILED":
      return "Analiza a eșuat.";
    default:
      return "A apărut o eroare necunoscută.";
  }
}
