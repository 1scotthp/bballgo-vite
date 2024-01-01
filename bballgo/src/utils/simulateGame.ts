
import {
  PlayerRatings,
  ScoreBoard,
  PossessionOutcome,
  Player,
  Weights,
  PlayerBoxScore,
} from "../types/types";

function distributeGameMinutes(
    players: PlayerRatings[]
  ): Map<string, number> {
    let playerMinutes = new Map<string, number>();
  
    // Ignore players with NaN usageRate
    const validPlayers = players.filter((player) => !isNaN(player.usageRate));
  
    // Calculate total usageRate
    const totalUsageRate = validPlayers.reduce(
      (total, player) =>
        total + Math.pow(100 * player.usageRate, 4) + player.offensiveReboundRate,
      0
    );
  
  
    let totalAssignedMinutes = 0;
  
    validPlayers.forEach((player: PlayerRatings) => {
      let playerMinutesProportional =
        ((Math.pow(100 * player.usageRate, 4) + player.offensiveReboundRate) /
          totalUsageRate) *
        240;
      if (playerMinutesProportional > 4) {
        playerMinutesProportional += 10;
      }
      playerMinutes.set(player.name, playerMinutesProportional);
      totalAssignedMinutes += playerMinutesProportional;
    });
  
    let extraMinutes = 240 - totalAssignedMinutes;
  
    // Sort the players based on assigned minutes in descending order
    const sortedPlayers = Array.from(playerMinutes)
      .sort((a, b) => b[1] - a[1])
      .map((pair) => pair[0]);
  
    // Distribute extra minutes
    let i = 0;
    while (extraMinutes > 0) {
      const player = sortedPlayers[i];
      const currentMinutes = playerMinutes.get(player) as number;
      const additionalMinutes = Math.min(10, extraMinutes);
      playerMinutes.set(player, currentMinutes + additionalMinutes);
      extraMinutes -= additionalMinutes;
      i = (i + 1) % sortedPlayers.length; // loop back to the start of the array if we reach the end
    }
  
    return playerMinutes;
  }



function makeSubstitutions(
    onCourt: PlayerRatings[],
    onBench: PlayerRatings[],
    playerMinutes: Map<string, number>,
    scoreBoard: ScoreBoard
  ) {
    let subOutPlayerIndex = -1;
    let subInPlayerIndex = -1;
  
    // Find player to sub out
    for (let i = 0; i < onCourt.length; i++) {
      const playerName = onCourt[i].name;
      const minsPlayed = scoreBoard.boxScore[playerName].mins;
      const expMins = playerMinutes.get(playerName) ?? 0;
  
      if (minsPlayed >= expMins * 0.8) {
        subOutPlayerIndex = i;
        break;
      }
    }
  
    // Find player to sub in
    for (let j = 0; j < onBench.length; j++) {
      const playerName = onBench[j].name;
      const minsPlayed = scoreBoard.boxScore[playerName].mins;
      const expMins = playerMinutes.get(playerName) ?? 0;
  
      if (minsPlayed < expMins * 0.9) {
        subInPlayerIndex = j;
        break;
      }
    }
  
    // Perform the substitution
    if (subOutPlayerIndex !== -1 && subInPlayerIndex !== -1) {
      const temp = onCourt[subOutPlayerIndex];
      onCourt[subOutPlayerIndex] = onBench[subInPlayerIndex];
      onBench[subInPlayerIndex] = temp;
    }
  }
  
  
const defaultWeights: Weights = {
    TO: 0.5,
    OFF_FOUL: 0.3,
    DEF_FOUL_FLOOR: 0.5,
    ASSIST: 0.5,
    POSS_LENGTH: 0.85,
    USAGE_MULT: 0,
    FREE_THROW: 0.7,
    STL: 0.7,
    BLK: 0.7,
  };

// MAIN FUNCTION
export function simulateGame(
  homeTeamInput: Player[] | undefined,
  awayTeamInput: Player[] | undefined,
  weights: Weights = defaultWeights,
  playerMinutes?: Map<string, number>
) {
  let home_team_has_possession = true;

  if (!homeTeamInput || !awayTeamInput) {
    console.log("WRONG");
    return;
  }

  const homeTeam = homeTeamInput.map((player) => player.ratings);
  const awayTeam = awayTeamInput.map((player) => player.ratings);
  const scoreBoard: ScoreBoard = initializeScoreBoard(homeTeam, awayTeam);
  playerMinutes = distributeGameMinutes([...homeTeam, ...awayTeam])


  const homeOnCourt: PlayerRatings[] = homeTeam.slice(0, 5);
  const homeBench: PlayerRatings[] = homeTeam.slice(5);

  const awayOnCourt: PlayerRatings[] = awayTeam.slice(0, 5);
  const awayBench: PlayerRatings[] = awayTeam.slice(5);


  let timeRemaining = 2880;

  let isOreb = false;
  let posCount = 0;
  while (timeRemaining > 0) {
    let possessionLength = 0;

    const offense = home_team_has_possession ? homeOnCourt : awayOnCourt;
    const defense = home_team_has_possession ? awayOnCourt : homeOnCourt;

    isOreb = simulatePossession(offense, defense, weights, scoreBoard);
    possessionLength +=
    simulatePossessionTime("non-transition")[1] * weights.POSS_LENGTH;
    posCount += 1;

    while (isOreb) {
    isOreb = simulatePossession(homeOnCourt, awayOnCourt, weights, scoreBoard);
    possessionLength +=
        simulatePossessionTime("offensive_rebound")[1] * weights.POSS_LENGTH;
    posCount += 1;
    }


    homeOnCourt.forEach(
      (player) => (scoreBoard.boxScore[player.name].mins += possessionLength / 60)
    );
    awayOnCourt.forEach(
      (player) => (scoreBoard.boxScore[player.name].mins += possessionLength / 60)
    );
    timeRemaining -= possessionLength;

    if (posCount % 5) {
      makeSubstitutions(homeOnCourt, homeBench, playerMinutes, scoreBoard);
      makeSubstitutions(awayOnCourt, awayBench, playerMinutes, scoreBoard);
    }

    home_team_has_possession = !home_team_has_possession;
  }


//   const players = Object.values(scoreBoard.boxScore).filter(player => player.teamAbbr === "MIL");
//   console.log(players.sort((a, b) => b.points - a.points))
//   const away =  Object.values(scoreBoard.boxScore).filter(player => player.teamAbbr !== "MIL");
//   console.log(away.sort((a, b) => b.points - a.points))


 return scoreBoard
}

// function isOffensiveRebound(
//   offensiveReboundRate: number,
//   defensiveReboundRate: number,
//   weights: Weights
// ): boolean {
//   const iso = Math.random() * 50 < offensiveReboundRate;
//   return iso;
// }

function genOffensiveRebounder(players: PlayerRatings[]): string {
  const probability = players.map(
    (player) => player.offensiveReboundRate
  );
  const rebounderIndex = getIndexFromWeights(probability);
  return players[rebounderIndex].name;
}

// function genDefensiveRebounder(players: PlayerRatings[]): string {
//   const rebounderIndex = getIndexFromWeights(
//     players.map((player) => player.defensiveReboundRate)
//   );
//   return players[rebounderIndex].name;
// }

function genAssister(players: PlayerRatings[]): string {
  const assisterIndex = getIndexFromWeights(
    players.map((player) => player.assistRate)
  );
  return players[assisterIndex].name;
}

function genIsAssist(weights: Weights): boolean {
  return Math.random() < weights.ASSIST;
}

// function updateBoxScore(
//     scoreBoard: ScoreBoard,
//     outcome: PossessionOutcome,
//     possessionEndingPlayer: string
// ): void {
    // if (outcome === PossessionOutcome.DefensiveFoul) {
    //     const defensivePlayer =
    //       defensiveTeam[getIndexFromWeights([0.2, 0.2, 0.2, 0.2, 0.2])];
    //     defensivePlayer.stats.fouls += 1;
    //   } else if (outcome === PossessionOutcome.Turnover) {
    //     const defensivePlayer =
    //       defensiveTeam[getIndexFromWeights([0.2, 0.2, 0.2, 0.2, 0.2])];
    //     possessionEndingPlayer.stats.turnovers += 1;
    //     if (Math.random() < 0.5 * weights.STL) {
    //       defensivePlayer.stats.steals += 1;
    //     }
    //   } else if (outcome === PossessionOutcome.OffensiveFoul) {
    //     possessionEndingPlayer.stats.fouls += 1;
    //   } else {

// }

function simulatePossession(
  offensiveTeam: PlayerRatings[],
  defensiveTeam: PlayerRatings[],
  weights: Weights,
  scoreBoard: ScoreBoard
): boolean {
  let possessionEndingIndex: number = selectPossessionEndingPlayer(
    offensiveTeam,
    weights
  );
  let possessionEndingPlayer: PlayerRatings = offensiveTeam[possessionEndingIndex];

  const defensiveFoulFloorProb =
    weights.DEF_FOUL_FLOOR * genDefensiveFoulProb(defensiveTeam);

  let avgTurnoverRate =
    offensiveTeam.reduce(
      (total, player) =>
        total +
        player.turnoverRate +
        possessionEndingPlayer.turnoverRate,
      0
    ) / 2;

  const turnoverProb = weights.TO * avgTurnoverRate; // should prob be team
  const offensiveFoulProb =
    weights.OFF_FOUL * possessionEndingPlayer.foulRate;
  const shotAttemptProb =
    1 - turnoverProb - offensiveFoulProb - defensiveFoulFloorProb;


  const i = getIndexFromWeights([
    defensiveFoulFloorProb,
    turnoverProb,
    offensiveFoulProb,
    shotAttemptProb,
  ]);

  const outcome = [
    PossessionOutcome.DefensiveFoul,
    PossessionOutcome.Turnover,
    PossessionOutcome.OffensiveFoul,
    null,
  ][i];

  // if not def foul (floor), off foul (floor), or TO
  if (outcome === null){
    const defensivePlayer =
      defensiveTeam[getIndexFromWeights([0.2, 0.2, 0.2, 0.2, 0.2])].name;

    if (Math.random() < 0.03 * weights.BLK) {
      scoreBoard.boxScore[defensivePlayer].blocks += 1;
      return false;
    }
    const shotResult = simulateShot(
      offensiveTeam,
      possessionEndingIndex,
      scoreBoard
    );
    if (shotResult == "miss") {
      const oreb =
        offensiveTeam.reduce(
          (sum, player) => sum + player.offensiveReboundRate,
          0
        ) / offensiveTeam.length;

      const is_oreb = Math.random() * 50 < oreb;

      if (is_oreb) {
        scoreBoard.boxScore[genOffensiveRebounder(offensiveTeam)].offReb += 1;
        return true;
      } else {
        scoreBoard.boxScore[genOffensiveRebounder(defensiveTeam)].defReb += 1;
        return false;
      }
    } else {
      const isAssist = genIsAssist(weights);
      if (isAssist) {
        const assister = genAssister(offensiveTeam);
        scoreBoard.boxScore[assister].assists += 1;
      }
    }
  }
  return false;
}

function genShotType(player: PlayerRatings): "two" | "three" {
  const shotType = Math.random();
  const ratio =
    player.twoPointAttemptRate /
    (player.twoPointAttemptRate + player.threePointAttemptRate);
  if (shotType < ratio) {
    return "two";
  } else {
    return "three";
  }
}

function genIsFoul(shotType: "two" | "three", player: PlayerRatings) {
  if (shotType == "two") {
    return Math.random() < player.freeThrowRate / 1.5;
  } else {
    return Math.random() < player.freeThrowRate / 3;
  }
}

function takeFreeThrows(
  player: PlayerRatings,
  numFreeThrows: number,
  scoreBoard: ScoreBoard
): "make" | "miss" {
  let res: "make" | "miss" = "miss";
  while (numFreeThrows > 0) {
    if (Math.random() < player.freeThrowPercentage) {
      scoreBoard.boxScore[player.name].points += 1;
      scoreBoard.boxScore[player.name].freeThrowsMade += 1;
      res = "make";
    } else {
      res = "miss";
    }
    scoreBoard.boxScore[player.name].freeThrowsTaken += 1;
    numFreeThrows -= 1;
  }
  return res;
}

function takeShot(
  player: PlayerRatings,
  shotType: "two" | "three",
  isFoul: boolean,
  scoreBoard: ScoreBoard
): "make" | "miss" {
  const foulPenalty = isFoul ? 0.3 : 1;
  if (shotType === "two") {
    if (Math.random() < player.twoPointPercentage * foulPenalty) {
        scoreBoard.boxScore[player.name].twoPointShotsTaken += 1;
      scoreBoard.boxScore[player.name].twoPointShotsMade += 1;
      scoreBoard.boxScore[player.name].points += 2;
      if (isFoul) {
        return takeFreeThrows(player, 1, scoreBoard);
      }
      return "make";
    } else {
      if (isFoul) {
        return takeFreeThrows(player, 2, scoreBoard);
      } else {
        scoreBoard.boxScore[player.name].twoPointShotsTaken += 1;
      }
      return "miss";
    }
  } else {
    if (Math.random() < player.threePointPercentage * foulPenalty) {
      scoreBoard.boxScore[player.name].threePointShotsTaken += 1;
      scoreBoard.boxScore[player.name].threePointShotsMade += 1;
      scoreBoard.boxScore[player.name].points += 3;
      if (isFoul) {
        return takeFreeThrows(player, 1, scoreBoard);
      }
      return "make";
    } else {
      if (isFoul) {
        return takeFreeThrows(player, 3, scoreBoard);
      } else {
        scoreBoard.boxScore[player.name].threePointShotsTaken += 1;
      }
      return "miss";
    }
  }
}

function simulateShot(
  offensiveTeam: PlayerRatings[],
  possessionEndingIndex: number,
  scoreBoard: ScoreBoard
): "make" | "miss" {
  const player = offensiveTeam[possessionEndingIndex];
  const shotType = genShotType(player);
  const isFoul: boolean = genIsFoul(shotType, player);

  return takeShot(player, shotType, isFoul, scoreBoard);
}

function genDefensiveFoulProb(defensiveTeam: PlayerRatings[]): number {
  const defensiveFoulRate = defensiveTeam
    .map((player) => player.foulRate)
    .reduce((a, b) => a + b, 0);
  return defensiveFoulRate / 10;
}

function simulatePossessionTime(possessionType: string): [string, number] {
  const params = {
    offensive_rebound: {
      minTime: 1,
      maxTime: 14,
      avgTime: 7,
      stdDev: 2,
    },
    default: {
      minTime: 3,
      maxTime: 23,
      avgTime: 14,
      stdDev: 3,
    },
  };
  const { minTime, maxTime, avgTime, stdDev } =
    (params as any)[possessionType] || params.default;

  const possessionTime: number = Math.round(avgTime + stdDev * Math.random());
  const clampedTime: number = Math.min(
    Math.max(minTime, possessionTime),
    maxTime
  );
  const possessionMode: string =
    possessionTime <= 8 ? "transition" : "non-transition";

  return [possessionMode, clampedTime];
}

function selectPossessionEndingPlayer(
  offensiveTeam: PlayerRatings[],
  weights: Weights
): number {
  if (offensiveTeam === null) {
    console.log("Invalid team state.");
    return -1;
  }
  let usageRates = offensiveTeam.map(
    (playerData) =>
      playerData.usageRate +
      weights.USAGE_MULT * 20 * Math.pow(playerData.usageRate, 2)
  );
  let total = usageRates.reduce((a, b) => a + b, 0);
  let probabilities = usageRates.map((usageRate) => usageRate / total);

  let possessionEndingPlayer = getIndexFromWeights(probabilities);

  return possessionEndingPlayer;
}

function getIndexFromWeights(weights: number[]): number {
  let totalWeight = 0;
  let cumulativeWeight = 0;
  const randomValue = Math.random();

  for (let i = 0; i < weights.length; i++) {
    totalWeight += weights[i];
  }

  const normalizedRandomValue = randomValue * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (normalizedRandomValue <= cumulativeWeight) {
      return i;
    }
  }

  // Fallback if something goes wrong, should not be reached in normal execution
  return Math.floor(Math.random() * weights.length);
}

export const initializeScoreBoard = (
    homeTeam: PlayerRatings[],
    awayTeam: PlayerRatings[]
  ): ScoreBoard => {
    // Initialize box score for each player
    const initializePlayerBoxScore = (player: PlayerRatings): PlayerBoxScore => ({
        name: player.name,
        teamAbbr: player.team,
        points: 0,
        offReb: 0,
        defReb: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0,
        twoPointShotsTaken: 0,
        twoPointShotsMade: 0,
        threePointShotsTaken: 0,
        threePointShotsMade: 0,
        freeThrowsTaken: 0,
        freeThrowsMade: 0,
        mins: 0
      });
    

      const combinedTeams = [...homeTeam, ...awayTeam]; // Combining the two teams into a single array

      const boxScore = combinedTeams.reduce((boxScoreDict, player) => {
        boxScoreDict[player.name] = initializePlayerBoxScore(player);
        return boxScoreDict;
      }, {} as { [playerName: string]: PlayerBoxScore });
    
      return {
        timeRemaining: 48 * 60, // Adjust according to your game's duration
        boxScore: boxScore,
        playByPlay: []
      };

  };