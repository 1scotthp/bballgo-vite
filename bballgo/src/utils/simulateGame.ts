import {
  PlayerRatings,
  ScoreBoard,
  PossessionOutcome,
  Player,
  Weights,
  PlayerBoxScore,
  PossessionStart,
} from "../types/types";

// const: -15.5213 + fga_per_100_poss: 2.6721 + x3pa_per_100_poss: 0.1710 + fg_percent: 38.4119 + fta_per_100_poss: 1.6870 + ft_percent: 8.8982 + usg_percent: -2.3688 + ast_per_100_poss: 0.9554 + stl_per_100_poss: 0.4940 + Non Box O-DPM: 0.8181 + Non Box D-DPM: 1.7782

const FGA_PER_100_POSS = 2.6721;
const THREES_PER_100_POSS = 0.171;
const FG_PERCENT = 38.4119;
const FTA_PER_100_POSS = 1.687;
const FT_PERCENT = 8.8982;
const USG_PERCENT = -2.3688;
const AST_PER_100_POSS = 0.9554;
const STL_PER_100_POSS = 0.494;
const NON_BOX_O_DPM = 0.8181;
const NON_BOX_D_DPM = 1.7782;

function distributeGameMinutes(players: PlayerRatings[]): Map<string, number> {
  let playerMinutes = new Map<string, number>();

  // Ignore players with NaN usageRate
  const validPlayers = players.filter((player) => !isNaN(player.usageRate));

  const playerMinutesArray = validPlayers.map((player) => {
    const playerMins =
      -16 +
      USG_PERCENT * player.usageRate * 100 +
      FGA_PER_100_POSS *
        100 *
        (player.twoPointAttemptRate + player.threePointAttemptRate) +
      THREES_PER_100_POSS * player.threePointAttemptRate * 100 +
      FG_PERCENT * player.twoPointPercentage +
      FT_PERCENT * player.freeThrowPercentage +
      player.assistRate * 100 * AST_PER_100_POSS +
      FTA_PER_100_POSS * 100 * player.freeThrowRate +
      STL_PER_100_POSS * 100 * player.stealRate +
      NON_BOX_D_DPM * player.nonBoxDDPM +
      NON_BOX_O_DPM * player.nonBoxODPM;

    return { name: player.name, mins: playerMins };
  });

  // Sort by minutes in descending order
  playerMinutesArray.sort((a, b) => b.mins - a.mins);

  // Keep top 12 minutes as is, set the rest to 0
  playerMinutesArray.forEach((player, index) => {
    const minutes = index < 12 ? player.mins : 0;
    playerMinutes.set(player.name, Math.pow(minutes, 1.15) + Math.random() * 4);
  });

  const sortedPlayerMinutes = Array.from(playerMinutes).sort(
    (a, b) => b[1] - a[1]
  );

  // Sum of minutes for the top 12 players
  const totalAssignedMinutes = sortedPlayerMinutes
    .slice(0, 12)
    .reduce((sum, [, mins]) => sum + mins, 0);

  // Calculate minsOver
  const minsOver = (totalAssignedMinutes - 5 * 48) / 12;

  // Subtract minsOver from each player's minutes in the playerMinutes map
  playerMinutes.forEach((minutes, playerName) => {
    const adjustedMinutes = Math.max(minutes - minsOver, 0); // Ensuring minutes don't go below 0
    playerMinutes.set(playerName, Math.min(adjustedMinutes, 40));
  });

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

  // high nums near beginning. high fatigue and low exp mins gets you booted
  onCourt.sort(
    (a, b) =>
      b.fatigue -
      (playerMinutes.get(b.name) ?? 0) -
      (a.fatigue - (playerMinutes.get(a.name) ?? 0))
  );

  // high nums near beginning high mins low fatigue gets you in
  onBench.sort(
    (a, b) =>
      (playerMinutes.get(b.name) ?? 0 - b.fatigue) -
      (playerMinutes.get(a.name) ?? 0 - a.fatigue)
  );

  // Find player to sub out
  for (let i = 0; i < onCourt.length; i++) {
    const playerName = onCourt[i].name;
    const minsPlayed = scoreBoard.boxScore[playerName].mins;
    const expMins = playerMinutes.get(playerName) ?? 0;

    if (
      onCourt[i].fatigue > 40 ||
      minsPlayed >= expMins * 0.8 ||
      Math.random() < 0.08
    ) {
      subOutPlayerIndex = i;
      break;
    }
  }

  // Find player to sub in
  for (let j = 0; j < onBench.length; j++) {
    const playerName = onBench[j].name;
    const minsPlayed = scoreBoard.boxScore[playerName].mins;
    const expMins = playerMinutes.get(playerName) ?? 0;

    if (minsPlayed < expMins * 1.2 && expMins > 1 && onBench[j].fatigue < 10) {
      subInPlayerIndex = j;
      break;
    }
  }

  // Perform the substitution
  if (subOutPlayerIndex !== -1 && subInPlayerIndex !== -1) {
    let subInPlayer = onBench[subInPlayerIndex];
    const subOutPlayer = onCourt[subOutPlayerIndex];
    onCourt[subOutPlayerIndex] = subInPlayer;
    onBench[subInPlayerIndex] = subOutPlayer;
  }
}

const defaultWeights: Weights = {
  TO: 1,
  OFF_FOUL: 0.2,
  DEF_FOUL_FLOOR: 0.7,
  ASSIST: 0.65,
  POSS_LENGTH: 1,
  USAGE_MULT: 0.2,
  FREE_THROW: 0.7,
  STL: 0.7,
  BLK: 1,
};

// MAIN FUNCTION
export function simulateGame(
  homeTeamInput: Player[] | undefined,
  awayTeamInput: Player[] | undefined,
  weights: Weights = defaultWeights
  //   playerMinutes?: Map<string, number>
) {
  let home_team_has_possession = true;

  if (!homeTeamInput || !awayTeamInput) {
    console.log("WRONG");
    return;
  }
  const scoreBoard: ScoreBoard = initializeScoreBoard(
    homeTeamInput,
    awayTeamInput
  );

  const homeTeam = homeTeamInput.map((player) => player.ratings);
  const awayTeam = awayTeamInput.map((player) => player.ratings);
  const playerMinutesHome = distributeGameMinutes(homeTeam);
  const playerMinutesAway = distributeGameMinutes(awayTeam);
  const playerMinutes = new Map([...playerMinutesHome, ...playerMinutesAway]);

  const homeOnCourt: PlayerRatings[] = homeTeam.slice(0, 5);
  const homeBench: PlayerRatings[] = homeTeam.slice(5);

  const awayOnCourt: PlayerRatings[] = awayTeam.slice(0, 5);
  const awayBench: PlayerRatings[] = awayTeam.slice(5);

  let posCount = 0;
  let prevPossessionEnd = PossessionStart.Timeout;
  let points = 0;
  let points2 = 0;

  scoreBoard.quarter = 1;
  while (scoreBoard.quarter <= 4) {
    scoreBoard.timeRemaining = 720;
    while (scoreBoard.timeRemaining > 0) {
      let possessionLength = 0;

      const offense = home_team_has_possession ? homeOnCourt : awayOnCourt;
      const defense = home_team_has_possession ? awayOnCourt : homeOnCourt;

      possessionLength +=
        simulatePossessionTime(prevPossessionEnd) * weights.POSS_LENGTH;
      [prevPossessionEnd, points] = simulatePossession(
        offense,
        defense,
        weights,
        scoreBoard,
        prevPossessionEnd
      );
      posCount += 1;

      points2 = 0;
      while (
        prevPossessionEnd === PossessionStart.Oreb ||
        prevPossessionEnd === PossessionStart.DefFoulFloor
      ) {
        [prevPossessionEnd, points2] = simulatePossession(
          homeOnCourt,
          awayOnCourt,
          weights,
          scoreBoard,
          prevPossessionEnd
        );
        possessionLength +=
          simulatePossessionTime(prevPossessionEnd) * weights.POSS_LENGTH;
      }
      points += points2;

      offense.forEach((player) => {
        scoreBoard.boxScore[player.name].teamPointsScored += points;
      });

      defense.forEach((player) => {
        scoreBoard.boxScore[player.name].teamPointsAgainst += points;
      });

      // Assuming offense and defense arrays have 5 elements each
      // scoreBoard.rapmInput.push([
      //     points,
      //     offense[0].rID, offense[1].rID, offense[2].rID, offense[3].rID, offense[4].rID,
      //     defense[0].rID, defense[1].rID, defense[2].rID, defense[3].rID, defense[4].rID
      // ]);
      // scoreBoard.playByPlay.push({
      //   timeRemaining: scoreBoard.timeRemaining,
      //   play: "Not sure",
      //   quarter: scoreBoard.quarter,
      // });

      homeOnCourt.forEach((player) => {
        scoreBoard.boxScore[player.name].mins += possessionLength / 60;
        scoreBoard.boxScore[player.name].poss += 1;
        player.fatigue += 1;
      });
      awayOnCourt.forEach((player) => {
        scoreBoard.boxScore[player.name].mins += possessionLength / 60;
        scoreBoard.boxScore[player.name].poss += 1;
        player.fatigue += 1;
      });
      homeBench.forEach((player) => {
        player.fatigue = Math.max(player.fatigue - 3, 0);
      });
      awayBench.forEach((player) => {
        player.fatigue = Math.max(player.fatigue - 3, 0);
      });
      scoreBoard.timeRemaining -= possessionLength;

      if (posCount % 4) {
        makeSubstitutions(homeOnCourt, homeBench, playerMinutes, scoreBoard);
        makeSubstitutions(awayOnCourt, awayBench, playerMinutes, scoreBoard);
      }

      home_team_has_possession = !home_team_has_possession;
    }
    scoreBoard.quarter += 1;
  }

  return scoreBoard;
}

// function isOffensiveRebound(
//   offensiveReboundRate: number,
//   defensiveReboundRate: number,
//   weights: Weightsdefe
// ): boolean {
//   const iso = Math.random() * 50 < offensiveReboundRate;
//   return iso;
// }

function genOffensiveRebounder(players: PlayerRatings[]): string {
  const probability = players.map((player) => player.offensiveReboundRate);
  const rebounderIndex = getIndexFromWeights(probability);
  return players[rebounderIndex].name;
}

function genDefensiveRebounder(players: PlayerRatings[]): string {
  const rebounderIndex = getIndexFromWeights(
    players.map((player) => player.defensiveReboundRate)
  );
  return players[rebounderIndex].name;
}

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
const STL_PER_POSS = 0.075;
const REBOUNDING_MULTIPLIER = 1;
const STL_PER_TO = 0.5;
const OFF_REB_CHANCE = 0.2;
function genTurnoverProb(
  // defensiveTeam: PlayerRatings[],
  possessionEndingPlayer: PlayerRatings,
  ODPM: number,
  DDPM: number,
  defStealRate: number
): [number, number] {
  const playerTurnoverProb =
    possessionEndingPlayer.turnoverRate / possessionEndingPlayer.usageRate;

  const stlsAboveAveragePerPoss = defStealRate - STL_PER_POSS;
  const turnoverProb =
    playerTurnoverProb + stlsAboveAveragePerPoss / 2 + (DDPM - ODPM) / 50; // should prob be team

  const stealProb = defStealRate * STL_PER_TO;

  return [turnoverProb - stealProb, stealProb];
}

// fix offensive rebounds off of FTs
function simulatePossession(
  offensiveTeam: PlayerRatings[],
  defensiveTeam: PlayerRatings[],
  weights: Weights,
  scoreBoard: ScoreBoard,
  prevPossessionEnd: PossessionStart
): [PossessionStart, number] {
  let possessionEndingIndex: number = selectPossessionEndingPlayer(
    offensiveTeam,
    weights
  );

  let possessionEndingPlayer: PlayerRatings =
    offensiveTeam[possessionEndingIndex];

  const ODPM =
    offensiveTeam
      .map((player) => player.nonBoxODPM)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) / 5;
  const DDPM =
    defensiveTeam
      .map((player) => player.nonBoxDDPM)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) / 5;

  const defStealRate = defensiveTeam.reduce(
    (total, player) => total + player.stealRate,
    0
  );

  const defensiveFoulFloorProb =
    weights.DEF_FOUL_FLOOR * genDefensiveFoulProb(defensiveTeam);

  const [turnoverProb, stealProb] = genTurnoverProb(
    // defensiveTeam,
    possessionEndingPlayer,
    ODPM,
    DDPM,
    defStealRate
  );

  const offensiveFoulProb = weights.OFF_FOUL * possessionEndingPlayer.foulRate;
  const shotAttemptProb =
    1 - turnoverProb - offensiveFoulProb - defensiveFoulFloorProb;

  const i = getIndexFromWeights([
    defensiveFoulFloorProb,
    turnoverProb,
    stealProb,
    offensiveFoulProb,
    shotAttemptProb,
  ]);

  const outcome = [
    PossessionOutcome.DefensiveFoul,
    PossessionOutcome.Turnover,
    PossessionOutcome.Steal,
    PossessionOutcome.OffensiveFoul,
    null,
  ][i];

  if (outcome === PossessionOutcome.DefensiveFoul) {
    const defensivePlayer =
      defensiveTeam[
        getIndexFromWeights(defensiveTeam.flatMap((player) => player.foulRate))
      ].name;
    scoreBoard.boxScore[defensivePlayer].fouls += 1;
    scoreBoard.playByPlay.push({
      quarter: scoreBoard.quarter,
      play:
        defensivePlayer +
        " fouled " +
        possessionEndingPlayer.name +
        " on the floor",
      timeRemaining: scoreBoard.timeRemaining,
    });
    return [PossessionStart.DefFoulFloor, 0];
  } else if (outcome === PossessionOutcome.Turnover) {
    scoreBoard.boxScore[possessionEndingPlayer.name].turnovers += 1;
    scoreBoard.playByPlay.push({
      quarter: scoreBoard.quarter,
      play: "Turnover by  " + possessionEndingPlayer.name,
      timeRemaining: scoreBoard.timeRemaining,
    });
    return [PossessionStart.DeadBall, 0];
  } else if (outcome === PossessionOutcome.Steal) {
    const stlRates = defensiveTeam.map((player) => player.stealRate);
    const defensivePlayer = defensiveTeam[getIndexFromWeights(stlRates)].name;
    scoreBoard.boxScore[defensivePlayer].steals += 1;
    scoreBoard.playByPlay.push({
      quarter: scoreBoard.quarter,
      play:
        "Steal by  " +
        defensivePlayer +
        ". Turnover by " +
        possessionEndingPlayer.name,
      timeRemaining: scoreBoard.timeRemaining,
    });
    return [PossessionStart.Steal, 0];
  } else if (outcome === PossessionOutcome.OffensiveFoul) {
    scoreBoard.boxScore[possessionEndingPlayer.name].fouls += 1;
    scoreBoard.boxScore[possessionEndingPlayer.name].turnovers += 1;
    scoreBoard.playByPlay.push({
      quarter: scoreBoard.quarter,
      play: "Offensive foul on  " + possessionEndingPlayer.name,
      timeRemaining: scoreBoard.timeRemaining,
    });
    return [PossessionStart.DeadBall, 0];
  } else {
    const blkRates = defensiveTeam.map((player) => player.blockRate);
    const teamBlkRate = defensiveTeam.reduce(
      (total, player) => total + player.blockRate,
      0
    );

    const defensivePlayer = defensiveTeam[getIndexFromWeights(blkRates)].name;

    if (Math.random() < weights.BLK * teamBlkRate) {
      scoreBoard.boxScore[defensivePlayer].blocks += 1;
      scoreBoard.playByPlay.push({
        quarter: scoreBoard.quarter,
        play:
          possessionEndingPlayer.name + " shot blocked by " + defensivePlayer,
        timeRemaining: scoreBoard.timeRemaining,
      });
      return [PossessionStart.Miss, 0];
    }
    const [outcome, points] = simulateShot(
      offensiveTeam,
      defensiveTeam,
      possessionEndingIndex,
      scoreBoard,
      prevPossessionEnd
    );

    if (outcome === PossessionStart.Miss) {
      const oreb = offensiveTeam.reduce(
        (sum, player) => sum + player.offensiveReboundRate,
        0
      );
      const dreb = offensiveTeam.reduce(
        (sum, player) => sum + player.defensiveReboundRate,
        0
      );

      const adj = (oreb - dreb) / 2 + (ODPM - DDPM) / 50;

      const is_oreb =
        Math.random() < (adj / 50) * REBOUNDING_MULTIPLIER + OFF_REB_CHANCE;

      if (is_oreb) {
        // play by play here
        const rebounder = genOffensiveRebounder(offensiveTeam);
        scoreBoard.playByPlay.push({
          quarter: scoreBoard.quarter,
          play: "Offensive rebound by  " + rebounder,
          timeRemaining: scoreBoard.timeRemaining,
        });
        scoreBoard.boxScore[rebounder].offReb += 1;
        return [PossessionStart.Oreb, 0];
      } else {
        const rebounder = genDefensiveRebounder(defensiveTeam);
        scoreBoard.playByPlay.push({
          quarter: scoreBoard.quarter,
          play: "Defensive rebound by  " + rebounder,
          timeRemaining: scoreBoard.timeRemaining,
        });
        scoreBoard.boxScore[rebounder].defReb += 1;
        return [PossessionStart.Miss, 0];
      }
    } else {
      const isAssist = genIsAssist(weights);
      if (isAssist) {
        const assister = genAssister(offensiveTeam);
        scoreBoard.boxScore[assister].assists += 1;
      }
      return [PossessionStart.Make, points];
    }
  }
}

function genShotType(
  player: PlayerRatings,
  OAST: number,
  DDPM: number,
  ODPM: number
): "two" | "three" {
  const shotType = Math.random();
  const adj = OAST / 2 + DDPM / 100 - ODPM / 100;
  const ratio =
    (player.twoPointAttemptRate - adj / 5) /
    (player.twoPointAttemptRate + player.threePointAttemptRate);
  if (shotType < ratio) {
    return "two";
  } else {
    return "three";
  }
}

function genIsFoul(
  shotType: "two" | "three",
  player: PlayerRatings,
  defense: PlayerRatings[]
) {
  const ft = player.freeThrowRate / 2.1;
  const foulRate =
    defense
      .map((player) => player.foulRate)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) - 0.25;

  const ftShotsPerFG =
    ft / (player.threePointAttemptRate + player.twoPointAttemptRate);
  if (shotType == "two") {
    return (
      Math.random() < ftShotsPerFG + foulRate / 2 + foulRate * ftShotsPerFG
    );
  } else {
    return (
      Math.random() <
      (ftShotsPerFG + foulRate / 2 + foulRate * ftShotsPerFG) / 2.5
    );
  }
}

function takeFreeThrows(
  player: PlayerRatings,
  numFreeThrows: number,
  scoreBoard: ScoreBoard
): [PossessionStart, number] {
  let points = 0;
  let outcome: PossessionStart = PossessionStart.Miss;
  let res = "";
  while (numFreeThrows > 0) {
    if (Math.random() < player.freeThrowPercentage) {
      scoreBoard.boxScore[player.name].points += 1;
      scoreBoard.boxScore[player.name].freeThrowsMade += 1;
      points += 1;
      outcome = PossessionStart.Make;
      res = " made FT";
    } else {
      res = " missed FT";
      outcome = PossessionStart.Miss;
    }
    scoreBoard.playByPlay.push({
      quarter: scoreBoard.quarter,
      play: player.name + res,
      timeRemaining: scoreBoard.timeRemaining,
    });
    scoreBoard.boxScore[player.name].freeThrowsTaken += 1;
    numFreeThrows -= 1;
  }
  return [outcome, points];
}

function takeShot(
  player: PlayerRatings,
  shotType: "two" | "three",
  isFoul: boolean,
  scoreBoard: ScoreBoard,
  fouler: string,
  prevPossessionEnd: PossessionStart,
  ODPM: number, // average DPM
  DDPM: number,
  ast: number // team assists per possession above average
): [PossessionStart, number] {
  const foulPenalty = isFoul ? 0.3 : 1;
  let possessionConst = 1;

  switch (prevPossessionEnd) {
    case PossessionStart.Make:
      possessionConst *= 0.9815;
      break;
    case PossessionStart.Miss:
      possessionConst *= 1.0153;
      break;
    case PossessionStart.DeadBall:
      possessionConst *= 0.9659;
      break;
    case PossessionStart.Steal:
      possessionConst *= 1.154;
      break;
    case PossessionStart.MissFT:
      possessionConst *= 0.9928;
      break;
    case PossessionStart.MakeFT:
      possessionConst *= 0.9642;
      break;
    case PossessionStart.Timeout:
      possessionConst *= 0.9624;
      break;
  }

  if (shotType === "two") {
    possessionConst += ODPM / 50 - DDPM / 50 + ast / 5;
    if (
      Math.random() <
      player.twoPointPercentage * foulPenalty * possessionConst
    ) {
      scoreBoard.boxScore[player.name].twoPointShotsTaken += 1;
      scoreBoard.boxScore[player.name].twoPointShotsMade += 1;
      scoreBoard.boxScore[player.name].points += 2;
      scoreBoard.playByPlay.push({
        quarter: scoreBoard.quarter,
        play: player.name + " made 2pt shot",
        timeRemaining: scoreBoard.timeRemaining,
      });
      if (isFoul) {
        scoreBoard.playByPlay.push({
          quarter: scoreBoard.quarter,
          play: player.name + " fouled on 2 by " + fouler,
          timeRemaining: scoreBoard.timeRemaining,
        });
        scoreBoard.boxScore[fouler].fouls += 1;
        const [outcome, points] = takeFreeThrows(player, 1, scoreBoard);
        return [outcome, 2 + points];
      }
      return [PossessionStart.Make, 2];
    } else {
      scoreBoard.playByPlay.push({
        quarter: scoreBoard.quarter,
        play: player.name + " missed 2pt shot",
        timeRemaining: scoreBoard.timeRemaining,
      });
      if (isFoul) {
        scoreBoard.playByPlay.push({
          quarter: scoreBoard.quarter,
          play: player.name + " fouled on 2 by " + fouler,
          timeRemaining: scoreBoard.timeRemaining,
        });
        scoreBoard.boxScore[fouler].fouls += 1;
        return takeFreeThrows(player, 2, scoreBoard);
      } else {
        scoreBoard.boxScore[player.name].twoPointShotsTaken += 1;
        return [PossessionStart.Miss, 0];
      }
    }
  } else {
    possessionConst += ast / 5;
    if (
      Math.random() <
      player.threePointPercentage * foulPenalty * possessionConst
    ) {
      scoreBoard.playByPlay.push({
        quarter: scoreBoard.quarter,
        play: player.name + " made 3pt shot",
        timeRemaining: scoreBoard.timeRemaining,
      });
      scoreBoard.boxScore[player.name].threePointShotsTaken += 1;
      scoreBoard.boxScore[player.name].threePointShotsMade += 1;
      scoreBoard.boxScore[player.name].points += 3;
      if (isFoul) {
        const [outcome, points] = takeFreeThrows(player, 1, scoreBoard);
        return [outcome, 3 + points];
      }
      return [PossessionStart.Make, 3];
    } else {
      scoreBoard.playByPlay.push({
        quarter: scoreBoard.quarter,
        play: player.name + " missed 3pt shot",
        timeRemaining: scoreBoard.timeRemaining,
      });
      if (isFoul) {
        scoreBoard.playByPlay.push({
          quarter: scoreBoard.quarter,
          play: player.name + " fouled on 3 by " + fouler,
          timeRemaining: scoreBoard.timeRemaining,
        });
        return takeFreeThrows(player, 3, scoreBoard);
      } else {
        scoreBoard.boxScore[player.name].threePointShotsTaken += 1;
      }
      return [PossessionStart.Miss, 0];
    }
  }
}

function simulateShot(
  offensiveTeam: PlayerRatings[],
  defensiveTeam: PlayerRatings[],
  possessionEndingIndex: number,
  scoreBoard: ScoreBoard,
  prevPossessionEnd: PossessionStart
): [PossessionStart, number] {
  const player = offensiveTeam[possessionEndingIndex];

  const ODPM =
    offensiveTeam
      .map((player) => player.nonBoxODPM)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) / 5;
  const OAST =
    offensiveTeam
      .map((player) => player.assistRate)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) - 0.25; // leaague avg AST
  const DDPM =
    defensiveTeam
      .map((player) => player.DDPM)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) / 5;

  const shotType = genShotType(player, OAST, DDPM, ODPM);
  const isFoul: boolean = genIsFoul(shotType, player, defensiveTeam);
  const foulRates = defensiveTeam.map((player) => player.foulRate);
  const fouler = defensiveTeam[getIndexFromWeights(foulRates)].name;

  return takeShot(
    player,
    shotType,
    isFoul,
    scoreBoard,
    fouler,
    prevPossessionEnd,
    ODPM,
    DDPM,
    OAST
  );
}

function genDefensiveFoulProb(defensiveTeam: PlayerRatings[]): number {
  const defensiveFoulRate = defensiveTeam
    .map((player) => player.foulRate)
    .reduce((a, b) => a + b, 0);
  return defensiveFoulRate / 5;
}

function simulatePossessionTime(possessionType: PossessionStart): number {
  let avgPossessionTime = 14.5;
  let stdPossessionTime = 7.189;

  switch (possessionType) {
    case PossessionStart.Make:
      avgPossessionTime *= 1.225;
      break;
    case PossessionStart.Miss:
      avgPossessionTime *= 0.7246;
      break;
    case PossessionStart.DeadBall:
      avgPossessionTime *= 1.1021;
      break;
    case PossessionStart.Steal:
      avgPossessionTime *= 0.5703;
      break;
    case PossessionStart.MissFT:
      avgPossessionTime *= 1.034;
      break;
    case PossessionStart.MakeFT:
      avgPossessionTime *= 1.125;
      break;
    case PossessionStart.Timeout:
      avgPossessionTime *= 1.212;
      break;
    case PossessionStart.Oreb:
      avgPossessionTime *= 0.3326;
      break;
  }

  // Generating a random number with normal distribution
  function randomGaussian(mean: number, stdDev: number) {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * stdDev + mean;
  }

  const possessionTime = Math.round(
    randomGaussian(avgPossessionTime, stdPossessionTime)
  );
  let clampedTime = Math.min(24, possessionTime);
  if (PossessionStart.Oreb === possessionType) {
    clampedTime = Math.min(14, possessionTime);
  }

  return clampedTime;
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
  homeTeam: Player[],
  awayTeam: Player[]
): ScoreBoard => {
  // Initialize box score for each player
  const initializePlayerBoxScore = (player: Player): PlayerBoxScore => ({
    name: player.name,
    teamAbbr: player.teamAbbr,
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
    mins: 0,
    poss: 0,
    teamPointsAgainst: 0,
    teamPointsScored: 0,
  });

  const combinedTeams = [...homeTeam, ...awayTeam]; // Combining the two teams into a single array

  const boxScore = combinedTeams.reduce((boxScoreDict, player) => {
    boxScoreDict[player.name] = initializePlayerBoxScore(player);
    return boxScoreDict;
  }, {} as { [playerName: string]: PlayerBoxScore });

  return {
    timeRemaining: 720, // Adjust according to your game's duration
    boxScore: boxScore,
    playByPlay: [],
    rapmInput: [],
    quarter: 1,
  };
};
