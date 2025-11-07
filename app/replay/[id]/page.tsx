"use client";
import { useEffect, useMemo, useState } from "react";
import { getGame } from "@/lib/api";
import Board from "@/app/components/Board";
import type { Player } from "@/lib/types";
import type { Cell } from "@/lib/logic";

export default function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(3);
  const [moves, setMoves] = useState<Array<{ index: number; player: Player }>>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getGame(id)
      .then((d) => {
        const g = d.game;
        setSize(g.size);
        setMoves((g.moves || []).map((m: any) => ({ index: m.index, player: m.player })));
        setStep((g.moves || []).length);
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  }, [id]);

  const cells: Cell[] = useMemo(() => {
    const total = size * size;
    const arr: Cell[] = Array(total).fill(null);
    for (let i = 0; i < step && i < moves.length; i++) {
      const m = moves[i];
      arr[m.index] = m.player;
    }
    return arr;
  }, [size, moves, step]);

  const lastIndex = step > 0 && step <= moves.length ? moves[step - 1].index : null;

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-3xl space-y-4">
        <h1 className="text-xl font-bold text-neutral-900">Replay</h1>
        {loading && <div className="text-sm text-neutral-500">Loading...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 bg-white">
              <Board size={size} cells={cells} lastIndex={lastIndex} disabled className="justify-items-center" />
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 bg-white flex items-center gap-3">
              <button
                className="rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setStep(0)}
                disabled={step === 0}
              >
                ⏮️ First
              </button>
              <button
                className="rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                ◀️ Prev
              </button>
              <div className="text-sm text-neutral-700">Step {step} / {moves.length}</div>
              <button
                className="rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setStep((s) => Math.min(moves.length, s + 1))}
                disabled={step === moves.length}
              >
                Next ▶️
              </button>
              <button
                className="rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setStep(moves.length)}
                disabled={step === moves.length}
              >
                Last ⏭️
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
