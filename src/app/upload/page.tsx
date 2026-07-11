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

  // [STATE]: Layer perantara — album yang dipilih & daftar tracklist aslinya
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [albumTracks, setAlbumTracks] = useState<any[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // [HANDLER]: Eksekusi pencarian metadata album ke API internal
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

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
      console.error("Metadata pipeline broken:", err);
      alert("Gagal konek ke API search. Pastikan backend lu gak crash.");
    } finally {
      setIsSearching(false);
    }
  };

  // [HANDLER]: User pilih 1 album dari hasil search -> tarik tracklist aslinya
  const handleSelectAlbum = async (item: any) => {
    setSelectedAlbum(item);
    setIsLoadingTracks(true);
    try {
      const res = await fetch(
        `/api/album-tracks?artist=${encodeURIComponent(item.artist)}&album=${encodeURIComponent(item.title)}`,
      );
      const tracks = await res.json();
      setAlbumTracks(Array.isArray(tracks) ? tracks : []);
    } catch (err) {
      console.error("Failed to fetch album tracks:", err);
      setAlbumTracks([]);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // [HANDLER]: Tangani pemilihan file mp3 lewat click explorer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  // [HANDLER]: Bundling seluruh data teks + audio lalu kirim ke Core Ingest API
  const handlePublish = async () => {
    if (!selectedTrack || !audioFile) return;
    setIsPublishing(true);

    const payload = new FormData();
    payload.append("file", audioFile);
    payload.append("title", selectedTrack.title);
    payload.append("artist", selectedTrack.artist);
    payload.append("album", selectedTrack.album);
    payload.append("coverImg", selectedTrack.coverImg);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: payload });
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          // [STATE]: Reset semua state, termasuk layer album/tracklist, balik ke awal total
          setSelectedTrack(null);
          setSelectedAlbum(null);
          setAlbumTracks([]);
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

  // [HANDLER]: Tombol BACK — arahnya beda tergantung lagi di layer mana
  const handleBack = () => {
    if (selectedTrack) {
      setSelectedTrack(null);
      setAudioFile(null);
    } else if (selectedAlbum) {
      setSelectedAlbum(null);
      setAlbumTracks([]);
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
              : selectedAlbum
                ? "Select track from archived tracklist."
                : "Index sequence mapping input."}
          </p>
        </div>
        {(selectedTrack || selectedAlbum) && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={11} /> BACK
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedAlbum ? (
          // ---------------- INTERFACE LAYER A: SEARCH ALBUM ----------------
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
                placeholder="Search album title to sync metadata structure..."
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

            <div className="space-y-2">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-zinc-950/40 border border-zinc-950 rounded-xs p-3 hover:border-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-zinc-900 rounded-xs overflow-hidden relative border border-white/5">
                      <img
                        src={item.coverImg || "/covers/1.png"}
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
                    onClick={() => handleSelectAlbum(item)}
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
        ) : !selectedTrack ? (
          // ---------------- INTERFACE LAYER B (BARU): PILIH TRACK DARI ALBUM ----------------
          <motion.div
            key="tracklist-layer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="w-full max-w-xl space-y-4"
          >
            {/* Preview album yang dipilih */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xs p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-xs overflow-hidden shrink-0">
                <img
                  src={selectedAlbum.coverImg || "/covers/1.png"}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-[8px] text-zinc-600 tracking-widest uppercase block">
                  Album Archive
                </span>
                <h3 className="font-mono text-sm font-bold text-white">
                  {selectedAlbum.title}
                </h3>
                <p className="font-serif italic text-xs text-zinc-400">
                  {selectedAlbum.artist}
                </p>
              </div>
            </div>

            {/* Daftar track asli dari album.getInfo */}
            {isLoadingTracks ? (
              <div className="flex items-center justify-center gap-2 py-16 text-zinc-600 font-mono text-[11px] uppercase tracking-wider">
                <Loader2 size={14} className="animate-spin" />
                Fetching tracklist...
              </div>
            ) : albumTracks.length === 0 ? (
              <div className="text-center font-mono text-[10px] text-zinc-700 py-16 border border-dashed border-zinc-950 rounded-xs">
                No tracklist found for this album.
              </div>
            ) : (
              <div className="space-y-1.5">
                {albumTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className="flex items-center justify-between bg-zinc-950/40 border border-zinc-950 rounded-xs p-3 hover:border-zinc-800 hover:bg-zinc-950/70 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-zinc-600">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="text-zinc-200 group-hover:text-white">
                        {track.title}
                      </span>
                    </div>
                    <Disc
                      size={12}
                      className="text-zinc-700 group-hover:text-zinc-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // ---------------- INTERFACE LAYER C: UPLOAD AUDIO FILE ----------------
          <motion.div
            key="upload-layer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="w-full max-w-xl space-y-6"
          >
            <div className="bg-zinc-950 border border-zinc-900 rounded-xs p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 border border-white/5 shadow-lg rounded-xs overflow-hidden shrink-0">
                <img
                  src={selectedTrack.coverImg || "/covers/1.png"}
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
