import { ReactNode, createContext, useEffect, useState } from "react";
import { db } from "./db";
import {ScoreBoard, Team, TeamsStandingStats } from "./types/types";

type SeasonData = {
    teams: Team[];
    boxScores: ScoreBoard[];
    updateBoxScores: (newBoxScores: ScoreBoard[]) => void;
  };
  
  export const TeamsContext = createContext<SeasonData>({
    teams: [],
    boxScores: [],
    updateBoxScores: () => {}
  });
  
  
type TeamsProviderProps = {
    children: ReactNode;
  };

  export const TeamsProvider: React.FC<TeamsProviderProps> = ({ children }) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [boxScores, setBoxScores] = useState<ScoreBoard[]>([]);
  
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
        const teamStats = calculateTeamStats(newBoxScores)

        const updatedTeams = teams.map(team => {
            return {
              ...team,
              stats: teamStats[team.teamAbbreviation] || null
            };
          });
        setTeams(updatedTeams);
        console.log(updatedTeams);
    };
    
      return (
        <TeamsContext.Provider value={{ teams, boxScores, updateBoxScores }}>
          {children}
        </TeamsContext.Provider>
      );
  };
  

export function calculateGameResult(scoreBoard: ScoreBoard): { winner: string, loser: string, scores: { [teamAbbr: string]: number } } {
    const teamScores: { [teamAbbr: string]: number } = {};
  
    Object.values(scoreBoard.boxScore).forEach(playerBoxScore => {
      const teamAbbr = playerBoxScore.teamAbbr;
      if (!teamScores[teamAbbr]) {
        teamScores[teamAbbr] = 0;
      }
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
      scores: teamScores
    };
  }


  function calculateTeamStats(boxScores: ScoreBoard[]): { [teamAbbr: string]: TeamsStandingStats } {
    const stats: { [teamAbbr: string]: TeamsStandingStats } = {};
  
    boxScores.forEach(game => {
      const result = calculateGameResult(game);
      const winner = result.winner;
      const loser = result.loser;
      const winningScore = result.scores[winner];
      const losingScore = result.scores[loser];
  
      // Initialize stats if not present
      if (!stats[winner]) {
        stats[winner] = { wins: 0, losses: 0, totalPoints: 0, totalOppPoints: 0, margin: 0};
      }
      if (!stats[loser]) {
        stats[loser] = { wins: 0, losses: 0, totalPoints: 0, totalOppPoints: 0, margin: 0};
      }
  
      // Update stats
      stats[winner].wins += 1;
      stats[winner].totalPoints += winningScore;
      stats[winner].totalOppPoints += losingScore
  
      stats[loser].losses += 1;
      stats[loser].totalPoints += losingScore;
      stats[loser].totalOppPoints += winningScore
    });

  
    // Extract only the required fields for TeamsStandingStats
    const teamStandingStats: { [teamAbbr: string]: TeamsStandingStats } = {};
    Object.keys(stats).forEach(teamAbbr => {
      teamStandingStats[teamAbbr] = {
        wins: stats[teamAbbr].wins,
        losses: stats[teamAbbr].losses,
        totalPoints: stats[teamAbbr].totalPoints,
        totalOppPoints: stats[teamAbbr].totalOppPoints,
        margin: stats[teamAbbr].totalPoints - stats[teamAbbr].totalOppPoints
      };
    });
  
    return teamStandingStats;
  }
  