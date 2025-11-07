"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listGames } from "@/lib/api";
import { ArrowTopRightOnSquareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Games</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 ml-auto rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          disabled={refreshing}
          onClick={() => {
            setRefreshing(true);
            listGames()
              .then((d) => setItems(d.games))
              .catch((e) => setError(String(e?.message || e)))
              .finally(() => setRefreshing(false));
          }}
        >
          <ArrowPathIcon className={["w-4 h-4", refreshing ? "animate-spin" : ""].join(" ")} aria-hidden="true" />
          {refreshing ? "Loading" : "Refresh"}
        </button>
      </div>
      {loading && <div className="text-sm text-neutral-500">Loading...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <ul className="divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        {items.map((g) => {
          const created = g.createdAt
            ? new Date(g.createdAt).toLocaleString()
            : "";
          const badge = g.result
            ? g.result === "draw"
              ? { text: "Draw", cls: "bg-neutral-100 text-neutral-700" }
              : {
                  text: `Win ${g.winner}`,
                  cls: g.winner === "X" ? "bg-sky-100 text-sky-700" : "bg-rose-100 text-rose-700",
                }
            : { text: "Abort", cls: "bg-slate-100 text-slate-700" };
          return (
            <li key={g.id} className="p-3 flex items-center gap-3">
              <div className={`text-xs px-2 py-0.5 rounded-full ${badge.cls}`}>
                {badge.text}
              </div>
              <div className="text-sm flex-1">
                <div className="font-medium">
                  {g.size}x{g.size} • moves: {g.moveCount}
                </div>
                <div className="text-neutral-500">{created}</div>
              </div>
              <Link href={`/replay/${g.id}`} className="inline-flex items-center gap-1 text-sky-700 hover:underline text-sm">
                <ArrowTopRightOnSquareIcon
                  className="w-4 h-4"
                  aria-hidden="true"
                />
                Replay
              </Link>
            </li>
          );
        })}
        {items.length === 0 && !loading && (
          <li className="p-3 text-sm text-neutral-500">No games yet</li>
        )}
      </ul>
    </div>
  );
}
