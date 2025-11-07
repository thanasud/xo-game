import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongo";
import type { Game, Player } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const _id = new ObjectId(id);
    const body = await req.json();
    const index = Number(body?.index);
    const player: Player = body?.player === "O" ? "O" : body?.player === "X" ? "X" : (null as any);
    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }
    if (player !== "X" && player !== "O") {
      return NextResponse.json({ error: "Invalid player" }, { status: 400 });
    }

    const games = await getCollection<Game>("games");
    const game = await games.findOne({ _id });
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (game.result) return NextResponse.json({ error: "Game already finished" }, { status: 409 });

    // Validate move legality
    const size = game.size;
    const total = size * size;
    if (index >= total) return NextResponse.json({ error: "Index out of range" }, { status: 400 });

    const board = Array<CellLike>(total).fill(null);
    for (const m of game.moves) board[m.index] = m.player;
    if (board[index] !== null) return NextResponse.json({ error: "Cell occupied" }, { status: 409 });

    const expected: Player = (game.moves.length % 2 === 0) ? game.firstPlayer : (game.firstPlayer === "X" ? "O" : "X");
    if (player !== expected) return NextResponse.json({ error: `Not ${player}'s turn` }, { status: 409 });

    const turn = game.moves.length + 1;
    const move = { turn, player, index, createdAt: new Date() };
    await games.updateOne({ _id }, { $push: { moves: move } });
    return NextResponse.json({ ok: true, move });
  } catch (err: any) {
    console.error("[POST /api/games/:id/moves]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

type CellLike = Player | null;
