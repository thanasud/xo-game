import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongo";
import type { Game } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const _id = new ObjectId(id);
    const games = await getCollection<Game>("games");
    const game = await games.findOne({ _id });
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ game: { ...game, id: game._id?.toString() } });
  } catch (err: any) {
    console.error("[GET /api/games/:id]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
