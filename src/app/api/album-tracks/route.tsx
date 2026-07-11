import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");
  const album = searchParams.get("album");

  if (!artist || !album) {
    return NextResponse.json(
      { error: "artist & album are required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }

  try {
    const targetUrl = `http://ws.audioscrobbler.com/2.0/?method=album.getInfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${apiKey}&format=json`;
    const res = await fetch(targetUrl);
    const data = await res.json();

    // [VALIDATE]: album.getInfo tetap balikin 200 OK walau albumnya gak ketemu,
    // errornya nyempil di body, bukan di HTTP status
    if (data.error) {
      return NextResponse.json(
        { error: data.message || "Album not found" },
        { status: 404 },
      );
    }

    const albumInfo = data.album;
    const rawTracks = albumInfo?.tracks?.track || [];
    // [NOTE]: kalau album cuma 1 track, Last.fm balikin object tunggal, bukan array — normalize dulu
    const trackList = Array.isArray(rawTracks) ? rawTracks : [rawTracks];

    const coverImg = albumInfo?.image?.[3]?.["#text"] || "";

    const formattedTracks = trackList.map((track: any, index: number) => ({
      id: `track-${Date.now()}-${index}`,
      title: track.name,
      artist: albumInfo.artist,
      album: albumInfo.name,
      coverImg,
      catalog: `OBLQ-${Math.floor(1000 + Math.random() * 9000)}`,
      bgColor: "bg-zinc-900",
    }));

    return NextResponse.json(formattedTracks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch album tracks" },
      { status: 500 },
    );
  }
}