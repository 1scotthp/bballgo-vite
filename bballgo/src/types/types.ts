import { Contract } from "../utils/loadData";

// COMMON
export interface HeadCell<T> {
  disablePadding: boolean;
  id: keyof T;
  label: string;
  numeric: boolean;
}

export interface Data {
  calories: number;
  carbs: number;
  fat: number;
  name: string;
  protein: number;
}

export type PlayerStats = {
  name: string;
  points: number;
  offReb: number;
  defReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  twoPointShotsTaken: number;
  twoPointShotsMade: number;
  threePointShotsTaken: number;
  threePointShotsMade: number;
  freeThrowsTaken: number;
  freeThrowsMade: number;
  mins: number;
  home: string;
  away: string;
  expMins: number;
  gameId?: number;
};

// PLAYER
export type PlayerRatings = {
  name: string;
  id: number;
  usageRate: number;
  stealRate: number;
  blockRate: number;
  threePointAttemptRate: number;
  twoPointAttemptRate: number;
  freeThrowRate: number;
  twoPointPercentage: number;
  freeThrowPercentage: number;
  threePointPercentage: number;
  turnoverRate: number;
  foulRate: number;
  playerHeight: number;
  offensiveReboundRate: number;
  defensiveReboundRate: number;
  assistRate: number;
  age: number;
  ODPM: number;
  DDPM: number;
  nonBoxODPM: number;
  nonBoxDDPM: number;
  fatigue: number;
  rID: number;
};

export type PlayerRosterView = {
  name: string;
  id: number;
  salary: number;
  exp: number;
  age: number;
  position: string;
  height: number;
};

// TEAM
export type TeamStats = {};

export type TeamsStandingStats = {
  totalPoints: number;
  totalOppPoints: number;
  wins: number;
  losses: number;
  margin: number;
  poss: number;
};

export type TeamInfo = {
  salary: number;
  mle: boolean;
  bae: number;
};

export type Team = {
  roster: Player[];
  stats: TeamsStandingStats;
  rosterInfo: TeamInfo;
  teamName?: string;
  teamId?: number;
  teamAbbreviation: string;
  teamCity?: string;
  teamConference?: string;
};

// ADD WEIGHTS HERE #1
export type Weights = {
  TO: number;
  OFF_FOUL: number;
  DEF_FOUL_FLOOR: number;
  ASSIST: number;
  POSS_LENGTH: number;
  USAGE_MULT: number;
  FREE_THROW: number;
  STL: number;
  BLK: number;
};

export enum PossessionStart {
  Miss,
  Make,
  DeadBall,
  Steal,
  MissFT,
  MakeFT,
  Timeout,
  Oreb,
  DefFoulFloor,
}

export type Player = {
  id: number;
  name: string;
  ratings: PlayerRatings;
  teamAbbr: string;
  contract?: Contract;
  stats: PlayerBoxScore;
  gameByGameStats: PlayerStats[];
  realGames: PlayerStats[];
  age?: number;
  position?: string;
  contractYears?: { [key: string]: number };
  guaranteedAmount?: number;
  transactions?: Transaction[];
};
export type Transaction = {
  date: Date;
  transactionDetail: string;
};

export type Play = {
  timeRemaining: number;
  outcome: Possession;
  player: Player;
};

export type PlayByPlayPoss = {
  timeRemaining: number;
  play: string;
  quarter: number;
};

export type ScoreBoard = {
  timeRemaining: number;
  boxScore: { [playerName: string]: PlayerBoxScore };
  playByPlay: PlayByPlayPoss[];
  rapmInput: number[][];
  quarter: number;
};

export type PlayerBoxScore = {
  name: string;
  points: number;
  offReb: number;
  defReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  twoPointShotsTaken: number;
  twoPointShotsMade: number;
  threePointShotsTaken: number;
  threePointShotsMade: number;
  freeThrowsTaken: number;
  freeThrowsMade: number;
  mins: number;
  teamAbbr: string;
  poss: number;
  teamPointsScored: number;
  teamPointsAgainst: number;
};

//   export type TeamScoreBoard = {
//     points: number;
//     timeoutsRemaining: number;
//     fouls: number;
//     players: PlayerScoreBoard[];
//   };

export type TeamTotalStats = {
  totalPoints: number;
  totalOffReb: number;
  totalDefReb: number;
  totalAssists: number;
  totalSteals: number;
  totalBlocks: number;
  totalTurnovers: number;
  totalFouls: number;
  totalTwoPointShotsTaken: number;
  totalTwoPointShotsMade: number;
  totalThreePointShotsTaken: number;
  totalThreePointShotsMade: number;
  totalFreeThrowsTaken: number;
  totalFreeThrowsMade: number;
};
export type TeamTotalStatsStrings = {
  totalPoints: string;
  totalOffReb: string;
  totalDefReb: string;
  totalAssists: string;
  totalSteals: string;
  totalBlocks: string;
  totalTurnovers: string;
  totalFouls: string;
  totalTwoPointShotsTaken: string;
  totalTwoPointShotsMade: string;
  totalThreePointShotsTaken: string;
  totalThreePointShotsMade: string;
  totalFreeThrowsTaken: string;
  totalFreeThrowsMade: string;
};

export type ScoreBoardStrings = {
  timeRemaining: string;
  homeTeam: TeamScoreBoardStrings;
  awayTeam: TeamScoreBoardStrings;
  homeTeamTotal?: TeamTotalStatsStrings;
  awayTeamTotal?: TeamTotalStatsStrings;
  playByPlay: Play[];
};

export type TeamScoreBoardStrings = {
  points: string;
  timeoutsRemaining: string;
  fouls: string;
  players: Record<number, PlayerScoreBoardStrings>;
};

export type PlayerScoreBoardStrings = {
  name: string;
  points: string;
  offReb: string;
  defReb: string;
  assists: string;
  steals: string;
  blocks: string;
  turnovers: string;
  fouls: string;
  twoPointShotsTaken: string;
  twoPointShotsMade: string;
  threePointShotsTaken: string;
  threePointShotsMade: string;
  freeThrowsTaken: string;
  freeThrowsMade: string;
  mins: string;
};

// export type TeamRatingInGame = {
//   threePointAttemptRate: number;
//   twoPointAttemptRate: number;
//   freeThrowRate: number;
//   twoPointPercentage: number;
//   freeThrowPercentage: number;
//   threePointPercentage: number;
//   turnoverRate: number;
//   foulRate: number;
//   playerHeight: number;
//   offensiveReboundRate: number;
//   defensiveReboundRate: number;
// };

export type ShotAttempt = {
  success: boolean;
  type: "two" | "three" | "free";
  blocked: boolean;
};

export enum PossessionOutcome {
  Turnover = "Turnover",
  Steal = "Steal",
  MadeTwoPointShot = "MadeTwoPointShot",
  MadeThreePointShot = "MadeThreePointShot",
  MadeFreeThrow = "MadeFreeThrow",
  MissedTwoPointShot = "MissedTwoPointShot",
  MissedThreePointShot = "MissedThreePointShot",
  MissedFreeThrow = "MissedFreeThrow",
  OffensiveRebound = "OffensiveRebound",
  DefensiveRebound = "DefensiveRebound",
  DefensiveFoulGround = "DefensiveFoulGround",
  OffensiveFoul = "OffensiveFoul",
  DefensiveFoul = "DefensiveFoul",
  EndOfQuarter = "EndOfQuarter",
  JumpBall = "JumpBall",
}

export type Possession = {
  outcome: PossessionOutcome;
  offensivePlayer: Player;
  defensivePlayer?: Player;
  rebounder?: Player;
  isOffensiveRebound?: boolean;
};

// Possessions Matched to Outcomes
export function getNextPossession(outcome: PossessionOutcome): string {
  switch (outcome) {
    case PossessionOutcome.Turnover:
      return "Switch";
    case PossessionOutcome.MadeTwoPointShot:
    case PossessionOutcome.MadeThreePointShot:
    case PossessionOutcome.MadeFreeThrow:
      return "Switch No Def Foul";
    case PossessionOutcome.MissedTwoPointShot:
    case PossessionOutcome.MissedThreePointShot:
    case PossessionOutcome.MissedFreeThrow:
      return "Rebound";
    case PossessionOutcome.OffensiveRebound:
      return "Same";
    case PossessionOutcome.DefensiveRebound:
      return "Switch";
    case PossessionOutcome.DefensiveFoulGround:
      return "Same";
    case PossessionOutcome.OffensiveFoul:
      return "Switch";
    case PossessionOutcome.EndOfQuarter:
      return "Switch, Start New Quarter";
    case PossessionOutcome.JumpBall:
      return "Jump Ball";
    default:
      return "Unknown Outcome";
  }
}

// New type for box score entries
export type BoxScoreEntry = {
  playerId: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
};

// Small, focused types remain the same
export type ShootingRatings = {
  usageRate: number;
  threePointAttemptRate: number;
  twoPointAttemptRate: number;
  freeThrowRate: number;
  twoPointPercentage: number;
  freeThrowPercentage: number;
  threePointPercentage: number;
};

export type ReboundingRatings = {
  offensiveReboundRate: number;
  defensiveReboundRate: number;
};
