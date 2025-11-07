"use client";
import type { Cell } from "@/lib/logic";
import { buildRows } from "@/lib/logic";

interface BoardProps {
  size: number;
  cells: Cell[];
  lastIndex?: number | null;
  disabled?: boolean;
  onCellClick?: (index: number) => void;
  className?: string;
}

export default function Board({
  size,
  cells,
  lastIndex = null,
  disabled,
  onCellClick,
  className,
}: BoardProps) {
  const base = "grid gap-1.5 sm:gap-2 w-full select-none";

  return (
    <div
      className={[base, className].filter(Boolean).join(" ")}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {buildRows(size)
        .flat()
        .map((idx) => {
          const value = cells[idx];
          const isLast = lastIndex === idx;
          const color =
            value === "X"
              ? "text-sky-600"
              : value === "O"
              ? "text-rose-500"
              : "text-neutral-800";
          return (
            <button
              key={idx}
              type="button"
              aria-label={`cell-${idx}`}
              disabled={disabled || value !== null}
              onClick={() => onCellClick?.(idx)}
              className={[
                "w-full aspect-square grid place-items-center rounded-lg border border-neutral-200 bg-white font-semibold text-xl sm:text-2xl transition-colors",
                color,
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-neutral-50",
                isLast
                  ? "ring-1 ring-sky-400"
                  : "focus:outline-none focus:ring-2 focus:ring-sky-400",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {value ?? ""}
            </button>
          );
        })}
    </div>
  );
}
