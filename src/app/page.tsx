"use client";

// [INIT]: Import hooks, framer motion components, icons, dan Supabase client instances
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Disc,
  Play,
  Pause,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { supabase } from "@/lib/supabase";

// [INIT]: Setup visual typography hierarchy khas Oblique OS
const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// [UTIL]: Koordinat preset asimetris layout deck agar album berserakan tetap rapi & seimbang
const POSITION_PRESETS = [
  { top: "14%", left: "12%", rotate: "-6deg" },
  { top: "24%", left: "40%", rotate: "4deg" },
  { top: "12%", left: "66%", rotate: "-3deg" },
  { top: "48%", left: "18%", rotate: "5deg" },
  { top: "42%", left: "52%", rotate: "-4deg" },
  { top: "55%", left: "72%", rotate: "8deg" },
  { top: "18%", left: "82%", rotate: "-5deg" },
];

// [UTIL]: Interface TypeScript yang sinkron 100% dengan skema kolom database asli lu
interface TrackItem {
  id: string;
  catalog: string;
  title: string;
  artist: string;
  album: string;
  cover_img: string; // FIX: Menyesuaikan nama kolom database
  audio_url: string;
  bg_color: string; // FIX: Menyesuaikan nama kolom database
  description: string;
  posTop?: string;
  posLeft?: string;
  posRotate?: string;
}

export default function Page() {
  // [STATE]: State penentu halaman navigasi aktif antara mode Album atau Digital Track Rack
  const [currentTab, setCurrentTab] = useState<"albums" | "tracks">("albums");
  // [STATE]: Wadah penampung seluruh row data mentah dari database
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  // [STATE]: Wadah penampung data album unik hasil dari proses penyaringan grouping
  const [albums, setAlbums] = useState<TrackItem[]>([]);
  // [STATE]: Status pemuatan loader animasi data
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // [STATE]: State pengunci modal ID, trigger animasi deck meluncur, dan status audio node
  const [activeId, setActiveId] = useState<string | null>(null);
  const [slidingId, setSlidingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // [STATE]: Timeline seeker tracker posisi berjalannya detik audio
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // [INIT]: Pointer instance reference DOM ke element HTML5 Audio native
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // [FETCH]: Pipeline pengambilan data real-time dari database Postgres Supabase
  useEffect(() => {
    async function fetchArchivedTracks() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("tracks")
          .select("*")
          .order("created_at", { ascending: false });

        // [VALIDATE]: Tangkap error internal database dan keluarkan pesat deskriptifnya
        if (error) {
          throw new Error(error.message + " | Details: " + error.details);
        }

        if (data) {
          // [FORMAT]: Pemetaan data baris database ke objek UI dibarengi pembagian posisi koordinat acak
          const formattedTracks: TrackItem[] = data.map((item, idx) => {
            const preset = POSITION_PRESETS[idx % POSITION_PRESETS.length];
            return {
              id: item.id,
              catalog: item.catalog,
              title: item.title,
              artist: item.artist,
              album: item.album || "Single Track",
              cover_img: item.cover_img || "/covers/default.png", // Sinkronisasi kolom
              audio_url: item.audio_url,
              bg_color: item.bg_color || "bg-zinc-900", // Memakai konfigurasi warna database
              description: item.description,
              posTop: preset.top,
              posLeft: preset.left,
              posRotate: preset.rotate,
            };
          });

          setTracks(formattedTracks);

          // [CALC]: Filter Group By di level frontend untuk menyaring nama-nama album yang unik
          const uniqueAlbumsMap: { [key: string]: TrackItem } = {};
          formattedTracks.forEach((track) => {
            if (track.album && !uniqueAlbumsMap[track.album]) {
              uniqueAlbumsMap[track.album] = track;
            }
          });
          setAlbums(Object.values(uniqueAlbumsMap));
        }
      } catch (err: any) {
        // FIX: Menampilkan string pesan error asli dari server, bukan sekadar objek kosong {}
        console.error(
          "Error fetching tracks from Supabase:",
          err.message || err,
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchArchivedTracks();
  }, []);

  // [HANDLER]: Sinkronisasi trigger play/pause terhadap mesin HTML5 Audio player
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current
        .play()
        .catch((err) => console.log("Audio playback blocked:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, activeId]);

  // [HANDLER]: Inject link source file biner audio baru ke engine saat lagu berpindah fokus
  const handleTrackChange = (audioUrl: string, autoPlay: boolean) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current
          .play()
          .catch((err) => console.log("Playback start error:", err));
      }
    }
  };

  // [HANDLER]: Navigasi ke track berikutnya dalam urutan global, wrap-around ke awal kalau udah di ujung
  const handleNextTrack = () => {
    if (!activeId || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === activeId);
    if (currentIndex === -1) return;
    const nextTrack = tracks[(currentIndex + 1) % tracks.length];
    setActiveId(nextTrack.id);
    setIsPlaying(true);
    handleTrackChange(nextTrack.audio_url, true);
  };

  // [HANDLER]: Navigasi ke track sebelumnya, wrap-around ke akhir kalau udah di track pertama
  const handlePrevTrack = () => {
    if (!activeId || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === activeId);
    if (currentIndex === -1) return;
    const prevTrack =
      tracks[(currentIndex - 1 + tracks.length) % tracks.length];
    setActiveId(prevTrack.id);
    setIsPlaying(true);
    handleTrackChange(prevTrack.audio_url, true);
  };

  // [HANDLER]: Event click pengunci modal piringan hitam di album section
  const handleAlbumClick = (track: TrackItem) => {
    setActiveId(track.id);
    setIsPlaying(false);
    setTimeout(() => handleTrackChange(track.audio_url, false), 50);
  };

  // [HANDLER]: Trigger mulainya runtunan koreografi meluncur ke atas pada mode track rack
  const handleTrackClick = (id: string) => {
    if (!slidingId && !activeId) {
      setSlidingId(id);
    }
  };

  // [HANDLER]: Callback eksekusi ketika kartu selesai meluncur, kunci data buka modal media control
  const handleTrackAnimationComplete = (track: TrackItem) => {
    if (slidingId === track.id) {
      setActiveId(track.id);
      setSlidingId(null);
      setIsPlaying(true);
      setTimeout(() => handleTrackChange(track.audio_url, true), 50);
    }
  };

  // [HANDLER]: Mematikan mesin pemutaran musik dan membersihkan seluruh state penunjuk aktif
  const handleClose = () => {
    setActiveId(null);
    setSlidingId(null);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  // [HANDLER]: Sinkronisasi penunjuk waktu berjalannya musik dari metadata element audio asli
  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  // [HANDLER]: Lompat durasi menit lagu saat area garis horizontal progress bar di-klik user
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // [FORMAT]: Konversi hitungan detik mentah menjadi susunan teks waktu format digital mm:ss
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // [CALC]: Cari data record target lagu yang sedang di-load oleh sistem modal aktif
  const activeItem = tracks.find((v) => v.id === activeId);

  return (
    <div
      className={`${sansFont.variable} ${serifFont.variable} font-sans min-h-screen bg-[#0d0d0d] text-[#e4e4e7] selection:bg-zinc-700 px-8 py-4 flex flex-col justify-between overflow-x-hidden`}
    >
      {/* Hidden background html5 media node audio framework */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNextTrack}
      />

      {/* ==================== TOP NAVIGATION ==================== */}
      <header className="w-full flex items-center justify-between text-xs tracking-wider text-zinc-400 border-b border-zinc-950 pb-4">
        <nav className="flex gap-6">
          <button
            onClick={() => {
              handleClose();
              setCurrentTab("albums");
            }}
            className={`transition-colors uppercase tracking-widest text-[11px] font-mono ${currentTab === "albums" ? "text-white font-bold" : "hover:text-white"}`}
          >
            Albums
          </button>
          <button
            onClick={() => {
              handleClose();
              setCurrentTab("tracks");
            }}
            className={`transition-colors uppercase tracking-widest text-[11px] font-mono ${currentTab === "tracks" ? "text-white font-bold" : "hover:text-white"}`}
          >
            Single Track
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full border border-zinc-500 flex items-center justify-between px-1 text-[9px] font-medium tracking-tighter">
            <span>fi</span>
            <span>les</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 pl-2">
            <Search size={13} />
            <span className="lowercase text-[11px]">search</span>
          </div>
        </div>

        <nav className="flex gap-6">
          <span className="text-zinc-600 font-mono text-[10px] uppercase">
            Oblique OS v1.2
          </span>
        </nav>
      </header>

      {/* ==================== MAIN CORE SECTION ==================== */}
      <main className="flex-1 flex flex-col mt-10 relative">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center font-mono text-zinc-600 text-xs tracking-widest uppercase animate-pulse">
            Syncing database connection...
          </div>
        ) : (
          <>
            {/* ---------------- INTERFACES 1: MODE ALBUMS (SINKRON DATA REAL-TIME) ---------------- */}
            {currentTab === "albums" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 border-b border-zinc-950 pb-4 ml-32">
                  <h1 className="font-serif text-5xl md:col-span-3 text-zinc-200 tracking-tight leading-none">
                    Repository of Remnants
                  </h1>
                  <div className="text-right font-mono text-[11px] text-zinc-500 space-y-0.5 md:col-span-1 hidden md:block mr-32">
                    <p>Archive Assemblage</p>
                    <p className="text-zinc-400">DYNAMICS SYSTEM</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6 max-w-4xl text-xs md:text-[13px] text-zinc-400 leading-relaxed font-light tracking-wide ml-32">
                  <p>
                    Membaca database Supabase secara real-time. Setiap entitas
                    di bawah mewakili satu album penuh. Musik dikunci otomatis
                    langsung dari penyaringan metadata.
                  </p>
                </div>

                {/* Area Piringan Berantakan Mengikuti Skema DB */}
                <div className="flex-1 min-h-120 w-full relative mt-8">
                  {albums.map((albumItem) => (
                    <div
                      key={albumItem.id}
                      onClick={() => handleAlbumClick(albumItem)}
                      className="absolute w-52 group cursor-pointer transition-transform duration-300 hover:scale-105"
                      style={{
                        top: albumItem.posTop,
                        left: albumItem.posLeft,
                        transform: `rotate(${albumItem.posRotate})`,
                      }}
                    >
                      <div
                        className={`w-full aspect-square ${albumItem.bg_color} border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] p-4 flex flex-col justify-between relative overflow-hidden rounded-sm`}
                      >
                        <img
                          src={albumItem.cover_img}
                          className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-10" />

                        <div className="flex justify-between items-start font-mono text-[8px] text-zinc-300 z-20">
                          <span>{albumItem.catalog}</span>
                          <Disc size={11} className="text-zinc-400" />
                        </div>
                        <div className="z-20">
                          <h3 className="font-mono text-[9px] text-white font-semibold tracking-wide line-clamp-1 uppercase">
                            {albumItem.album}
                          </h3>
                          <p className="font-serif italic text-[11px] text-zinc-300 line-clamp-1">
                            {albumItem.artist}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---------------- INTERFACES 2: MODE SINGLE TRACK (DIAGONAL DECK PERSPECTIVE) ---------------- */}
            {currentTab === "tracks" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col justify-center items-center min-h-137.5 relative"
              >
                <div className="absolute top-0 left-32 max-w-xs font-mono text-[11px] text-zinc-600 space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">
                    Digital Indexing Rack
                  </p>
                  <p className="font-light leading-relaxed">
                    Perspective sequence mapping for individual track metadata
                    architecture.
                  </p>
                </div>

                {/* Perspective Container God Mode 65536px Kebanggaan Lu */}
                <div
                  className="relative w-full max-w-5xl h-125 flex items-center justify-center mt-8"
                  style={{ perspective: "65536px" }}
                >
                  {(() => {
                    const targetId = slidingId || activeId;
                    const targetIndex = tracks.findIndex(
                      (v) => v.id === targetId,
                    );
                    const totalItems = tracks.length;

                    return tracks.map((track, index) => {
                      const isSliding = slidingId === track.id;
                      const isActive = activeId === track.id;
                      const visualIndex =
                        targetIndex !== -1 && index > targetIndex
                          ? index - 1
                          : index;

                      return (
                        <motion.div
                          key={track.id}
                          onClick={() => handleTrackClick(track.id)}
                          style={{
                            transformStyle: "preserve-3d",
                            zIndex: totalItems - index,
                          }}
                          animate={
                            isSliding
                              ? {
                                  x: index * 75 - 150 + 128,
                                  y: index * -35 + 20,
                                  z: index * -40,
                                  rotateX: 32,
                                  rotateY: 42,
                                  rotateZ: -3,
                                  scale: 1.0,
                                  opacity: 1,
                                }
                              : isActive
                                ? {
                                    x: index * 75 - 150 + 128,
                                    y: index * -35 + 20,
                                    z: index * -40,
                                    rotateX: 32,
                                    rotateY: 42,
                                    rotateZ: -3,
                                    scale: 1.0,
                                    opacity: 0,
                                  }
                                : {
                                    x: visualIndex * 85 - 170,
                                    y: visualIndex * -35 + 20,
                                    z: visualIndex * -40,
                                    rotateX: 32,
                                    rotateY: 42,
                                    rotateZ: -3,
                                    scale: 1.0,
                                    opacity: 1,
                                  }
                          }
                          whileHover={
                            !slidingId && !activeId
                              ? {
                                  y: visualIndex * -35 + 20 - 25,
                                  opacity: 1,
                                  transition: { duration: 0.2 },
                                }
                              : {}
                          }
                          transition={{
                            duration: isSliding ? 0.5 : 0.45,
                            ease: isSliding ? "easeOut" : "easeInOut",
                          }}
                          onAnimationComplete={() =>
                            handleTrackAnimationComplete(track)
                          }
                          className="absolute w-64 h-64 cursor-pointer origin-center shadow-[-20px_25px_50px_rgba(0,0,0,0.85)] border border-white/10 rounded-xs overflow-hidden select-none bg-zinc-950"
                        >
                          <div
                            className={`w-full h-full ${track.bg_color} p-5 flex flex-col justify-between relative`}
                          >
                            <img
                              src={track.cover_img}
                              className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none z-0"
                              alt=""
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/5 z-10" />

                            <div className="flex justify-between items-center font-mono text-[9px] text-zinc-400 z-20">
                              <span>{track.catalog}</span>
                              <span className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded-xs tracking-widest text-white font-bold uppercase">
                                Track
                              </span>
                            </div>

                            <div className="z-20 space-y-0.5">
                              <h3 className="font-mono text-[11px] text-white font-bold tracking-wide uppercase line-clamp-1">
                                {track.title}
                              </h3>
                              <p className="font-serif italic text-xs text-zinc-300 line-clamp-1">
                                {track.artist}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* ==================== MODAL OVERLAY CUSTOM MEDIA CONTROLLER ==================== */}
        <AnimatePresence>
          {activeId && activeItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col md:flex-row md:items-start items-center justify-center gap-24 max-w-5xl w-full bg-transparent select-none"
              >
                {/* ---------------- SECTOR KIRI: VINYL MECHANISM COVER ---------------- */}
                <div className="relative w-80 h-80 flex items-center shrink-0">
                  {currentTab === "albums" && (
                    <motion.div
                      initial={{ x: "0%" }}
                      animate={{ x: "48%" }}
                      transition={{
                        type: "spring",
                        stiffness: 95,
                        damping: 14,
                      }}
                      className="absolute inset-0 h-[98%] aspect-square rounded-full shadow-2xl z-0 overflow-hidden border border-zinc-800/50"
                      style={{ left: "-40px" }}
                    >
                      <img
                        src="/labels/vinyl.png"
                        className="w-full h-full object-cover rounded-full"
                        style={{
                          animation: "spin 10s linear infinite",
                          animationPlayState: isPlaying ? "running" : "paused",
                        }}
                        alt="Vinyl Texture"
                      />
                    </motion.div>
                  )}

                  {/* Main Box Sleeve Cover */}
                  <div
                    className={`w-full h-full ${activeItem.bg_color} border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] p-6 flex flex-col justify-between relative overflow-hidden rounded-sm z-10`}
                  >
                    <img
                      src={activeItem.cover_img}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

                    <div className="flex justify-between items-start font-mono text-[9px] text-zinc-300 z-20">
                      <span>{activeItem.catalog}</span>
                      <Disc
                        size={12}
                        className={`text-zinc-300 ${isPlaying && currentTab === "albums" ? "animate-spin" : ""}`}
                        style={{ animationDuration: "3s" }}
                      />
                    </div>

                    <div className="z-20 space-y-3 flex flex-col justify-end">
                      <div className="space-y-0.5 px-0.5">
                        <h3 className="font-mono text-[11px] text-white font-bold tracking-wider uppercase leading-tight line-clamp-1">
                          {activeItem.title}
                        </h3>
                        <p className="font-serif italic text-xs text-zinc-300 font-light line-clamp-1">
                          {activeItem.artist}
                        </p>
                      </div>

                      {/* Timeline & Audio Button Core Controls */}
                      <div className="bg-black/75 backdrop-blur-md rounded border border-white/10 p-3 flex flex-col gap-2.5 shadow-xl">
                        <div
                          onClick={handleProgressBarClick}
                          className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden relative cursor-pointer group"
                        >
                          <div
                            style={{
                              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                            }}
                            className="bg-white h-full rounded-full relative transition-all duration-100 ease-linear"
                          />
                        </div>

                        <div className="flex items-center justify-between text-zinc-400 px-0.5">
                          <button className="hover:text-white transition-colors">
                            <Shuffle size={11} />
                          </button>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={handlePrevTrack}
                              className="hover:text-white transition-colors"
                            >
                              <SkipBack size={12} fill="currentColor" />
                            </button>
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
                            >
                              {isPlaying ? (
                                <Pause size={10} fill="currentColor" />
                              ) : (
                                <Play
                                  size={10}
                                  className="ml-0.5"
                                  fill="currentColor"
                                />
                              )}
                            </button>
                            <button
                              onClick={handleNextTrack}
                              className="hover:text-white transition-colors"
                            >
                              <SkipForward size={12} fill="currentColor" />
                            </button>
                          </div>

                          <span className="text-[9px] font-mono font-medium tracking-tight text-zinc-500">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------- SECTOR KANAN: TEXTUAL METADATA ---------------- */}
                <div className="max-w-xs md:max-w-sm bg-transparent text-left space-y-3 z-20 ml-6">
                  <div className="border-b border-zinc-800/80 pb-2">
                    <span className="font-mono text-[9px] text-zinc-600 tracking-widest uppercase block mb-0.5">
                      {currentTab === "albums"
                        ? "Now Playing Album Archive"
                        : "Digital Audio File Metadata"}
                    </span>
                    <h2 className="font-serif text-3xl text-zinc-200 leading-tight">
                      {activeItem.title}
                    </h2>
                    <p className="font-mono text-[11px] text-zinc-500">
                      {activeItem.artist}
                    </p>
                  </div>
                  <p className="text-xs md:text-[13px] text-zinc-400 leading-relaxed font-light tracking-wide font-sans">
                    {activeItem.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full pt-4 border-t border-zinc-950 text-[10px] font-mono text-zinc-600 flex justify-between items-center">
        <p>© 2026 Oblique System Web Architecture</p>
        <p>Connected & Synced with Postgres Skema</p>
      </footer>
    </div>
  );
}
