import { ReactNode, createContext, useEffect, useState } from "react";
import { db } from "./db";
import { PlayerBoxScore, ScoreBoard, Team, TeamsStandingStats } from "./types/types";

type SeasonData = {
    teams: Team[];
    setTeams: (teams: Team[]) => void;
    boxScores: ScoreBoard[];
    updateBoxScores: (newBoxScores: ScoreBoard[]) => void;
    tradePlayers: (team1Abbr: string, team1Players: string[], team2Abbr: string, team2Players: string[]) => void,
    userTeam: string,
    rapm: Record<string, number>,
    setRapm: (r: Record<string, number>) => void,
    year: string
  };
  
  export const TeamsContext = createContext<SeasonData>({
    teams: [],
    setTeams: () => {},
    boxScores: [],
    updateBoxScores: () => {},
    tradePlayers: ([], []) => {},
    userTeam: "MIL",
    rapm: {},
    setRapm: () => {},
    year: "2022-23"
  });
  
  
type TeamsProviderProps = {
    children: ReactNode;
  };

  export const TeamsProvider: React.FC<TeamsProviderProps> = ({ children }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [boxScores, setBoxScores] = useState<ScoreBoard[]>([]);
    const [userTeam, _] = useState<string>("MIL")
    const [rapm, setRapm] = useState<Record<string, number>>({})
    const [year, _1] = useState<string>("2022-23");

  
    useEffect(() => {
      const fetchTeams = async () => {
        const allTeams = await db.teams.toArray();
        setTeams(allTeams);
      };
      if(teams.length === 0){
        fetchTeams().catch(console.error);
      }


    }, []);


    const updateBoxScores = (newBoxScores: ScoreBoard[]) => {
        setBoxScores(newBoxScores);
        const teamStats = calculateTeamStats(newBoxScores);
        const playerStats = calculatePlayerStats(newBoxScores);
        
      
        const updatedTeams = teams.map(team => {
          return {
            ...team,
            stats: teamStats[team.teamAbbreviation] || null,
            roster: team.roster.map(player => {
              return {
                ...player,
                stats: playerStats[player.name] || player.stats // Update player stats or keep existing ones
              };
            })
          };
        });
      
        setTeams(updatedTeams);
        console.log(updatedTeams);
      };

    const tradePlayers = (team1Abbr: string, team1Players: string[], team2Abbr: string, team2Players: string[]) => {
        
        
        const newTeams = teams.map(team => {
          if (team.teamAbbreviation === team1Abbr) {
            // Update team1 roster and traded players' teamAbbreviation
            return {
              ...team,
              roster: team.roster
                .filter(player => !team1Players.includes(player.name))
                .concat(teams.find(t => t.teamAbbreviation === team2Abbr)?.roster.filter(player => team2Players.includes(player.name)).map(player => ({ ...player, teamAbbr: team1Abbr })) || [])
            };
          } else if (team.teamAbbreviation === team2Abbr) {
            // Update team2 roster and traded players' teamAbbreviation
            return {
              ...team,
              roster: team.roster
                .filter(player => !team2Players.includes(player.name))
                .concat(teams.find(t => t.teamAbbreviation === team1Abbr)?.roster.filter(player => team1Players.includes(player.name)).map(player => ({ ...player, teamAbbr: team2Abbr })) || [])
            };
          }
          return team;
        });
      
        setTeams(newTeams);
      };
      
      
    
      return (
        <TeamsContext.Provider value={{ teams, boxScores, updateBoxScores, userTeam, tradePlayers, rapm, setRapm , setTeams, year}}>
          {children}
        </TeamsContext.Provider>
      );
  };
  

export function calculateGameResult(scoreBoard: ScoreBoard): { winner: string, loser: string, scores: { [teamAbbr: string]: number }, poss: number } {
    const teamScores: { [teamAbbr: string]: number } = {};
    let possCount = 0;
  
    Object.values(scoreBoard.boxScore).forEach(playerBoxScore => {
      const teamAbbr = playerBoxScore.teamAbbr;
      if (!teamScores[teamAbbr]) {
        teamScores[teamAbbr] = 0;
      }
      possCount += playerBoxScore.poss;
      teamScores[teamAbbr] += playerBoxScore.points;
    });
  
    // Determine winner and loser
    const teams = Object.keys(teamScores);
    const winner = teams[0];
    const loser = teams[1];
    const isTeam1Winner = teamScores[teams[0]] > teamScores[teams[1]];
  
    return {
      winner: isTeam1Winner ? winner : loser,
      loser: isTeam1Winner ? loser : winner,
      scores: teamScores,
      poss: possCount
    };
  }

  function calculatePlayerStats(boxScores: ScoreBoard[]): { [playerName: string]: PlayerBoxScore } {
    const playerStats: { [playerName: string]: PlayerBoxScore } = {};
  
    boxScores.forEach(game => {
        Object.values(game.boxScore).forEach(entry => {
          if (!playerStats[entry.name]) {
            playerStats[entry.name] = {
              name: entry.name,
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
              teamAbbr: entry.teamAbbr,
              teamPointsAgainst: 0,
              teamPointsScored: 0
            };
          }
          playerStats[entry.name].points += entry.points;
          playerStats[entry.name].offReb += entry.offReb;
          playerStats[entry.name].defReb += entry.defReb;
          playerStats[entry.name].assists += entry.assists;
          playerStats[entry.name].steals += entry.steals;
          playerStats[entry.name].blocks += entry.blocks;
          playerStats[entry.name].turnovers += entry.turnovers;
          playerStats[entry.name].fouls += entry.fouls;
          playerStats[entry.name].twoPointShotsTaken += entry.twoPointShotsTaken;
          playerStats[entry.name].twoPointShotsMade += entry.twoPointShotsMade;
          playerStats[entry.name].threePointShotsTaken += entry.threePointShotsTaken;
          playerStats[entry.name].threePointShotsMade += entry.threePointShotsMade;
          playerStats[entry.name].freeThrowsTaken += entry.freeThrowsTaken;
          playerStats[entry.name].freeThrowsMade += entry.freeThrowsMade;
          playerStats[entry.name].mins += entry.mins;
          playerStats[entry.name].poss += entry.poss;
          playerStats[entry.name].teamPointsAgainst += entry.teamPointsAgainst;
          playerStats[entry.name].teamPointsScored += entry.teamPointsScored;
        });
      });
      
      
  
    return playerStats;
  };
  


  function calculateTeamStats(boxScores: ScoreBoard[]): { [teamAbbr: string]: TeamsStandingStats } {
    const stats: { [teamAbbr: string]: TeamsStandingStats } = {};
  
    boxScores.forEach(game => {
      const result = calculateGameResult(game);
      const winner = result.winner;
      const loser = result.loser;
      const winningScore = result.scores[winner];
      const losingScore = result.scores[loser];
      const poss = result.poss;
  
      // Initialize stats if not present
      if (!stats[winner]) {
        stats[winner] = { wins: 0, losses: 0, totalPoints: 0, totalOppPoints: 0, margin: 0, poss: 0};
      }
      if (!stats[loser]) {
        stats[loser] = { wins: 0, losses: 0, totalPoints: 0, totalOppPoints: 0, margin: 0, poss: 0};
      }
  
      // Update stats
      stats[winner].wins += 1;
      stats[winner].totalPoints += winningScore;
      stats[winner].totalOppPoints += losingScore
      stats[winner].poss += poss

  
      stats[loser].losses += 1;
      stats[loser].totalPoints += losingScore;
      stats[loser].totalOppPoints += winningScore
      stats[loser].poss += poss
    });

  
    // Extract only the required fields for TeamsStandingStats
    const teamStandingStats: { [teamAbbr: string]: TeamsStandingStats } = {};
    Object.keys(stats).forEach(teamAbbr => {
      teamStandingStats[teamAbbr] = {
        wins: stats[teamAbbr].wins,
        losses: stats[teamAbbr].losses,
        totalPoints: stats[teamAbbr].totalPoints,
        totalOppPoints: stats[teamAbbr].totalOppPoints,
        margin: stats[teamAbbr].totalPoints - stats[teamAbbr].totalOppPoints,
        poss: stats[teamAbbr].poss / 10 // 10 players on court
      };
    });
  
    return teamStandingStats;
  }
  