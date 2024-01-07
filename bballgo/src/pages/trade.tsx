import { useContext, useEffect, useState } from 'react';
import { TeamsContext } from '../TeamsProvider';
import { Player } from '../types/types';
import { attemptTrade } from '../utils/contracts';


const Trade = () => {
  const { teams, tradePlayers, year, userTeam } = useContext(TeamsContext);
  const [tradePartner, setTradePartner] = useState<string>("");
  const [leftTeam, setLeftTeam] = useState<string>(userTeam);
  const [response, setResponse] = useState<string>("");

  const [leftRoster, setLeftRoster] = useState<Player[]>(teams.find(team => team.teamAbbreviation === leftTeam)?.roster ?? []);
  const [rightRoster, setRightRoster] = useState<Player[]>(teams.find(team => team.teamAbbreviation === tradePartner)?.roster ?? []);
  const [selectedLeftTeamPlayers, setSelectedLeftTeamPlayers] = useState<Player[]>([]);
  const [selectedRightTeamPlayers, setSelectedRightTeamPlayers] = useState<Player[]>([]);
  
  const handleLeftCheckboxChange = (player: Player, isChecked: boolean) => {
      setSelectedLeftTeamPlayers(prev => 
        isChecked ? [...prev, player] : prev.filter(p => p !== player)
      );
  };

  const handleRightCheckboxChange = (player: Player, isChecked: boolean) => {
    setSelectedRightTeamPlayers(prev => 
      isChecked ? [...prev, player] : prev.filter(p => p !== player)
    );
};
  
useEffect(() => {
  setRightRoster(teams.find(team => team.teamAbbreviation === tradePartner)?.roster ?? []);
  setLeftRoster(teams.find(team => team.teamAbbreviation === leftTeam)?.roster ?? [])
}, [teams, tradePartner, leftTeam])

  const handleTrade = () => {
    // const team1 = teams.find(team => team.teamAbbreviation === leftTeam);
    // const team2 = teams.find(team => team.teamAbbreviation === tradePartner)

    const r = attemptTrade(leftRoster,selectedLeftTeamPlayers, rightRoster, selectedRightTeamPlayers, year);
    setResponse(r);
    const names1 = selectedLeftTeamPlayers.flatMap(player => player.name);
    const names2 = selectedRightTeamPlayers.flatMap(player => player.name);
    console.log(names1, names2, r);
    if(r === "ACCEPTED"){
      tradePlayers(leftTeam, names1, tradePartner, names2);
      setSelectedLeftTeamPlayers([]);
      setSelectedRightTeamPlayers([]);
      console.log(`Trading ${names1.join(', ')} with ${names2.join(', ')}`);
    }
  };

  let c = 0;
  while (leftRoster && leftRoster[c]?.contract?.years === undefined){
    c +=1
  }
  const yearKeys = Object.keys(leftRoster && (leftRoster[c].contract?.years ?? {}));

  
    return (
      <div>
        <h2>Trade Players</h2>
        <h2>{response}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{width: '50%'}}>
            <h3>Your Team: {leftTeam}</h3>
            <select value={leftTeam} onChange={(e) => setLeftTeam(e.target.value)}>
              {teams.filter(team => team.teamAbbreviation !== leftTeam).map(team => (
                <option key={team.teamAbbreviation} value={team.teamAbbreviation}>{team.teamAbbreviation}</option>
              ))}
            </select>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>{yearKeys[0]}</th>
                  <th>{yearKeys[1]}</th>
                  <th>{yearKeys[2]}</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {leftRoster?.sort((a, b) => b.contract?.years[yearKeys[0]]?.amount ?? 0 - (a.contract?.years[yearKeys[0]]?.amount ?? 0))?.map(player => (
                  <tr key={player.ratings?.rID}>
                    <td>{player.name}</td>
                    <td>{numberToMillionString(player.contract?.years[yearKeys[0]]?.amount ?? 0)}</td>
                    <td>{numberToMillionString(player.contract?.years[yearKeys[1]]?.amount ?? 0)}</td>
                    <td>{numberToMillionString(player.contract?.years[yearKeys[2]]?.amount ?? 0)}</td>
                    <td>
                      <input 
                        type="checkbox" 
                        onChange={e => handleLeftCheckboxChange(player, e.target.checked)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3>Trade Partner: {tradePartner} </h3>
            <select value={tradePartner} onChange={(e) => setTradePartner(e.target.value)}>
              {teams.filter(team => team.teamAbbreviation !== tradePartner).map(team => (
                <option key={team.teamAbbreviation} value={team.teamAbbreviation}>{team.teamAbbreviation}</option>
              ))}
            </select>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>{yearKeys[0]}</th>
                  <th>{yearKeys[1]}</th>
                  <th>{yearKeys[2]}</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {rightRoster?.map(player => (
                  <tr key={player.ratings?.rID}>
                    <td>{player.name}</td>
                    <td>{numberToMillionString(player.contract?.years[yearKeys[0]]?.amount ?? 0)}</td>
                    <td>{numberToMillionString(player.contract?.years[yearKeys[1]]?.amount ?? 0)}</td>
                    <td>{numberToMillionString(player.contract?.years[yearKeys[2]]?.amount ?? 0)}</td>
                    <td>
                      <input 
                        type="checkbox" 
                        onChange={e => handleRightCheckboxChange(player, e.target.checked)} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button onClick={handleTrade}>Confirm Trade</button>
      </div>
    );
    
  
            }

export default Trade;

const numberToMillionString = (num: number): string => {
  // if (num < 1000000) {
  //   // If the number is less than a million, format it normally with a dollar sign
  //   return `$${num.toLocaleString('en-US')}`;
  // } else {
    if (isNaN(num)) {
      return '$0';
    }
    // If the number is a million or more, divide by a million and keep one decimal place
    return `$${(num / 1000000).toFixed(1)}M`;
  // }
};
