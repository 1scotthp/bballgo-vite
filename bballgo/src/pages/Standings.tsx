import { useContext } from "react";

import { TeamsContext } from "../TeamsProvider";
import { runSeason } from "../utils/simulateSeason";

const Standings = () => {
  const { teams, updateBoxScores } = useContext(TeamsContext);

  const sim = () => {
    const result = runSeason(teams);
    updateBoxScores(result);
    console.log(result);
  };

  return (
    <div>
      <button onClick={() => sim()}> SIMULATE </button>
      <h1>Team Standings</h1>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>NET Rating</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>PTS/100</th>
            <th>Opp PTS/100</th>
            <th>Poss / game</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.teamAbbreviation}>
              <td style={{ width: "150px" }}>
                {team.teamName || team.teamAbbreviation}
              </td>
              <td style={{ width: "100px" }}>
                {(
                  ((team.stats?.totalPoints - team.stats?.totalOppPoints) *
                    200) /
                  team.stats?.poss
                ).toFixed(1)}
              </td>
              <td style={{ width: "60px" }}>{team.stats?.wins}</td>
              <td style={{ width: "60px" }}>{team.stats?.losses}</td>
              <td style={{ width: "100px" }}>
                {((team.stats?.totalPoints * 200) / team.stats?.poss).toFixed(
                  1
                )}
              </td>
              <td style={{ width: "180px" }}>
                {(
                  (team.stats?.totalOppPoints * 200) /
                  team.stats?.poss
                ).toFixed(1)}
              </td>
              <td style={{ width: "60px" }}>
                {(
                  team.stats?.poss /
                  (team.stats?.wins + team.stats?.losses) /
                  2
                ).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Standings;
