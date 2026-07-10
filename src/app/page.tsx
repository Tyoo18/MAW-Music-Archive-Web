// [INIT]: Import fonts dan icons pendukung
import { Search, Grid, Trash2, Disc } from "lucide-react";
import { Cormorant_Garamond, Inter } from "next/font/google";

// [INIT]: Inisialisasi font untuk tipografi yang thoughtful
const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-serif",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// [UTIL]: Koordinat tetap untuk scattered layout biar estetik & anti-hydration error
const MOCK_VINYLS = [
  {
    id: "v1",
    catalog: "CAT-1975-01",
    title: "ALBUM TITLE PLACEHOLDER",
    artist: "Artist Name / Project I",
    top: "5%",
    left: "12%",
    rotate: "-5deg",
    bgColor: "bg-zinc-800",
  },
  {
    id: "v2",
    catalog: "CAT-1982-04",
    title: "SOUNDTRACK ARCHIVE II",
    artist: "Acoustic & Modular Sync",
    top: "18%",
    left: "38%",
    rotate: "4deg",
    bgColor: "bg-neutral-800",
  },
  {
    id: "v3",
    catalog: "CAT-2001-09",
    title: "RESONANCE FREQUENCY",
    artist: "The Midnight Low-Fi",
    top: "8%",
    left: "64%",
    rotate: "-3deg",
    bgColor: "bg-stone-800",
  },
  {
    id: "v4",
    catalog: "CAT-2026-X",
    title: "UNRELEASED TAPE NO. 4",
    artist: "Unknown Collective",
    top: "42%",
    left: "22%",
    rotate: "7deg",
    bgColor: "bg-slate-800",
  },
];

export default function Page() {
  return (
    // [STYLE]: Main container dengan warna off-black/charcoal dan text-zinc[cite: 1]
    <div
      className={`${sansFont.variable} ${serifFont.variable} font-sans min-h-screen bg-[#121212] text-[#e4e4e7] selection:bg-zinc-700 px-8 py-4 flex flex-col justify-between overflow-x-hidden`}
    >
      {/* ==================== TOP NAVIGATION ==================== */}
      {/* [RENDER]: Header & Navigasi Utama sesuai image_27b6dc.png[cite: 1] */}
      <header className="w-full flex items-center justify-between text-xs tracking-wider text-zinc-400 border-b border-zinc-900 pb-4">
        {/* [STYLE]: Left links[cite: 1] */}
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

        {/* [STYLE]: Center Logo & Search[cite: 1] */}
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

        {/* [STYLE]: Right links[cite: 1] */}
        <nav className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">
            About
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Sign up
          </a>
        </nav>
      </header>

      {/* ==================== HERO & TYPOGRAPHY SECTION ==================== */}
      <main className="flex-1 flex flex-col mt-10">
        {/* [RENDER]: Breadcrumbs & Utility bar dengan margin-left 32[cite: 1] */}
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

        {/* [RENDER]: Main Title & Metadata Header[cite: 1] */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 border-b border-zinc-900 pb-4 ml-32">
          <h1 className="font-serif text-5xl md:col-span-3 text-zinc-200 tracking-tight leading-none">
            Repository of Remnants
          </h1>
          <div className="text-right font-mono text-[11px] text-zinc-500 space-y-0.5 md:col-span-1 hidden md:block mr-32">
            <p>Archive Assemblage</p>
            <p className="text-zinc-400">Jul 29, 1975</p>
          </div>
        </div>

        {/* [RENDER]: Two-Column Description (Lorem Ipsum)[cite: 1] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6 max-w-4xl text-xs md:text-[13px] text-zinc-400 leading-relaxed font-light tracking-wide ml-32">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur.
          </p>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Status labels indicate
            the integrity of each record, with entries marked as active, pending
            validation, or archived for reference only.
          </p>
        </div>

        {/* ==================== ORGANIC SCATTERED LAYOUT CANVAS ==================== */}
        {/* [STYLE]: Canvas area relative sebagai anchor posisi absolute vinyl cover */}
        <div className="flex-1 min-h-125 w-full relative mt-12 select-none">
          {/* [RENDER]: Loop data vinyl polosan dengan absolute layout */}
          {MOCK_VINYLS.map((vinyl) => (
            <div
              key={vinyl.id}
              className="absolute w-56 group cursor-pointer transition-all duration-300 hover:z-50"
              style={{
                top: vinyl.top,
                left: vinyl.left,
                transform: `rotate(${vinyl.rotate})`,
              }}
            >
              {/* [STYLE]: Mockup Sleeve Vinyl (Aspek 1:1, border halus, bayangan tebal) */}
              <div
                className={`w-full aspect-square ${vinyl.bgColor} border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] p-5 flex flex-col justify-between relative overflow-hidden rounded-sm`}
              >
                {/* Efek tekstur kardus/sleeve jadul tipis */}
                <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/5 pointer-events-none" />

                {/* Header info kecil khas rilisan fisik */}
                <div className="flex justify-between items-start font-mono text-[9px] text-zinc-500 tracking-wider">
                  <span>{vinyl.catalog}</span>
                  <Disc size={12} className="text-zinc-600 animate-pulse" />
                </div>

                {/* Tengah polosan: Kasih placeholder lingkaran tengah piringan hitam samar */}
                <div className="w-16 h-16 rounded-full border border-zinc-700/30 self-center flex items-center justify-center opacity-40">
                  <div className="w-4 h-4 rounded-full bg-zinc-900" />
                </div>

                {/* Footer metadata album */}
                <div className="space-y-1 z-10">
                  <h3 className="font-mono text-[10px] text-zinc-300 font-semibold tracking-wide leading-tight line-clamp-1">
                    {vinyl.title}
                  </h3>
                  <p className="font-serif italic text-xs text-zinc-400 line-clamp-1">
                    {vinyl.artist}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      {/* [RENDER]: Footer penutup[cite: 1] */}
      <footer className="w-full pt-4 border-t border-zinc-900 text-[10px] font-mono text-zinc-600 flex justify-between items-center">
        <p>© 2026 Music Archive Web Project</p>
        <p>Built with Next.js & Tailwind</p>
      </footer>
    </div>
  );
}
