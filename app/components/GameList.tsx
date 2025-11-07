"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listGames } from "@/lib/api";
import {
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

type Item = {
  id: string;
  size: number;
  firstPlayer: "X" | "O";
  createdAt: string;
  finishedAt?: string;
  result?: "X" | "O" | "draw";
  winner?: "X" | "O";
  moveCount: number;
};

export default function GameList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listGames()
      .then((d) => mounted && setItems(d.games))
      .catch((e) => mounted && setError(String(e?.message || e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-semibold text-neutral-900">Recent Games</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 ml-auto rounded-md border border-neutral-300 px-2 py-1.5 text-base text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
          disabled={refreshing}
          onClick={() => {
            setRefreshing(true);
            listGames()
              .then((d) => setItems(d.games))
              .catch((e) => setError(String(e?.message || e)))
              .finally(() => setRefreshing(false));
          }}
        >
          <ArrowPathIcon className={["w-5 h-5", refreshing ? "animate-spin" : ""].join(" ")} aria-hidden="true" />
          {refreshing ? "Loading" : "Refresh"}
        </button>
      </div>
      {error && <div className="text-base text-red-600 mb-2">{error}</div>}

      <ul className="flex-1 min-h-0 max-h-[570px] overflow-auto divide-y divide-neutral-200 pr-1">
        {items.map((g) => {
          const created = g.createdAt
            ? new Date(g.createdAt).toLocaleString()
            : "";
          const badge = g.result
            ? g.result === "draw"
              ? { text: "Draw", cls: "bg-neutral-100 text-neutral-700" }
              : {
                  text: `Win ${g.winner}`,
                  cls:
                    g.winner === "X"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-rose-100 text-rose-700",
                }
            : { text: "Abort", cls: "bg-slate-100 text-slate-700" };
          return (
            <li key={g.id} className="grid grid-cols-[120px_1fr_auto] items-center gap-4 p-4 min-h-14">
              <div className={`inline-flex items-center justify-center h-7 w-28 rounded-full text-sm whitespace-nowrap ${badge.cls}`}>{badge.text}</div>
              <div className="leading-tight">
                <div className="text-lg text-neutral-900">
                  {g.size}x{g.size} • moves: {g.moveCount}
                </div>
                <div className="text-sm text-neutral-500">{created}</div>
              </div>
              <Link href={`/replay/${g.id}`} className="inline-flex items-center gap-2 text-sky-700 hover:underline text-lg shrink-0">
                <ArrowTopRightOnSquareIcon className="w-5 h-5" aria-hidden="true" />
                Replay
              </Link>
            </li>
          );
        })}
        {items.length === 0 && !loading && (
          <li className="p-4 text-lg text-neutral-500">No games yet</li>
        )}
      </ul>
      {/* <div className="mt-2 text-xs text-neutral-500">Tip: You can review the game by pressing Replay.</div> */}
    </div>
  );
}
