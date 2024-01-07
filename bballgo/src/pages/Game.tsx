import { useContext, useState } from "react";
import { TeamsContext } from "../TeamsProvider";
import { PlayerBoxScore } from "../types/types";

const Game = () => {
  const { boxScores } = useContext(TeamsContext);
  const [i, setI] = useState<number>(0);

  const scoreBoard = boxScores[i];
  const playByPlay = scoreBoard.playByPlay;
  const players = Object.values(scoreBoard.boxScore);
  const increment = () => setI((prev) => prev + 1);
  const decrement = () => setI((prev) => prev - 1);

  const teamNames: Set<string> = new Set();
  players.forEach((playerBoxScore) => {
    teamNames.add(playerBoxScore.teamAbbr);
  });

  const [team1Name, team2Name] = Array.from(teamNames);
  const team1: PlayerBoxScore[] = players.filter(
    (playerBoxScore) =>
      playerBoxScore.teamAbbr === team1Name && playerBoxScore.mins > 0.1
  );
  const team2: PlayerBoxScore[] = players.filter(
    (playerBoxScore) =>
      playerBoxScore.teamAbbr === team2Name && playerBoxScore.mins > 0.1
  );

  let team1Score = 0;
  let team2Score = 0;
  team1.map((p) => (team1Score += p.teamPointsScored));
  team2.map((p) => (team2Score += p.teamPointsScored));

  let team1Score2 = 0;
  team1.map((p) => (team1Score2 += p.points));

  return (
    <div>
      <button onClick={decrement}>&lt;</button> {/* Left arrow button */}
      <span style={{ margin: "0 10px" }}>{i}</span> {/* Display the number */}
      <button onClick={increment}>&gt;</button> {/* Right arrow button */}
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div>
          {team1Name}: {team1Score / 5} OR {team1Score2} ----- {team2Name} :{" "}
          {team2Score / 5}
          <StatsTable players={team1} />
          <StatsTable players={team2} />
        </div>
        <div
          style={{ overflowY: "auto", maxHeight: "900px", minWidth: "500px" }}
        >
          {/* Adjust max-height as needed */}
          {playByPlay.map((play, index) => (
            <div key={index}>
              {genTimeString(play.quarter, play.timeRemaining)}
              {"  "} {play.play}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function genTimeString(quarter: number, time: number): string {
  const seconds = Math.floor(time % 60).toFixed(0);
  const mins = Math.floor(time / 60).toFixed(0);
  return (
    "Q " +
    quarter +
    " " +
    (mins.length === 1 ? "0" + mins : mins) +
    ":" +
    (seconds.length === 1 ? "0" + seconds : seconds)
  );
}

type StatsTableProps = {
  players: PlayerBoxScore[];
};

const StatsTable = ({ players }: StatsTableProps) => {
  const tableStyle = { border: "1px solid #ddd", padding: "8px" };
  const headerStyle = { ...tableStyle, backgroundColor: "#82f2f2" };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={headerStyle}>Name</th>
          <th style={headerStyle}>Mins</th>
          <th style={headerStyle}>Pts</th>
          <th style={headerStyle}>Reb</th>
          <th style={headerStyle}>Ast</th>
          <th style={headerStyle}>Stl</th>
          <th style={headerStyle}>Blk</th>
          <th style={headerStyle}>TO</th>
          <th style={headerStyle}>Fouls</th>
          <th style={headerStyle}>2PTA</th>
          <th style={headerStyle}>2PTM</th>
          <th style={headerStyle}>3PTA</th>
          <th style={headerStyle}>3PTM</th>
          <th style={headerStyle}>FTA</th>
          <th style={headerStyle}>FTM</th>
          <th style={headerStyle}>+/-</th>
        </tr>
      </thead>
      <tbody>
        {players
          .sort((a, b) => b.mins - a.mins)
          .map((player) => (
            <tr key={player.name}>
              <td style={tableStyle}>{player.name}</td>
              <td style={tableStyle}>{player.mins.toFixed(0)}</td>
              <td style={tableStyle}>{player.points}</td>
              <td style={tableStyle}>{player.offReb + player.defReb}</td>
              <td style={tableStyle}>{player.assists}</td>
              <td style={tableStyle}>{player.steals}</td>
              <td style={tableStyle}>{player.blocks}</td>
              <td style={tableStyle}>{player.turnovers}</td>
              <td style={tableStyle}>{player.fouls}</td>
              <td style={tableStyle}>{player.twoPointShotsTaken}</td>
              <td style={tableStyle}>{player.twoPointShotsMade}</td>
              <td style={tableStyle}>{player.threePointShotsTaken}</td>
              <td style={tableStyle}>{player.threePointShotsMade}</td>
              <td style={tableStyle}>{player.freeThrowsTaken}</td>
              <td style={tableStyle}>{player.freeThrowsMade}</td>
              <td style={tableStyle}>
                {player.teamPointsScored - player.teamPointsAgainst}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default Game;
