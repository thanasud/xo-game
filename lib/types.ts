import type { ObjectId } from "mongodb";

export type Player = "X" | "O";
export type Result = Player | "draw";

export interface Move {
  turn: number; // 1-based turn number
  player: Player;
  index: number; // 0..(size*size - 1)
  createdAt: Date;
}

export interface Game {
  _id?: ObjectId;
  size: number;
  firstPlayer: Player;
  createdAt: Date;
  finishedAt?: Date;
  result?: Result;
  winner?: Player;
  moves: Move[];
}

