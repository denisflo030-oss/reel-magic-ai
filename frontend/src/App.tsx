import { useState } from "react";
import { uploadVideo, analyzeUrl } from "./api";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);

    const data = await uploadVideo(file);
    setClips(data.clips || []);

    setLoading(false);
  }

  async function handleAnalyze() {
    if (!url) return;
    setLoading(true);

    const data = await analyzeUrl(url);
    setClips(data.clips || []);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Reel Magic AI</h1>

      {/* UPLOAD */}
      <div className="bg-[#111] p-4 rounded-xl mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleUpload}
          className="ml-4 bg-blue-600 px-4 py-2 rounded"
        >
          Upload Video
        </button>
      </div>

      {/* URL */}
      <div className="bg-[#111] p-4 rounded-xl mb-6">
        <input
          placeholder="Paste video URL..."
          className="w-full p-2 text-black rounded"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          className="mt-2 bg-green-600 px-4 py-2 rounded"
        >
          Analyze URL
        </button>
      </div>

      {/* LOADING */}
      {loading && <p className="text-yellow-400">Processing video...</p>}

      {/* CLIPS */}
      <div className="grid gap-4 mt-6">
        {clips.map((clip, i) => (
          <div key={i} className="bg-[#1a1a1a] p-4 rounded-xl">
            <h3 className="font-bold">{clip.title}</h3>
            <a
              href={clip.download_url}
              className="text-blue-400"
            >
              Download clip
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
