// [INIT]: Import NextRequest, NextResponse, dan Supabase client builder
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// [INIT]: Inisialisasi Supabase menggunakan Service Role Key khusus backend admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // [FETCH]: Ambil data biner dan metadata teks dari payload FormData frontend
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const artist = formData.get("artist") as string;
    const album = formData.get("album") as string;
    const coverImg = formData.get("coverImg") as string; // Sesuai nama input frontend
    const catalog = formData.get("catalog") as string;
    const description = formData.get("description") as string;
    const bgColor = formData.get("bgColor") as string; // Menangkap warna tema dari UI picker

    // [VALIDATE]: Validasi wajib file audio, judul, dan nama musisi wajib terisi
    if (!file || !title || !artist) {
      return NextResponse.json(
        { error: "Missing required fields (File, Title, or Artist)" },
        { status: 400 },
      );
    }

    // [FORMAT]: Konstruksi nama file acak unik untuk menghindari file overwrite di storage bucket
    const fileExtension = file.name.split(".").pop() || "mp3";
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;

    // [UTIL]: Konversi data stream file menjadi Buffer data mentah untuk kebutuhan upload pipeline
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // [FETCH]: Lempar data binary audio ke dalam storage bucket 'audio-tracks' Supabase
    const { data: storageData, error: storageError } = await supabase.storage
      .from("audio-tracks")
      .upload(`public/${cleanFileName}`, buffer, {
        contentType: "audio/mpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${storageError.message}` },
        { status: 500 },
      );
    }

    // [CALC]: Tarik URL publik permanen dari file mp3 yang sudah berhasil disimpan
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("audio-tracks")
      .getPublicUrl(`public/${cleanFileName}`);

    // [FETCH]: Lakukan operasi INSERT data ke tabel tracks menggunakan nama kolom database lu yang asli
    const { data: dbData, error: dbError } = await supabase
      .from("tracks")
      .insert([
        {
          title,
          artist,
          album: album || "Single Track",
          cover_img: coverImg, // FIX: Menggunakan kolom cover_img sesuai database lu
          audio_url: publicUrl,
          bg_color: bgColor || "bg-zinc-900", // Menjaga konsistensi estetika visual
          catalog:
            catalog || `CAT-2026-${Math.floor(100 + Math.random() * 900)}`,
          description:
            description || "No archival notes provided for this record.",
        },
      ])
      .select();

    if (dbError) {
      return NextResponse.json(
        { error: `Database insertion failed: ${dbError.message}` },
        { status: 500 },
      );
    }

    // [RENDER]: Berikan response balik sukses beserta baris data yang baru terbuat
    return NextResponse.json(
      { success: true, data: dbData[0] },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
