"use client";

// [INIT]: Import React hooks dan Framer Motion untuk kelenturan animasi koreografi
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// [INIT]: Import icons esensial untuk audio kontrol & navigation dari Lucide React
import {
  Search,
  Grid,
  Trash2,
  Disc,
  Play,
  Pause,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Cormorant_Garamond, Inter } from "next/font/google";

// [INIT]: Typography setup dengan visual hierarchy yang kontras & thoughtful
const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// [UTIL]: Mock data struktur database-ready dengan koordinat posisi tersimpan
const MOCK_VINYLS = [
  {
    id: "v1",
    catalog: "CAT-1975-01",
    title: "DEPRESSION CHERRY",
    artist: "Beach House",
    posTop: "14%",
    posLeft: "12%",
    posRotate: "-6deg",
    bgColor: "bg-red-950",
    coverImg: "/covers/1.png",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse at orci eget diam placerat iaculis. Mauris porta quam ut risus blandit ornare. Nam dignissim rutrum suscipit. Mauris at vehicula neque, non venenatis mi. Morbi quis vestibulum tellus. In sem metus, gravida sit amet.",
  },
  {
    id: "v2",
    catalog: "CAT-1982-04",
    title: "SOUNDTRACK ARCHIVE II",
    artist: "Acoustic & Modular Sync",
    posTop: "24%",
    posLeft: "40%",
    posRotate: "4deg",
    bgColor: "bg-zinc-800",
    coverImg: "/covers/2.png",
    description:
      "Donec nibh neque, porttitor eu lorem ac, congue faucibus nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Sed ac ex vel magna feugiat finibus.",
  },
  {
    id: "v3",
    catalog: "CAT-2001-09",
    title: "RESONANCE FREQUENCY",
    artist: "The Midnight Low-Fi",
    posTop: "12%",
    posLeft: "66%",
    posRotate: "-3deg",
    bgColor: "bg-stone-800",
    coverImg: "/covers/3.png",
    description:
      "Ut efficitur vulputate diam, ac scelerisque erat convallis vel. Vestibulum sit amet elementum dolor, non efficitur nisl. Aliquam dictum pretium efficitur. Integer sodales ac nisl ac congue.",
  },
  {
    id: "v4",
    catalog: "CAT-2015-11",
    title: "MELANCHOLIA IN BLUE",
    artist: "Velvet Echoes",
    posTop: "48%",
    posLeft: "22%",
    posRotate: "5deg",
    bgColor: "bg-slate-900",
    coverImg: "/covers/4.png",
    description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    id: "v5",
    catalog: "CAT-2022-07",
    title: "NEON SHADOWS",
    artist: "Tokyo Synthwave Lab",
    posTop: "42%",
    posLeft: "55%",
    posRotate: "-4deg",
    bgColor: "bg-neutral-900",
    coverImg: "/covers/5.png",
    description:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio.",
  },
];

export default function Page() {
  // [STATE]: Switcher halaman aktif antara mode tumpukan album atau single file digital
  const [currentTab, setCurrentTab] = useState<"albums" | "tracks">("albums");
  // [STATE]: Menyimpan ID album arsip aktif yang sedang di-fokuskan di modal player
  const [activeId, setActiveId] = useState<string | null>(null);
  // [STATE]: State sementara untuk nge-handle micro-interaction slide-out single track sebelum modal bangun
  const [slidingId, setSlidingId] = useState<string | null>(null);
  // [STATE]: Menyimpan status trigger putaran audio (play/pause)
  const [isPlaying, setIsPlaying] = useState(false);

  // [HANDLER]: Membuka modal detail album langsung (untuk Mode Album)
  const handleAlbumClick = (id: string) => {
    setActiveId(id);
    setIsPlaying(false);
  };

  // [HANDLER]: Memicu sekuens animasi slide-out ke atas (untuk Mode Single Track)
  const handleTrackClick = (id: string) => {
    if (!slidingId && !activeId) {
      setSlidingId(id);
    }
  };

  // [HANDLER]: Callback pas animasi slide-out selesai, langsung oper ke modal player utama
  const handleTrackAnimationComplete = (id: string) => {
    if (slidingId === id) {
      setActiveId(id);
      setSlidingId(null);
      setIsPlaying(false);
    }
  };

  // [HANDLER]: Reset state fokus pas area backdrop di-klik
  const handleClose = () => {
    setActiveId(null);
    setSlidingId(null);
    setIsPlaying(false);
  };

  // [CALC]: Kalkulasi penarikan data objek item yang aktif berdasarkan ID
  const activeItem = MOCK_VINYLS.find((v) => v.id === activeId);

  return (
    // [STYLE]: Base canvas layout pembungkus global dengan inject variables font kustom
    <div
      className={`${sansFont.variable} ${serifFont.variable} font-sans min-h-screen bg-[#0d0d0d] text-[#e4e4e7] selection:bg-zinc-700 px-8 py-4 flex flex-col justify-between overflow-x-hidden`}
    >
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
          <a href="#" className="hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Sign up
          </a>
        </nav>
      </header>

      {/* ==================== MAIN CORE SECTION ==================== */}
      <main className="flex-1 flex flex-col mt-10 relative">
        {/* ---------------- INTERFACES 1: MODE ALBUMS (ORGANIC SCATTERED) ---------------- */}
        {currentTab === "albums" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col flex-1"
          >
            <div className="w-full flex items-center justify-between text-[11px] tracking-wide text-zinc-600 mb-6 ml-32"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 border-b border-zinc-950 pb-4 ml-32">
              <h1 className="font-serif text-5xl md:col-span-3 text-zinc-200 tracking-tight leading-none">
                Repository of Remnants
              </h1>
              <div className="text-right font-mono text-[11px] text-zinc-500 space-y-0.5 md:col-span-1 hidden md:block mr-32">
                <p>Archive Assemblage</p>
                <p className="text-zinc-400">Jul 29, 1975</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6 max-w-4xl text-xs md:text-[13px] text-zinc-400 leading-relaxed font-light tracking-wide ml-32">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa
                qui officia deserunt mollit anim id est laborum. Status labels
                indicate the integrity of each record.
              </p>
            </div>

            {/* Area Persebaran Album Organik */}
            <div className="flex-1 min-h-120 w-full relative mt-8">
              {MOCK_VINYLS.map((vinyl) => (
                <div
                  key={vinyl.id}
                  onClick={() => handleAlbumClick(vinyl.id)}
                  className="absolute w-52 group cursor-pointer transition-transform duration-300 hover:scale-105"
                  style={{
                    top: vinyl.posTop,
                    left: vinyl.posLeft,
                    transform: `rotate(${vinyl.posRotate})`,
                  }}
                >
                  <div
                    className={`w-full aspect-square ${vinyl.bgColor} border border-white/5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] p-4 flex flex-col justify-between relative overflow-hidden rounded-sm`}
                  >
                    <img
                      src={vinyl.coverImg}
                      className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-10" />

                    <div className="flex justify-between items-start font-mono text-[8px] text-zinc-300 z-20">
                      <span>{vinyl.catalog}</span>
                      <Disc size={11} className="text-zinc-400" />
                    </div>
                    <div className="z-20">
                      <h3 className="font-mono text-[9px] text-white font-semibold tracking-wide line-clamp-1">
                        {vinyl.title}
                      </h3>
                      <p className="font-serif italic text-[11px] text-zinc-300 line-clamp-1">
                        {vinyl.artist}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ---------------- INTERFACES 2: MODE SINGLE TRACK (DIAGONAL PERSPECTIVE DECK) ---------------- */}
        {currentTab === "tracks" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center items-center min-h-137.5 relative"
          >
            {/* Teks Deskripsi Estetik Atas */}
            <div className="absolute top-0 left-32 max-w-xs font-mono text-[11px] text-zinc-600 space-y-1">
              <p className="text-zinc-500 uppercase tracking-wider">
                Digital Indexing Rack
              </p>
              <p className="font-light leading-relaxed">
                Perspective sequence mapping for individual track metadata
                architecture.
              </p>
            </div>

            {/* [STYLE]: Parent container pake nilai perspective god-mode 65536px temuan lu */}
            <div
              className="relative w-full max-w-5xl h-125 flex items-center justify-center mt-8"
              style={{ perspective: "65536px" }}
            >
              {(() => {
                // [CALC]: Cari tahu kartu mana yang lagi aktif/sliding biar sisa barisan tahu harus merapat ke mana
                const targetId = slidingId || activeId;
                const targetIndex = MOCK_VINYLS.findIndex(
                  (v) => v.id === targetId,
                );
                const totalItems = MOCK_VINYLS.length;

                return MOCK_VINYLS.map((track, index) => {
                  const isSliding = slidingId === track.id;
                  const isActive = activeId === track.id;

                  // [CALC]: Logika geser sisa barisan. Kalau kartu di depannya dicabut, kartu belakang otomatis kurangi indeksnya (maju)
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
                              // KUNCI 1: Balikin opacity ke 0 biar memudar halus sepanjang jalan pas meluncur (ga nge-snap lagi)
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
                                // Tetap kunci posisi di luar pas modal overlay kebuka
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
                                // KUNCI 2: Kartu lain dipaksa pake visualIndex biar otomatis merapat nutupin celah kosong
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
                              // Hover juga disesuaikan ke posisi visual terbarunya
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
                        handleTrackAnimationComplete(track.id)
                      }
                      className="absolute w-64 h-64 cursor-pointer origin-center shadow-[-20px_25px_50px_rgba(0,0,0,0.85)] border border-white/10 rounded-xs overflow-hidden select-none bg-zinc-950"
                    >
                      {/* Tampilan Konten di Dalam Kartu Rack */}
                      <div
                        className={`w-full h-full ${track.bgColor} p-5 flex flex-col justify-between relative`}
                      >
                        <img
                          src={track.coverImg}
                          className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none z-0"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/5 z-10" />

                        {/* Top metadata label */}
                        <div className="flex justify-between items-center font-mono text-[9px] text-zinc-400 z-20">
                          <span>{track.catalog}</span>
                          <span className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded-xs tracking-widest text-white font-bold uppercase">
                            Track
                          </span>
                        </div>

                        {/* Bottom title info */}
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

        {/* ==================== CENTERED BACKDROP BLUR OVERLAY (MODAL PLAYER) ==================== */}
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
                {/* ---------------- SECTOR KIRI: AUDIO MECHANISM COVER ---------------- */}
                <div className="relative w-80 h-80 flex items-center shrink-0">
                  {/* [RENDER]: Piringan hitam vinyl HANYA muncul pas di mode Albums */}
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
                    className={`w-full h-full ${activeItem.bgColor} border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] p-6 flex flex-col justify-between relative overflow-hidden rounded-sm z-10`}
                  >
                    <img
                      src={activeItem.coverImg}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

                    {/* Top status bar icon */}
                    <div className="flex justify-between items-start font-mono text-[9px] text-zinc-300 z-20">
                      <span>{activeItem.catalog}</span>
                      <Disc
                        size={12}
                        className={`text-zinc-300 ${isPlaying && currentTab === "albums" ? "animate-spin" : ""}`}
                        style={{ animationDuration: "3s" }}
                      />
                    </div>

                    {/* Bottom layout identity & compact player control */}
                    <div className="z-20 space-y-3 flex flex-col justify-end">
                      <div className="space-y-0.5 px-0.5">
                        <h3 className="font-mono text-[11px] text-white font-bold tracking-wider uppercase leading-tight">
                          {activeItem.title}
                        </h3>
                        <p className="font-serif italic text-xs text-zinc-300 font-light">
                          {activeItem.artist}
                        </p>
                      </div>

                      {/* Player Control Overlay */}
                      <div className="bg-black/75 backdrop-blur-md rounded border border-white/10 p-3 flex flex-col gap-2.5 shadow-xl">
                        {/* 1. Progress Bar horizontal slider */}
                        <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden relative cursor-pointer group">
                          <motion.div
                            animate={{ width: isPlaying ? "100%" : "35%" }}
                            transition={{
                              duration: isPlaying ? 45 : 0.3,
                              ease: "linear",
                            }}
                            className="bg-white h-full rounded-full relative"
                          />
                        </div>

                        {/* 2. Audio Control Button Bar */}
                        <div className="flex items-center justify-between text-zinc-400 px-0.5">
                          <button className="hover:text-white transition-colors active:scale-90">
                            <Shuffle size={11} />
                          </button>

                          <div className="flex items-center gap-3">
                            <button className="hover:text-white transition-colors active:scale-90">
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

                            <button className="hover:text-white transition-colors active:scale-90">
                              <SkipForward size={12} fill="currentColor" />
                            </button>
                          </div>

                          <span className="text-[9px] font-mono font-medium tracking-tight text-zinc-500">
                            {isPlaying ? "0:18" : "0:00"} / 03:45
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------- SECTOR KANAN: DESCRIPTION ALBUM/TRACK FIXED ---------------- */}
                <div className="max-w-xs md:max-w-sm bg-transparent text-left space-y-3 z-20 ml-6">
                  <div className="border-b border-zinc-800/80 pb-2">
                    <span className="font-mono text-[9px] text-zinc-600 tracking-widest uppercase block mb-0.5">
                      {currentTab === "albums"
                        ? "Now Playing Archive"
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
        <p>© 2026 Music Archive Web Project</p>
        <p>Built with Next.js & Tailwind</p>
      </footer>
    </div>
  );
}
