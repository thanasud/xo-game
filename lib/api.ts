export type Player = "X" | "O";
export type Result = Player | "draw";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg += `: ${data.error}`;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function createGame(size: number, firstPlayer: Player = "X"): Promise<string> {
  const data = await request<{ id: string }>("/api/games", {
    method: "POST",
    body: JSON.stringify({ size, firstPlayer }),
  });
  return data.id;
}

export async function appendMove(gameId: string, index: number, player: Player): Promise<void> {
  await request<{ ok: boolean }>(`/api/games/${gameId}/moves`, {
    method: "POST",
    body: JSON.stringify({ index, player }),
  });
}

export async function finishGame(gameId: string, result: Result, winner?: Player): Promise<void> {
  await request<{ ok: boolean }>(`/api/games/${gameId}/finish`, {
    method: "POST",
    body: JSON.stringify({ result, winner }),
  });
}

export async function listGames() {
  return request<{ games: Array<{ id: string; size: number; firstPlayer: Player; createdAt: string; finishedAt?: string; result?: Result; winner?: Player; moveCount: number }> }>(
    "/api/games"
  );
}

export async function getGame(id: string) {
  return request<{ game: any }>(`/api/games/${id}`);
}

