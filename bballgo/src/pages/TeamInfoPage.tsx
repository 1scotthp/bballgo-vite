import React, { useContext, useState } from 'react';
import { TeamsContext } from '../TeamsProvider';


const TeamInfoPage = () => {
  const {teams, userTeam} = useContext(TeamsContext);
  const [selectedTeamAbbr, setSelectedTeamAbbr] = useState(userTeam);

  const handleTeamSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeamAbbr(e.target.value);
  };

  const selectedTeam = teams.find(team => team.teamAbbreviation === selectedTeamAbbr);

  return (
<div style={{ maxWidth: '800px', margin: 'auto' }}>
  <h1>Team Information</h1>
  <select onChange={handleTeamSelection} value={selectedTeamAbbr} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
    <option value="">Select a Team</option>
    {teams.map(team => (
      <option key={team.teamAbbreviation} value={team.teamAbbreviation}>
        {team.teamAbbreviation}
      </option>
    ))}
  </select>
  <p>All stats per 36 mins</p>

  {selectedTeam && (
  <div>
    <h2>{selectedTeam.teamAbbreviation}</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
  <tr>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Name</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Mins/game</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Pts/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Reb/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Ast/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Stl/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Blk/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>TO/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>Fouls/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>2PTA/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>2PTM/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>3PTA/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>3PTM/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>FTA/36</th>
    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#82f2f2' }}>FTM/36</th>
  </tr>
</thead>

      <tbody>
  {selectedTeam.roster.sort((a, b) => b.stats.mins - a.stats.mins).map(player => {
    const per36Multiplier = player.stats.mins ? 36 / player.stats.mins : 0;

    return (
      <tr key={player.id}>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.name}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.mins / 87).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.points * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{((player.stats.offReb + player.stats.defReb) * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.assists * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.steals * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.blocks * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.turnovers * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.fouls * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.twoPointShotsTaken * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.twoPointShotsMade * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.threePointShotsTaken * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.threePointShotsMade * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.freeThrowsTaken * per36Multiplier).toFixed(1)}</td>
        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{(player.stats.freeThrowsMade * per36Multiplier).toFixed(1)}</td>
      </tr>
    );
  })}
</tbody>

    </table>
  </div>
)}

</div>

  );
};

export default TeamInfoPage;
