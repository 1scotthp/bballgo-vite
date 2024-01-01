import { useContext, useState } from 'react';
import { TeamsContext, calculateGameResult } from '../TeamsProvider';
import { ScoreBoard, Team } from '../types/types';
import { simulateGame } from '../utils/simulateGame';

const conferences = {
  Eastern: ["BOS", "BKN", "NYK", "PHI", "TOR", "CHI", "CLE", "DET", "IND", "MIL", "ATL", "CHA", "MIA", "ORL", "WAS"],
  Western: ["DEN", "MIN", "OKC", "POR", "UTA", "GSW", "LAC", "LAL", "PHX", "SAC", "DAL", "HOU", "MEM", "NOP", "SAS"]
};

type PlayoffResults = {
    east: RoundResult[] | null;
    west: RoundResult[] | null;
    finals: GameResult[] | null;
  };

const Playoffs = () => {
  const { teams } = useContext(TeamsContext);

  const sortedEasternTeams = teams
    .filter(team => conferences.Eastern.includes(team.teamAbbreviation))
    .sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0))
    .slice(0, 10);

  const sortedWesternTeams = teams
    .filter(team => conferences.Western.includes(team.teamAbbreviation))
    .sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0))
    .slice(0, 10);

    const [playoffResults, setPlayoffResults] = useState<PlayoffResults>({
        east: null,
        west: null,
        finals: null
      });
    
      const simYoffs = () => {
        const eastResults = simulatePlayoffs(sortedEasternTeams);
        const westResults = simulatePlayoffs(sortedWesternTeams);
        const finalsResult = simulateRound([[eastResults.champion, westResults.champion]], 4); // Finals as round 4
        console.log(eastResults.rounds);
    
        setPlayoffResults({
          east: eastResults.rounds,
          west: westResults.rounds,
          finals: finalsResult.games
        });
      }
  return (
    <div>
      <button onClick={simYoffs}>Simulate Playoffs</button>
      
      <h2>Eastern Conference Playoffs Results</h2>
      {playoffResults.east && playoffResults.east.map(round => (
        <div key={`east-round-${round.round}`}>
          <h3>Round {round.round}</h3>
          {round.games.map(game => (
            <div key={`east-game-${game.winner.teamAbbreviation}-${game.loser.teamAbbreviation}`}>
              Winner: {game.winner.teamAbbreviation} - Loser: {game.loser.teamAbbreviation}
              ({game.winnerWins}-{game.loserWins})
            </div>
          ))}
        </div>
      ))}
  
      <h2>Western Conference Playoffs Results</h2>
      {playoffResults.west && playoffResults.west.map(round => (
        <div key={`west-round-${round.round}`}>
          <h3>Round {round.round}</h3>
          {round.games.map(game => (
            <div key={`west-game-${game.winner.teamAbbreviation}-${game.loser.teamAbbreviation}`}>
              Winner: {game.winner.teamAbbreviation} - Loser: {game.loser.teamAbbreviation}
              ({game.winnerWins}-{game.loserWins})
            </div>
          ))}
        </div>
      ))}
  
      <h2>NBA Finals Results</h2>
      {playoffResults.finals && playoffResults.finals.map(game => (
        <div key={`finals-${game.winner.teamAbbreviation}-${game.loser.teamAbbreviation}`}>
          Winner: {game.winner.teamAbbreviation} - Loser: {game.loser.teamAbbreviation}
          ({game.winnerWins}-{game.loserWins})
        </div>
      ))}
    </div>
  );
  
};

type GameResult = {
    winner: Team;
    loser: Team;
    winnerWins: number;
    loserWins: number;
  };
  
  type RoundResult = {
    round: number;
    games: GameResult[];
  };

// Assuming `sortedTeams` is an array of teams sorted by their seed for the conference
function createFirstRoundMatchups(sortedTeams: Team[]): [Team, Team][] {
    return [
      [sortedTeams[0], sortedTeams[7]], // 1st seed vs 8th seed
      [sortedTeams[3], sortedTeams[4]], // 4th seed vs 5th seed
      [sortedTeams[1], sortedTeams[6]], // 2nd seed vs 7th seed
      [sortedTeams[2], sortedTeams[5]], // 3rd seed vs 6th seed
    ];
  }

  function simulateRound(matchups: [Team, Team][], roundNumber: number): RoundResult {
    const games: GameResult[] = [];
    
    matchups.forEach(matchup => {
      let team1Wins = 0;
      let team2Wins = 0;
    
      while (team1Wins < 4 && team2Wins < 4) {
        const scoreBoard = simulateGame(matchup[0].roster, matchup[1].roster) as ScoreBoard;
        const result = calculateGameResult(scoreBoard);
        
        if (matchup[0].teamAbbreviation === result.winner) {
          team1Wins++;
        } else {
          team2Wins++;
        }
      }
    
      const gameResult: GameResult = {
        winner: team1Wins === 4 ? matchup[0] : matchup[1],
        loser: team1Wins === 4 ? matchup[1] : matchup[0],
        winnerWins: team1Wins === 4 ? team1Wins : team2Wins,
        loserWins: team1Wins === 4 ? team2Wins : team1Wins
      };
      games.push(gameResult);
    });
    
    return { round: roundNumber, games };
  }

  function simulatePlayoffs(teams: Team[]): { champion: Team, rounds: RoundResult[] } {
    let currentRoundMatchups = createFirstRoundMatchups(teams);
    let roundNumber = 1;
    const playoffResults: RoundResult[] = [];
    
    // Loop until you have one team left, which will be the champion.
    while (currentRoundMatchups.length > 1 || (currentRoundMatchups.length === 1 && currentRoundMatchups[0].length === 2)) {
      const roundResult = simulateRound(currentRoundMatchups, roundNumber);
      playoffResults.push(roundResult);
      
      // Create the matchups for the next round, pair the winners for the next set of matchups.
      const nextRoundMatchups: [Team, Team][] = [];
      for (let i = 0; i < roundResult.games.length; i += 2) {
        // Check if there's a next game to pair with
        if (roundResult.games[i + 1]) {
          nextRoundMatchups.push([roundResult.games[i].winner, roundResult.games[i + 1].winner]);
        }
      }
      currentRoundMatchups = nextRoundMatchups;
      roundNumber++;
    }
    
    // The last remaining team is the champion
    const champion = currentRoundMatchups.length === 1 ? currentRoundMatchups[0][0] : playoffResults[playoffResults.length - 1].games[0].winner;
  
    return {
      champion: champion,
      rounds: playoffResults
    };
  }
  
  
  
  

export default Playoffs;
