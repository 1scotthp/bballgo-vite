// db.ts
import Dexie, { Table } from "dexie";
import { Player, Team } from "./types/types";
import { Contract } from "./utils/loadData";

export interface Friend {
  id?: number;
  name: string;
  age: number;
}

export class MySubClassedDexie extends Dexie {
  // friends!: Table<Friend>;
  players!: Table<Player>;

  // Add the games table
  // games!: Table<{
  //   id: number;
  //   teamData: { team: string; players: PlayerStats[]; points: number }[];
  // }>;
  contracts!: Table<Contract>;
  teams: Table<Team>;

  constructor() {
    super("myDatabase");
    this.version(10).stores({
      teams: "teamAbbreviation",
      players: "name",
      // Add the games table to the store with 'id' as primary key
      // games: "id",
      contracts: "name",
    });
    this.teams = this.table("teams");
    this.players = this.table("players");
    // this.games = this.table("games");
    this.contracts = this.table("contracts");
  }
}

export const db = new MySubClassedDexie();
