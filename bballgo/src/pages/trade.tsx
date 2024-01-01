import { useContext, useState } from 'react';
import { TeamsContext } from '../TeamsProvider';


const Trade = () => {
  const { teams, userTeam, tradePlayers } = useContext(TeamsContext);
  const [tradeAway, setTradeAway] = useState<string[]>([]);
  const [tradePartner, setTradePartner] = useState<string>("");
  const [tradeFor, setTradeFor] = useState<string[]>([]);

  const userTeamRoster = teams.find(team => team.teamAbbreviation === userTeam)?.roster;
  const tradePartnerRoster = teams.find(team => team.teamAbbreviation === tradePartner)?.roster;

  const handleTrade = () => {
    // Implement the logic to handle the trade
    tradePlayers(userTeam, tradeAway, tradePartner, tradeFor);
    console.log(`Trading ${tradeAway} with ${tradeFor}`);
  };

  return (
    <div>
      <h2>Trade Players</h2>
      <div>
        <h3>Your Team: {userTeam}</h3>
        <select onChange={(e) => setTradeAway([e.target.value])}>
          {userTeamRoster?.map(player => (
            <option key={player.id} value={player.name}>{player.name}</option>
          ))}
        </select>
      </div>
      <div>
        <h3>Trade Partner</h3>
        <select onChange={(e) => setTradePartner(e.target.value)}>
          {teams.filter(team => team.teamAbbreviation !== userTeam).map(team => (
            <option key={team.teamAbbreviation} value={team.teamAbbreviation}>{team.teamAbbreviation}</option>
          ))}
        </select>
      </div>
      <div>
        <h3>Player to Trade For</h3>
        <select onChange={(e) => setTradeFor([e.target.value])}>
          {tradePartnerRoster?.map(player => (
            <option key={player.id} value={player.name}>{player.name}</option>
          ))}
        </select>
      </div>
      <button onClick={handleTrade}>Confirm Trade</button>
    </div>
  );
};

export default Trade;
