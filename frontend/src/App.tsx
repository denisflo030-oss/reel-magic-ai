import { useState } from "react";
import { uploadVideo, analyzeUrl, mapApiError } from "./api";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadVideo(file);
      setClips(data.clips || []);
    } catch (err: any) {
      setError(mapApiError(err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeUrl(url);
      setClips(data.clips || []);
    } catch (err: any) {
      setError(mapApiError(err.message));
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className="ml-4 bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Upload Video
        </button>
      </div>

      {/* URL */}
      <div className="bg-[#111] p-4 rounded-xl mb-6">
        <input
          placeholder="Paste video URL..."
          className="w-full p-2 text-black rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-2 bg-green-600 px-4 py-2 rounded disabled:opacity-50"
        >
          Analyze URL
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-yellow-400">Processing video...</p>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-red-300 bg-red-900/20 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* CLIPS */}
      <div className="grid gap-4 mt-6">
        {clips.map((clip, i) => (
          <div key={i} className="bg-[#1a1a1a] p-4 rounded-xl">
            <h3 className="font-bold">{clip.title}</h3>
            <a href={clip.download_url} className="text-blue-400">
              Download clip
            </a>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {!loading && clips.length === 0 && !error && (
        <p className="text-gray-500 mt-6">
          No clips yet. Upload a video or paste a URL.
        </p>
      )}
    </div>
  );
}
