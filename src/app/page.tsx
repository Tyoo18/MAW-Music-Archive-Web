"use client";

// [INIT]: Import React hooks dan Framer Motion untuk animasi tactile
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// [INIT]: Import icons pendukung dari Lucide React
import { Search, Grid, Trash2, Disc, Play, Pause } from "lucide-react";
import { Cormorant_Garamond, Inter } from "next/font/google";

// [INIT]: Setup typography pairing yang thoughtful sesuai pembaharuan lu
const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// [UTIL]: Dummy data album lengkap (5 item) dengan pemetaan file cover 1-5.png
const MOCK_VINYLS = [
  {
    id: "v1",
    catalog: "CAT-1975-01",
    title: "DEPRESSION CHERRY",
    artist: "Beach House",
    top: "14%",
    left: "12%",
    rotate: "-6deg",
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
    top: "24%",
    left: "40%",
    rotate: "4deg",
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
    top: "12%",
    left: "66%",
    rotate: "-3deg",
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
    top: "48%",
    left: "22%",
    rotate: "5deg",
    bgColor: "bg-slate-900",
    coverImg: "/covers/4.png", // Membaca public/covers/4.png
    description:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  },
  {
    id: "v5",
    catalog: "CAT-2022-07",
    title: "NEON SHADOWS",
    artist: "Tokyo Synthwave Lab",
    top: "42%",
    left: "55%",
    rotate: "-4deg",
    bgColor: "bg-neutral-900",
    coverImg: "/covers/5.png", // Membaca public/covers/5.png
    description:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio.",
  },
];

export default function Page() {
  // [STATE]: Menyimpan ID album yang sedang aktif/diklik
  const [activeId, setActiveId] = useState<string | null>(null);
  // [STATE]: Menyimpan status putaran lagu (play/pause)
  const [isPlaying, setIsPlaying] = useState(false);

  // [HANDLER]: Trigger saat vinyl di tumpukan diklik
  const handleCardClick = (id: string) => {
    setActiveId(id);
    setIsPlaying(false);
  };

  // [HANDLER]: Menutup mode fokus pas klik area buram di luar cover
  const handleClose = () => {
    setActiveId(null);
    setIsPlaying(false);
  };

  // [CALC]: Mengambil data objek album yang lagi aktif
  const activeAlbum = MOCK_VINYLS.find((v) => v.id === activeId);

  return (
    // [STYLE]: Main frame background off-black dengan font global
    <div
      className={`${sansFont.variable} ${serifFont.variable} font-sans min-h-screen bg-[#121212] text-[#e4e4e7] selection:bg-zinc-700 px-8 py-4 flex flex-col justify-between overflow-x-hidden`}
    >
      {/* ==================== TOP NAVIGATION ==================== */}
      <header className="w-full flex items-center justify-between text-xs tracking-wider text-zinc-400 border-b border-zinc-900 pb-4">
        <nav className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">
            Explore
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Timeline
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Map
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Collections
          </a>
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

      {/* ==================== HERO SECTION ==================== */}
      <main className="flex-1 flex flex-col mt-10 relative">
        <div className="w-full flex items-center justify-between text-[11px] tracking-wide text-zinc-600 mb-6 ml-32">
          <div className="font-mono">
            <span>Source</span> / <span>Drawer</span> / <span>Registry</span> /{" "}
            <span className="text-zinc-400">Residue</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hover:text-zinc-400 transition-colors">
              <Trash2 size={14} />
            </button>
            <button className="hover:text-zinc-400 transition-colors">
              <Grid size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 border-b border-zinc-900 pb-4 ml-32">
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
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Status labels indicate
            the integrity of each record.
          </p>
        </div>

        {/* ==================== SCATTERED CANVAS AREA ==================== */}
        <div className="flex-1 min-h-120 w-full relative mt-8">
          {MOCK_VINYLS.map((vinyl) => (
            <div
              key={vinyl.id}
              onClick={() => handleCardClick(vinyl.id)}
              className="absolute w-52 group cursor-pointer transition-transform duration-300 hover:scale-105"
              style={{
                top: vinyl.top,
                left: vinyl.left,
                transform: `rotate(${vinyl.rotate})`,
              }}
            >
              {/* Tampilan Box Sleeve di tumpukan bawah */}
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

        {/* ==================== CENTERED BACKDROP BLUR OVERLAY ==================== */}
        <AnimatePresence>
          {activeId && activeAlbum && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-6"
            >
              {/* [STYLE]: Kontainer utama pembungkus dengan jarak gap-24 yang pas */}
              <motion.div
                initial={{ scale: 0.96, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 8 }}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col md:flex-row md:items-start items-center justify-center gap-24 max-w-5xl w-full bg-transparent select-none"
              >
                {/* ---------------- SECTOR KIRI: VINYL MECHANISM ---------------- */}
                <div className="relative w-80 h-80 flex items-center shrink-0">
                  {/* Piringan hitam slide-out (Framer Motion hanya handle sumbu X) */}
                  <motion.div
                    initial={{ x: "0%" }}
                    animate={{ x: "48%" }}
                    transition={{ type: "spring", stiffness: 95, damping: 14 }}
                    className="absolute inset-0 h-[98%] aspect-square rounded-full shadow-2xl z-0 overflow-hidden border border-zinc-800/50"
                    style={{ left: "-40px" }}
                  >
                    {/* [STYLE]: Menggunakan native CSS Animation spin + playState toggle biar ngerem statis pas di-pause */}
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

                  {/* Box Sleeve Cover Utama */}
                  <div
                    className={`w-full h-full ${activeAlbum.bgColor} border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] p-6 flex flex-col justify-between relative overflow-hidden rounded-sm z-10`}
                  >
                    <img
                      src={activeAlbum.coverImg}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

                    {/* Info bar atas */}
                    <div className="flex justify-between items-start font-mono text-[9px] text-zinc-300 z-20">
                      <span>{activeAlbum.catalog}</span>
                      <Disc
                        size={12}
                        className={`text-zinc-300 ${isPlaying ? "animate-spin" : ""}`}
                        style={{
                          animationDuration: "3s",
                          animationPlayState: isPlaying ? "running" : "paused",
                        }}
                      />
                    </div>

                    {/* Penempatan Judul & Artist tepat menempel di atas Controls Overlay */}
                    <div className="z-20 space-y-3 flex flex-col justify-end">
                      {/* Teks Identitas Album */}
                      <div className="space-y-0.5 px-0.5">
                        <h3 className="font-mono text-[11px] text-white font-bold tracking-wider uppercase leading-tight">
                          {activeAlbum.title}
                        </h3>
                        <p className="font-serif italic text-xs text-zinc-300 font-light">
                          {activeAlbum.artist}
                        </p>
                      </div>

                      {/* Controls Player Overlay */}
                      <div className="bg-black/75 backdrop-blur-md rounded border border-white/10 p-3 flex flex-col gap-2">
                        {/* Timeline progress */}
                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden relative cursor-pointer">
                          <motion.div
                            animate={{ width: isPlaying ? "100%" : "35%" }}
                            transition={{
                              duration: isPlaying ? 45 : 0.3,
                              ease: "linear",
                            }}
                            className="bg-white h-full rounded-full"
                          />
                        </div>

                        {/* Audio buttons bar */}
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                          <span>{isPlaying ? "0:18" : "0:00"}</span>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                          >
                            {isPlaying ? (
                              <Pause size={9} fill="currentColor" />
                            ) : (
                              <Play
                                size={9}
                                className="ml-0.5"
                                fill="currentColor"
                              />
                            )}
                          </button>
                          <span>03:45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------- SECTOR KANAN: CLEAR DESCRIPTION ---------------- */}
                {/* [STYLE]: Jarak ml-12 lu yang udah pas buat memisahkan panel teks kanan */}
                <div className="max-w-xs md:max-w-sm bg-transparent text-left space-y-3 z-20 ml-6">
                  <div className="border-b border-zinc-800/80 pb-2">
                    <h2 className="font-serif text-3xl text-zinc-200 leading-tight mt-0.5">
                      {activeAlbum.title}
                    </h2>
                    <p className="font-mono text-[11px] text-zinc-500">
                      {activeAlbum.artist}
                    </p>
                  </div>

                  <p className="text-xs md:text-[13px] text-zinc-400 leading-relaxed font-light tracking-wide font-sans">
                    {activeAlbum.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full pt-4 border-t border-zinc-900 text-[10px] font-mono text-zinc-600 flex justify-between items-center">
        <p>© 2026 Music Archive Web Project</p>
        <p>Built with Next.js & Tailwind</p>
      </footer>
    </div>
  );
}
