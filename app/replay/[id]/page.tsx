"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getGame } from "@/lib/api";
import Board from "@/app/components/Board";
import type { Player } from "@/lib/types";
import type { Cell } from "@/lib/logic";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";

export default function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(3);
  const [moves, setMoves] = useState<Array<{ index: number; player: Player }>>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (!playing) return;
    if (step >= moves.length) {
      setPlaying(false);
      return;
    }
    const t = window.setInterval(() => {
      setStep((s) => (s < moves.length ? s + 1 : s));
    }, speed);
    timerRef.current = t as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [playing, speed, moves.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
      else if (e.key === "ArrowRight") setStep((s) => Math.min(moves.length, s + 1));
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moves.length]);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Replay</h1>
        {loading && <div className="text-base text-neutral-500">Loading...</div>}
        {error && <div className="text-base text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="rounded-lg border border-neutral-200 p-4 bg-white">
              <Board size={size} cells={cells} lastIndex={lastIndex} disabled className="justify-items-center" />
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 bg-white space-y-3">
              <input
                type="range"
                min={0}
                max={moves.length}
                step={1}
                value={step}
                onChange={(e) => setStep(parseInt(e.target.value, 10))}
                className="w-full accent-sky-600"
              />
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center divide-x rounded-md border border-neutral-200 overflow-hidden">
                  <button
                    className="px-2 py-1 text-base hover:bg-neutral-50 disabled:opacity-60"
                    onClick={() => setStep(0)}
                    disabled={step === 0}
                    title="First"
                  >
                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="px-2 py-1 text-base hover:bg-neutral-50 disabled:opacity-60"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    title="Prev"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="px-2 py-1 text-base hover:bg-neutral-50 disabled:opacity-60"
                    onClick={() => setPlaying((p) => !p)}
                    title={playing ? "Pause" : "Play"}
                  >
                    {playing ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </button>
                  <button
                    className="px-2 py-1 text-base hover:bg-neutral-50 disabled:opacity-60"
                    onClick={() => setStep((s) => Math.min(moves.length, s + 1))}
                    disabled={step === moves.length}
                    title="Next"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="px-2 py-1 text-base hover:bg-neutral-50 disabled:opacity-60"
                    onClick={() => setStep(moves.length)}
                    disabled={step === moves.length}
                    title="Last"
                  >
                    <ChevronDoubleRightIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-base text-neutral-700 ml-2">Step {step} / {moves.length}</div>
                <div className="ml-auto inline-flex items-center gap-2 text-base">
                  <span className="text-neutral-600">Speed</span>
                  <select
                    className="rounded border border-neutral-200 px-2 py-1 text-base"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
                  >
                    <option value={1000}>1x</option>
                    <option value={700}>1.5x</option>
                    <option value={400}>2x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
