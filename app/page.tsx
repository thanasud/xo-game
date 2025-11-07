"use client";
import { useEffect, useState } from "react";
import { appendMove, createGame, finishGame } from "@/lib/api";
import Board from "./components/Board";
import GameList from "./components/GameList";
import type { Player } from "@/lib/types";
import type { Cell } from "@/lib/logic";
import { calculateWinner, findBotMove } from "@/lib/logic";

export default function Page() {
  const [size, setSize] = useState(3);
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [gameId, setGameId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [botEnabled, setBotEnabled] = useState(true);
  const [lastIdx, setLastIdx] = useState<number | null>(null);

  const winner = calculateWinner(cells, size);
  const isDraw = !winner && cells.every((c) => c !== null);
  const nextPlayer: Player = xIsNext ? "X" : "O";
  const status = winner
    ? `ผู้ชนะ: ${winner}`
    : isDraw
    ? "เสมอ"
    : `ตาถัดไป: ${nextPlayer}${botEnabled && nextPlayer === "O" ? " (บอท)" : ""}`;

  async function tryFinish(next: Cell[]) {
    const w = calculateWinner(next, size);
    const draw = !w && next.every((c) => c !== null);
    if (!gameId) return;
    if (w) await finishGame(gameId, w, w);
    else if (draw) await finishGame(gameId, "draw");
  }

  async function handleClick(idx: number) {
    if (busy) return;
    if (cells[idx] || winner) return;
    const me = nextPlayer;
    const next = cells.slice();
    next[idx] = me;
    setCells(next);
    setXIsNext(!xIsNext);
    setLastIdx(idx);
    try {
      setBusy(true);
      let id = gameId;
      if (!id) {
        id = await createGame(size, "X");
        setGameId(id);
      }
      await appendMove(id, idx, me);
      await tryFinish(next);

      // bot turn
      const stillNoWinner = !calculateWinner(next, size) && next.some((c) => c === null);
      if (botEnabled && stillNoWinner) {
        const botIndex = findBotMove(next, size, "O", "X");
        if (botIndex !== null) {
          const withBot = next.slice();
          withBot[botIndex] = "O";
          setCells(withBot);
          setXIsNext(true);
          setLastIdx(botIndex);
          const gid = id || gameId!;
          await appendMove(gid, botIndex, "O");
          await tryFinish(withBot);
        }
      }
    } catch (err) {
      console.error(err);
      alert("บันทึกตาเดินไม่สำเร็จ ลองเริ่มใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  async function startNewGame(n: number, first: Player) {
    setSize(n);
    setCells(Array(n * n).fill(null));
    setXIsNext(first === "X");
    setLastIdx(null);
    setGameId(null);
  }

  useEffect(() => {
    startNewGame(size, "X");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">XO Game</h1>
        </header>

        <section className="grid md:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 bg-white">
              <div className="mb-3 flex items-center justify-between">
                <div className={`text-xs px-2 py-0.5 rounded-full ${winner ? "bg-emerald-100 text-emerald-700" : isDraw ? "bg-neutral-100 text-neutral-700" : "bg-sky-100 text-sky-700"}`}>
                  {winner ? "Finished" : isDraw ? "Draw" : "Playing"}
                </div>
                <div className="text-sm text-neutral-600">{status}</div>
              </div>
              <Board
                size={size}
                cells={cells}
                lastIndex={lastIdx}
                disabled={busy || !!winner}
                onCellClick={handleClick}
              />
            </div>

            <div className="rounded-lg border border-neutral-200 p-4 bg-white flex flex-wrap items-center gap-3">
              <label className="text-sm flex items-center gap-2">
                ขนาดกระดาน
                <input
                  type="number"
                  min={3}
                  max={10}
                  step={1}
                  value={size}
                  onChange={(e) => {
                    const n = Math.max(3, Math.min(10, parseInt(e.target.value || "3", 10)));
                    startNewGame(n, "X");
                  }}
                  className=" w-20 rounded border border-neutral-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  style={{ width: `${Math.max(6, String(size).length + 2)}ch` }}
                />
              </label>

              <label className="text-sm inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={botEnabled}
                  onChange={(e) => setBotEnabled(e.target.checked)}
                  className="accent-sky-600"
                />
                เล่นกับบอท (O)
              </label>

              <button
                onClick={() => startNewGame(size, "X")}
                disabled={busy}
                className="ml-auto inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                เริ่มใหม่
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 bg-white">
              <GameList />
            </div>
          </aside>
        </section>
        <footer className="pt-2 text-center text-xs text-neutral-400">Next.js • TypeScript • Tailwind • MongoDB</footer>
      </div>
    </main>
  );
}
