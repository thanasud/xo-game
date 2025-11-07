import type { Player } from "./types";

export type Cell = Player | null;

export function buildRows(size: number): number[][] {
  const rows: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) row.push(r * size + c);
    rows.push(row);
  }
  return rows;
}

export function calculateWinner(cells: Cell[], size: number): Player | null {
  for (let r = 0; r < size; r++) {
    const start = r * size;
    const v = cells[start];
    if (v === null) continue;
    let ok = true;
    for (let c = 1; c < size; c++) if (cells[start + c] !== v) { ok = false; break; }
    if (ok) return v;
  }
  for (let c = 0; c < size; c++) {
    const v = cells[c];
    if (v === null) continue;
    let ok = true;
    for (let r = 1; r < size; r++) if (cells[r * size + c] !== v) { ok = false; break; }
    if (ok) return v;
  }
  {
    const v = cells[0];
    if (v !== null) {
      let ok = true;
      for (let i = 1; i < size; i++) if (cells[i * size + i] !== v) { ok = false; break; }
      if (ok) return v;
    }
  }
  {
    const v = cells[size - 1];
    if (v !== null) {
      let ok = true;
      for (let i = 1; i < size; i++) if (cells[i * size + (size - 1 - i)] !== v) { ok = false; break; }
      if (ok) return v;
    }
  }
  return null;
}

export function findBotMove(cells: Cell[], size: number, bot: Player, human: Player): number | null {
  const total = size * size;
  const empties: number[] = [];
  for (let i = 0; i < total; i++) if (cells[i] === null) empties.push(i);
  if (empties.length === 0) return null;

  // helper to test a move
  const tryMove = (i: number, p: Player) => {
    const next = cells.slice();
    next[i] = p;
    return calculateWinner(next, size) === p;
  };

  // 1) win
  for (const i of empties) if (tryMove(i, bot)) return i;
  // 2) block
  for (const i of empties) if (tryMove(i, human)) return i;
  // 3) center
  const center = Math.floor(total / 2);
  if (cells[center] === null) return center;
  // 4) random
  return empties[Math.floor(Math.random() * empties.length)];
}
