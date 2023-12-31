import { ReactNode, createContext, useEffect, useState } from "react";
import { db } from "./db";
import { Team } from "./types/types";

export const TeamsContext = createContext<Team[]>([]);
type TeamsProviderProps = {
    children: ReactNode;
  };

export const TeamsProvider: React.FC<TeamsProviderProps> = ({ children }) => {
    const [teams, setTeams] = useState<Team[]>([]);
  
    useEffect(() => {
      const fetchTeams = async () => {
        const allTeams = await db.teams.toArray();
        setTeams(allTeams);
      };
  
      fetchTeams().catch(console.error);
    }, []);
  
    return (
      <TeamsContext.Provider value={teams}>
        {children}
      </TeamsContext.Provider>
    );
  };
  