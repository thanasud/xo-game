import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongo";
import type { Game, Player, Result } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const _id = new ObjectId(id);
    const body = await req.json();
    const result: Result = body?.result;
    const winner: Player | undefined = body?.winner;

    if (result !== "X" && result !== "O" && result !== "draw") {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }
    if (result !== "draw" && winner !== "X" && winner !== "O") {
      return NextResponse.json({ error: "Winner required when result is X/O" }, { status: 400 });
    }

    const games = await getCollection<Game>("games");
    const game = await games.findOne({ _id });
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await games.updateOne(
      { _id },
      { $set: { result, winner: result === "draw" ? undefined : winner, finishedAt: new Date() } }
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/games/:id/finish]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
