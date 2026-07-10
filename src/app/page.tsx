// [INIT]: Import fonts dan icons pendukung
import { Search, Grid, Trash2 } from "lucide-react";
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

export default function Page() {
  return (
    // [STYLE]: Main container dengan warna off-black/charcoal dan text-zinc
    <div
      className={`${sansFont.variable} ${serifFont.variable} font-sans min-h-screen bg-[#121212] text-[#e4e4e7] selection:bg-zinc-700 px-8 py-4 flex flex-col justify-between overflow-x-hidden`}
    >
      {/* ==================== TOP NAVIGATION ==================== */}
      {/* [RENDER]: Header & Navigasi Utama sesuai image_27523b.png */}
      <header className="w-full flex items-center justify-between text-xs tracking-wider text-zinc-400 border-b border-zinc-900 pb-4">
        {/* [STYLE]: Left links */}
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

        {/* [STYLE]: Center Logo & Search */}
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

        {/* [STYLE]: Right links */}
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
        {/* [RENDER]: Breadcrumbs & Utility bar */}
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

        {/* [RENDER]: Main Title & Metadata Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 border-b border-zinc-900 pb-4 ml-32">
          <h1 className="font-serif text-5xl md:col-span-3 text-zinc-200 tracking-tight leading-none">
            Repository of Remnants
          </h1>
          <div className="text-right font-mono text-[11px] text-zinc-500 space-y-0.5 md:col-span-1 hidden md:block mr-32">
            <p>Archive Assemblage</p>
            <p className="text-zinc-400">Jul 29, 1975</p>
          </div>
        </div>

        {/* [RENDER]: Two-Column Description (Lorem Ipsum) */}
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

        {/* ==================== CANVAS PLACEHOLDER ==================== */}
        {/* [STYLE]: Area kosong buat tempat berserakannya vinyl nanti */}
        <div className="flex-1 min-h-87.5 w-full relative mt-8 rounded-lg border border-dashed border-zinc-900/50 flex items-center justify-center text-zinc-700 text-xs font-mono select-none">
          [ Organic Scattered Layout Canvas - Ready for Next Phase ]
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="w-full pt-4 border-t border-zinc-900 text-[10px] font-mono text-zinc-600 flex justify-between items-center">
        <p>© 2026 Music Archive Web Project</p>
        <p>Built with Next.js & Tailwind</p>
      </footer>
    </div>
  );
}
