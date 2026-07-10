import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // [INIT]: Ambil query parameter 'q' dari URL request frontend
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // [VALIDATE]: Pastiin query-nya gak kosong biar ga mubazir nembak API
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.LASTFM_API_KEY;

  // [VALIDATE]: Safety check barangkali lu lupa pasang di env.local
  if (!apiKey) {
    return NextResponse.json(
      { error: "API Key missing in server environment" },
      { status: 500 },
    );
  }

  try {
    // [FETCH]: Tembak endpoint pencarian album milik Last.fm API
    const targetUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=5`;
    const res = await fetch(targetUrl);
    const data = await res.json();

    // [FORMAT]: Ekstrak data mentah Last.fm jadi struktur data bersih yang ramah buat UI Oblique lu
    const albums = data.results?.albummatches?.album || [];
    const formattedResults = albums.map((album: any, index: number) => ({
      id: `track-${Date.now()}-${index}`,
      title: album.name,
      artist: album.artist,
      // Last.fm ngasih beberapa size gambar, kita ambil indeks ke-3 (extralarge) biar jernih cover-nya
      coverImg: album.image?.[3]?.["#text"] || "/covers/1.png",
      catalog: `OBLQ-${Math.floor(1000 + Math.random() * 9000)}`,
      bgColor: "bg-zinc-900",
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch metadata from server" },
      { status: 500 },
    );
  }
}
