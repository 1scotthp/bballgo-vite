import React, { useContext, useEffect, useState } from 'react';
import { TeamsContext } from '../TeamsProvider';
import { simulateGame } from '../utils/simulateGame';
import { runSeason } from '../utils/simulateSeason';



const TeamInfoPage = () => {
  const {teams, updateBoxScores, boxScores} = useContext(TeamsContext);
  const [selectedTeamAbbr, setSelectedTeamAbbr] = useState('');

  const handleTeamSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeamAbbr(e.target.value);
  };

  const selectedTeam = teams.find(team => team.teamAbbreviation === selectedTeamAbbr);




  return (
    <div>
      <h1>Team Information</h1>
      <select onChange={handleTeamSelection} value={selectedTeamAbbr}>
        <option value="">Select a Team</option>
        {teams.map(team => (
          <option key={team.teamAbbreviation} value={team.teamAbbreviation}>
            {team.teamAbbreviation}
          </option>
        ))}
      </select>

      {selectedTeam && (
        <div>
          <h2>{selectedTeam.teamAbbreviation}</h2>
          {/* Display more details about the selected team here */}
          <ul>
            {selectedTeam.roster.map(player => (
              <li key={player.id}>{player.name} - {player.ratings.usageRate} (Usage Rate)</li>
              // Add more player details as needed
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamInfoPage;
