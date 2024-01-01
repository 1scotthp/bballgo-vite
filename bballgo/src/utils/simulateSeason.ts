import { ScoreBoard, Team } from "../types/types";
import { simulateGame } from "./simulateGame";

const teamAbbrs = [
    "ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW",
    "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NOP", "NYK",
    "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"
  ];

  
  function generateRandomSchedule(): [string, string][] {
    const totalGamesPerTeam = 82;
    const schedule: [string, string][] = [];
    const teamsWithGamesLeft = [...teamAbbrs]; // Clone the original array
    const gamesCount: { [team: string]: number } = {};
  
    // Initialize games count
    teamAbbrs.forEach(team => {
      gamesCount[team] = 0;
    });
  
    while (teamsWithGamesLeft.length > 1) {
      // Randomly pick two different teams
      const randomIndex1 = Math.floor(Math.random() * teamsWithGamesLeft.length);
      let randomIndex2 = Math.floor(Math.random() * teamsWithGamesLeft.length);
      while (randomIndex1 === randomIndex2) {
        randomIndex2 = Math.floor(Math.random() * teamsWithGamesLeft.length);
      }
  
      const team1 = teamsWithGamesLeft[randomIndex1];
      const team2 = teamsWithGamesLeft[randomIndex2];
  
      // Add the matchup to the schedule
      schedule.push([team1, team2]);
      gamesCount[team1]++;
      gamesCount[team2]++;
  
      // Remove teams that have reached 82 games
      if (gamesCount[team1] === totalGamesPerTeam) {
        teamsWithGamesLeft.splice(randomIndex1, 1);
      }
      if (gamesCount[team2] === totalGamesPerTeam && teamsWithGamesLeft.includes(team2)) {
        teamsWithGamesLeft.splice(randomIndex2, 1);
      }
    }
  
    return schedule;
  }

  

  export function runSeason(teams: Team[]): ScoreBoard[] {
    const nbaSchedule = generateRandomSchedule();
    const boxScores: (ScoreBoard | undefined)[] = [];
  

    nbaSchedule.forEach(([homeTeamAbbr, awayTeamAbbr]) => {
      // Find the corresponding team objects for home and away teams
      const homeTeam = teams.find(team => team.teamAbbreviation === homeTeamAbbr);
      const awayTeam = teams.find(team => team.teamAbbreviation === awayTeamAbbr);
  
      if (homeTeam && awayTeam) {
        // Simulate the game
        const gameResult = simulateGame(homeTeam.roster, awayTeam.roster);
        boxScores.push(gameResult);
      }
    });

  
    return boxScores as ScoreBoard[]; // This array contains the box scores of all the games
  }
  

  