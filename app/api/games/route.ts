import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongo";
import type { Game, Player } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const size = Number.isFinite(body?.size) ? Math.max(3, Math.min(50, Number(body.size))) : 3;
    const firstPlayer: Player = body?.firstPlayer === "O" ? "O" : "X";

    const games = await getCollection<Game>("games");
    const doc: Game = {
      size,
      firstPlayer,
      createdAt: new Date(),
      moves: [],
    };
    const res = await games.insertOne(doc as any);
    return NextResponse.json({ id: (res.insertedId as ObjectId).toString() }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/games]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const games = await getCollection<Game>("games");
    const items = await games
      .aggregate([
        { $match: { "moves.0": { $exists: true } } },
        { $sort: { createdAt: -1 } },
        { $limit: 50 },
        {
          $project: {
            size: 1,
            firstPlayer: 1,
            createdAt: 1,
            finishedAt: 1,
            result: 1,
            winner: 1,
            moveCount: { $size: "$moves" },
          },
        },
      ])
      .toArray();

    const mapped = items.map((g: any) => ({
      id: (g._id as ObjectId).toString(),
      size: g.size,
      firstPlayer: g.firstPlayer,
      createdAt: g.createdAt,
      finishedAt: g.finishedAt,
      result: g.result,
      winner: g.winner,
      moveCount: g.moveCount as number,
    }));
    return NextResponse.json({ games: mapped });
  } catch (err: any) {
    console.error("[GET /api/games]", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
