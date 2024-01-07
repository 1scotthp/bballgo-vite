import { Player } from "../types/types";

const FIRST_APRON = 168998000;
const TAX_LINE = 150267000;

type TradeInfo = {
    currentSalary: number;
    outgoingSalary: number;
    incomingSalary: number;
    isTaxTeam: boolean;
  };
  
  function isTradeLegal({ currentSalary, outgoingSalary, incomingSalary, isTaxTeam }: TradeInfo): boolean {
    let maxIncomingSalary = 0;
  
    if (currentSalary > FIRST_APRON) {
      // Teams above the apron are locked into the lowest level of salary matching
      maxIncomingSalary = outgoingSalary * 1.1; // 110 percent
    } else {
      // Below the apron
      if (outgoingSalary <= 7250000) {
        maxIncomingSalary = outgoingSalary * 2 + 250000; // 200 percent plus $250,000
      } else if (outgoingSalary <= 29000000) {
        maxIncomingSalary = outgoingSalary + 7500000; // Padded by a flat $7.5 million
      } else {
        maxIncomingSalary = outgoingSalary * 1.25 + 250000; // 125 percent plus $250,000
      }
    }
  
    // Check if the team is a tax team but the trade doesn't push them over the apron
    if (isTaxTeam && (incomingSalary + currentSalary <= FIRST_APRON)) {
      // Apply more dynamic formula for generating S-TPEs
      if (outgoingSalary <= 7250000) {
        maxIncomingSalary = Math.max(maxIncomingSalary, outgoingSalary * 2 + 250000);
      } else if (outgoingSalary <= 29000000) {
        maxIncomingSalary = Math.max(maxIncomingSalary, outgoingSalary + 7500000);
      } else {
        maxIncomingSalary = Math.max(maxIncomingSalary, outgoingSalary * 1.25 + 250000);
      }
    }
  
    return incomingSalary <= maxIncomingSalary;
  }

  function willTeamAcceptTrade(team1Trade: Player[], team2Trade: Player[]): boolean {
    let team1DPM = 0;
    let team2DPM = 0;
    team1Trade.forEach((player) => team1DPM += player.ratings?.ODPM)
    team2Trade.forEach((player) => team2DPM += player.ratings?.ODPM)
    return team2Trade >= team1Trade;
  }

  export function attemptTrade(team1: Player[], team1Trade: Player[], team2: Player[], team2Trade: Player[], year: string): string {
    let team1Salary = 0;
    team1?.forEach((player) => team1Salary += player.contract?.years[year]?.amount ?? 0)
    let team1Outgoing = 0;
    team1Trade?.forEach((player) => team1Outgoing += player.contract?.years[year]?.amount ?? 0)

    let team2Salary = 0;
    team2?.forEach((player) => team2Salary += player.contract?.years[year]?.amount ?? 0)
    let team2Outgoing = 0;
    team2Trade?.forEach((player) => team2Outgoing += player.contract?.years[year]?.amount ?? 0)

    // Calculate if Team 1's trade is legal
    const isTeam1TradeLegal = isTradeLegal({
        currentSalary: team1Salary,
        outgoingSalary: team1Outgoing,
        incomingSalary: team2Outgoing,
        isTaxTeam: team1Salary > TAX_LINE
    });

    // Calculate if Team 2's trade is legal
    const isTeam2TradeLegal = isTradeLegal({
        currentSalary: team2Salary,
        outgoingSalary: team2Outgoing,
        incomingSalary: team1Outgoing,
        isTaxTeam: team2Salary > TAX_LINE
    });

    console.log(isTeam1TradeLegal, isTeam2TradeLegal);
    // Return true only if both trades are legal
    if(!isTeam1TradeLegal || !isTeam2TradeLegal){
        return "ILLEGAL";
    }

    if(willTeamAcceptTrade(team1Trade, team2Trade)){
        return "ACCEPTED";
    }else {
        return "REJECTED";
    }

  };
  
  
   
  