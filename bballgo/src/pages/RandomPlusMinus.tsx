import { useContext, useEffect, useState } from "react";

import { TeamsContext } from "../TeamsProvider";
import { Player } from "../types/types";
import { runRPM } from "../utils/simulateSeason";
const RandomPlusMinus = () => {
  const { teams, updateBoxScores } = useContext(TeamsContext);
  const [players, setPlayers] = useState<Player[]>();
  const [oRTG, setORTG] = useState(1);
  const [dRTG, setDRTG] = useState(1);
  const [minMins, setMinMins] = useState(1);

  const sim = () => {
    const result = runRPM(teams, 25);
    updateBoxScores(result);
  };

  const handleMinMinsChange = (event: any) => {
    setMinMins(event.target.value);
  };

  useEffect(() => {
    const playerArr = teams
      .flatMap((team) => team.roster)
      .filter(
        (player) =>
          player.stats &&
          !isNaN(player.stats.teamPointsScored) &&
          !isNaN(player.stats.teamPointsAgainst) &&
          player.stats.mins > minMins
      );

    const sortedPlayers = [...playerArr].sort((a, b) => {
      const diffA =
        ((a.stats.teamPointsScored - a.stats.teamPointsAgainst) * 200) /
        a.stats.poss;
      const diffB =
        ((b.stats.teamPointsScored - b.stats.teamPointsAgainst) * 200) /
        b.stats.poss;

      return diffB - diffA;
    });
    setPlayers(sortedPlayers);

    let oSum: number = 0;
    let dSum: number = 0;
    sortedPlayers.map((player) => {
      oSum += (player.stats.teamPointsScored * 200) / player.stats.poss;
      dSum += (player.stats.teamPointsAgainst * 200) / player.stats.poss;
    });

    const o = oSum / sortedPlayers.length;
    const d = dSum / sortedPlayers.length;
    setORTG(o);
    setDRTG(d);

    console.log(o, d);
  }, [teams, minMins]);

  return (
    <div>
      <button onClick={() => sim()}> Run!</button>
      <h1>Random Plus Minus</h1>

      <div>
        <label htmlFor="minMins">Minimum Minutes: {minMins}</label>
        <input
          type="range"
          id="minMins"
          name="minMins"
          min="1"
          max="10000"
          value={minMins}
          onChange={handleMinMinsChange}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Team
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Name
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              RPM
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              ORPM
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              DRPM
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Mins
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Pts/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Reb/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Ast/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Stl/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Blk/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              TO/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              Fouls/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              2PTA/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              2PTM/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              3PTA/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              3PTM/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              FTA/100
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#82f2f2",
              }}
            >
              FTM/100
            </th>
          </tr>
        </thead>
        <tbody>
          {players?.map((player) => {
            return (
              <tr key={player.ratings.rID}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {player.teamAbbr}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {player.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    ((player.stats.teamPointsScored -
                      player.stats.teamPointsAgainst) *
                      200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.teamPointsScored * 200) / player.stats.poss -
                    oRTG
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    -(
                      (player.stats.teamPointsAgainst * 200) /
                      player.stats.poss
                    ) + dRTG
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {player.stats.mins.toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {((player.stats.points * 200) / player.stats.poss).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    ((player.stats.offReb + player.stats.defReb) * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {((player.stats.assists * 200) / player.stats.poss).toFixed(
                    1
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {((player.stats.steals * 200) / player.stats.poss).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {((player.stats.blocks * 200) / player.stats.poss).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {((player.stats.turnovers * 200) / player.stats.poss).toFixed(
                    1
                  )}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {((player.stats.fouls * 200) / player.stats.poss).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.twoPointShotsTaken * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.twoPointShotsMade * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.threePointShotsTaken * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.threePointShotsMade * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.freeThrowsTaken * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {(
                    (player.stats.freeThrowsMade * 200) /
                    player.stats.poss
                  ).toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RandomPlusMinus;
