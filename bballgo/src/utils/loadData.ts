import { db } from "../db";
import { Player, PlayerRatings, Team } from "../types/types";
import csvtojson from 'csvtojson';


type ContractAmounts = { [year: string]: number };

// Define the Contract type as per your database schema
type ContractYearDetail = {
    amount: number;
    clubOption?: boolean;
    playerOption?: boolean;
  };
  
 export type Contract = {
    team: string;
    name: string;
    age: number;
    years: { [year: string]: ContractYearDetail };
    guaranteed: number | string;
  };

// Provided code with adaptations
class PlayerContract {
    // Adapt the class to align with the database schema
    team: string;
    name: string;
    age: number;
    years: { [year: string]: ContractYearDetail };
  
    constructor(team: string, name: string, age: number, contracts: { [year: string]: number }) {
      this.team = team;
      this.name = name;
      this.age = age;
      this.years = {};
  
      for (const year in contracts) {
        // Convert string amounts to ContractYearDetail
        this.years[year] = { amount: contracts[year] };
      }
    }
  }

function extractYearHeaders(line: string): string[] {
    const parts = line.split(',');
    return parts.slice(4, parts.length - 1).map(part => part.trim());
}

function convertMoneyStringToNumber(moneyString: string): number {
    // Remove dollar sign and commas, then convert to number
    return Number(moneyString.replace(/[$,]/g, ''));
  }

function parseCsvLine(line: string): string[] {
    // Regular expression to correctly split a CSV line
    const regex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
    return line.split(regex).map(field => field.replace(/(^\"|\"$)/g, '').trim());
  }
  
  function parseContractLine(line: string, yearHeaders: string[]): PlayerContract {
    const parts = parseCsvLine(line);
    const team = parts[1];
    const player = parts[2];
    const age = parseInt(parts[3]);
    let contracts: ContractAmounts = {};
  
    yearHeaders.forEach((year, index) => {
      contracts[year] = convertMoneyStringToNumber(parts[index + 4]);
    });
  
    return new PlayerContract(team, player, age, contracts);
  }

async function parseInputData(inputData: string): Promise<PlayerContract[]> {
    const lines = inputData.trim().split('\n');
    console.log(lines)
    let yearHeaders: string[] = [];
    let contracts: PlayerContract[] = [];

    for (const line of lines) {
        if (line.startsWith(",Team")) {
            yearHeaders = extractYearHeaders(line);
        } else if (line && !line.startsWith(",Atlanta Hawks,Salary")) {
            const contract = parseContractLine(line, yearHeaders);
            contracts.push(contract);
        }
    }
    return contracts
}


export const loadContractData = async () => {
    const response = await fetch("../data/NBA_Contracts_Player.csv");
    const csvData = await response.text();
    const contracts = await parseInputData(csvData);  // Parse the data
    const contractsMap = contracts.reduce((map, contract) => {
        map[contract.name] = {
          name: contract.name,
          team: contract.team,
          age: contract.age,
          years: contract.years,
          guaranteed: ''  // Logic to calculate or assign 'guaranteed' value
        };
        return map;
      }, {} as { [playerName: string]: Contract });
    
      return contractsMap;

  
    // await db.contracts.bulkPut(formattedContracts);  // Store in the database
  };

const loadPlayerData = async (contractDict: any) => {
    // Dictionary to hold teams and their players
    const teams: { [abbr: string]: Team } = {};
    
    const response = await fetch("../data/NBA_Player_Data_22_23.csv")
    const csvText = await response.text();
    const rawData = await csvtojson().fromString(csvText);

  
    rawData.forEach((item: any) => {
      const ratings: PlayerRatings = {
        name: item.player_name,
        id: parseInt(item.nba_id),
        usageRate: parseFloat(item["USG%"]),
        threePointAttemptRate: parseFloat(item["FG3A/100"]) / 100,
        twoPointAttemptRate:
          (parseFloat(item["FGA/100"]) - parseFloat(item["FG3A/100"])) / 100,
        freeThrowRate: parseFloat(item["FTARate%"]),
        twoPointPercentage: parseFloat(item["FG2%"]),
        freeThrowPercentage: parseFloat(item["FT%"]),
        threePointPercentage: parseFloat(item["FG3%"]),
        turnoverRate: parseFloat(item["TOV/100"]) / 100,
        foulRate: parseFloat(item["Fouls/Min"]),
        playerHeight: parseInt(item.height),
        offensiveReboundRate: parseFloat(item["REB/100"]),
        defensiveReboundRate: parseFloat(item["REB/100"]) / 3,
        assistRate: parseFloat(item["AST/100"]),
        age: parseInt(item.AGE),
        team: item["TEAM_ABBREVIATION"],
      };
      let player: Player = {
        id: parseInt(item.nba_id),
        name: item.player_name,
        team: item["TEAM_ABBREVIATION"],
        ratings: ratings,
        contract: contractDict[item.player_name],
        realGames: [],
        gameByGameStats: [],
      }
        const teamAbbr = item["TEAM_ABBREVIATION"];
        if (!teams[teamAbbr]) {
          teams[teamAbbr] = { teamAbbreviation: teamAbbr, roster: [], stats: {
            totalPoints: 0,
            totalOppPoints: 0,
            wins: 0,
            losses: 0,
            margin: 0
          } };
        }
        teams[teamAbbr].roster.push(player);
        
    });
    
    const teamValues = Object.values(teams);
    await db.teams.bulkPut(teamValues);

}

export const loadData = async () => {
    const contractDict = await loadContractData();
    await loadPlayerData(contractDict)

}

