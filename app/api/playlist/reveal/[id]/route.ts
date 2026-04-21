import { connectDB } from "@/lib/mongodb";
import Playlist from "@/lib/models/Playlist";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const playlist = await Playlist.findById(id).select('content').lean();
    
    if (!playlist) {
      return NextResponse.json({ error: "Playlist non trouvée" }, { status: 404 });
    }

    // L'URL est souvent contenue dans le champ 'content' ou est l'url elle-même
    // Si c'est une liste M3U, on extrait l'URL si elle est stockée séparément 
    // ou on renvoie le contenu. Dans ce projet, 'content' semble être l'URL 
    // ou le fichier. L'utilisateur demande 'playlist.url'. 
    // Vérifions si le champ 'url' existe ou si c'est 'content'.
    
    // @ts-ignore
    const url = playlist.url || playlist.content;

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
