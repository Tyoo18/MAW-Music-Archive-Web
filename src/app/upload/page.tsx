"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Disc,
  Upload,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function UploadPage() {
  // [STATE]: Manajemen sekuens alur pencarian metadata dan upload audio
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // [STATE]: Indikator status loading proses server-side
  const [isSearching, setIsSearching] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // [HANDLER]: Eksekusi pencarian metadata lagu ke API internal dengan ekstra proteksi
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      // const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

      // [VALIDATE]: Cek dulu status HTTP, kalau gak 200 OK, jangan dipaksa pasrah ke res.json()
      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          `Backend returned error status ${res.status}:`,
          errorText,
        );
        alert(`Server error (${res.status}). Cek terminal VS Code lu, Do!`);
        return;
      }

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      // [VALIDATE]: Tangkap error parsing JSON atau network loss di sini
      console.error("Metadata pipeline broken:", err);
      alert("Gagal konek ke API search. Pastikan backend lu gak crash.");
    } finally {
      setIsSearching(false);
    }
  };

  // [HANDLER]: Tangani pemilihan file mp3 lewat click explorer atau drag-drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  // [HANDLER]: Bundling seluruh data teks + audio lalu kirim ke Core Ingest API
  const handlePublish = async () => {
    if (!selectedTrack || !audioFile) return;
    setIsPublishing(true);

    // [UTIL]: Packing payload menggunakan FormData agar binary file bisa terkirim
    const payload = new FormData();
    payload.append("file", audioFile);
    payload.append("title", selectedTrack.title);
    payload.append("artist", selectedTrack.artist);
    payload.append("album", selectedTrack.title); // Last.fm track search aggregates album reference here
    payload.append("coverImg", selectedTrack.coverImg);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: payload });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          // [STATE]: Reset form state setelah sekuens sukses selesai dipancarkan
          setSelectedTrack(null);
          setAudioFile(null);
          setQuery("");
          setResults([]);
          setIsSuccess(false);
        }, 2500);
      }
    } catch (err) {
      console.error("Publish execution failed:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-100 p-8 flex flex-col items-center justify-start font-sans selection:bg-zinc-800">
      {/* Visual Header Identity */}
      <div className="w-full max-w-xl mt-12 mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase">
            Oblique // System Ingestion
          </h1>
          <p className="font-serif italic text-xl text-zinc-300">
            {selectedTrack
              ? "Awaiting audio payload assignment."
              : "Index sequence mapping input."}
          </p>
        </div>
        {selectedTrack && (
          // [HANDLER]: Tombol mundur balik ke mode pencarian
          <button
            onClick={() => {
              setSelectedTrack(null);
              setAudioFile(null);
            }}
            className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={11} /> BACK
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedTrack ? (
          // ---------------- INTERFACE LAYER A: SEARCH METADATA ----------------
          <motion.div
            key="search-layer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="w-full max-w-xl"
          >
            <form onSubmit={handleSearch} className="w-full flex gap-2 mb-8">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search track title to sync metadata structure..."
                className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xs px-4 py-2.5 font-mono text-xs text-white placeholder-zinc-700 focus:outline-hidden focus:border-zinc-700 transition-colors"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-zinc-100 hover:bg-white text-black font-mono text-[11px] font-bold px-5 rounded-xs transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSearching ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Search size={12} />
                )}
                {isSearching ? "SYNCING" : "FETCH"}
              </button>
            </form>

            {/* Grid Hasil Tarikan API */}
            <div className="space-y-2">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-zinc-950/40 border border-zinc-950 rounded-xs p-3 hover:border-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-zinc-900 rounded-xs overflow-hidden relative border border-white/5">
                      <img
                        src={item.coverImg}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-mono text-xs font-bold text-white line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="font-serif italic text-xs text-zinc-500 line-clamp-1">
                        {item.artist}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTrack(item)}
                    className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-xs transition-all cursor-pointer text-zinc-300 hover:text-white"
                  >
                    SELECT
                  </button>
                </div>
              ))}

              {!isSearching && results.length === 0 && (
                <div className="text-center font-mono text-[10px] text-zinc-700 py-16 border border-dashed border-zinc-950 rounded-xs">
                  Awaiting query submission for indexation.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // ---------------- INTERFACE LAYER B: DRAG DROP AUDIO FILE ----------------
          <motion.div
            key="upload-layer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="w-full max-w-xl space-y-6"
          >
            {/* Locked Target Preview Card */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xs p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/5 shadow-lg rounded-xs overflow-hidden shrink-0">
                <img
                  src={selectedTrack.coverImg}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <span className="font-mono text-[8px] text-zinc-600 tracking-widest uppercase block">
                  Target Index Matrix
                </span>
                <h3 className="font-mono text-sm font-bold text-white leading-tight">
                  {selectedTrack.title}
                </h3>
                <p className="font-serif italic text-xs text-zinc-400">
                  {selectedTrack.artist}
                </p>
              </div>
            </div>

            {/* Micro-Interaction Upload Dropzone Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xs p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-zinc-950/20 group ${audioFile ? "border-zinc-700 bg-zinc-950/60" : "border-zinc-900 hover:border-zinc-700"}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/mp3,audio/wav"
                className="hidden"
              />

              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-500 flex flex-col items-center gap-1"
                >
                  <CheckCircle size={24} />
                  <span className="font-mono text-[11px] font-bold tracking-wider uppercase mt-1">
                    Registry Ingested Successfully
                  </span>
                </motion.div>
              ) : audioFile ? (
                <div className="text-zinc-300 flex flex-col items-center gap-1">
                  <Disc
                    size={24}
                    className="text-zinc-500 animate-spin"
                    style={{ animationDuration: "4s" }}
                  />
                  <span className="font-mono text-xs font-bold text-zinc-200 mt-2 truncate max-w-xs">
                    {audioFile.name}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600 uppercase">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB // Click to
                    Swap
                  </span>
                </div>
              ) : (
                <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors flex flex-col items-center gap-1">
                  <Upload size={22} className="mb-1" />
                  <span className="font-mono text-xs font-medium tracking-wide">
                    Assign File Object (.mp3 / .wav)
                  </span>
                  <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-tight">
                    Click interface to mount local archive data
                  </span>
                </div>
              )}
            </div>

            {/* Publish Trigger Button */}
            <button
              onClick={handlePublish}
              disabled={!audioFile || isPublishing || isSuccess}
              className="w-full bg-zinc-100 hover:bg-white disabled:bg-zinc-950 border disabled:border-zinc-900 border-transparent text-black disabled:text-zinc-700 font-mono text-xs font-bold py-3 rounded-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : null}
              {isPublishing
                ? "COMMITTING LOGS..."
                : isSuccess
                  ? "RECORD WRITTEN"
                  : "PUBLISH TO ARCHIVE"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
