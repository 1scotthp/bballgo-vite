import { useEffect, useState } from "react";
import "./App.css";
import { loadData } from "./utils/loadData";
// import { db } from "./db";
import { TeamsProvider } from "./TeamsProvider";
import TeamInfoPage from "./pages/TeamInfoPage";
import Standings from "./pages/Standings";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Playoffs from "./pages/Playoffs";
import Trade from "./pages/trade";
import RandomPlusMinus from "./pages/RandomPlusMinus";
import Game from "./pages/Game";
import { Team } from "./types/types";

function App() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadData().then((a) => setTeams(a));
  }, []);

  // useEffect(() => {
  //   if (dbReady) {
  //     db.teams.toArray().then(contracts => {
  //       console.log("Contracts loaded:", contracts);
  //     });
  //   }
  // }, [dbReady]);

  return (
    <TeamsProvider initialTeams={teams}>
      <Router>
        <div>
          <nav>
            <Link to="/">Home</Link> | <Link to="/win-loss">Standings</Link> |{" "}
            <Link to="/playoffs">Playoffs</Link> |{" "}
            <Link to="/trade">Trade</Link> | <Link to="/rpm">RPM</Link> |{" "}
            <Link to="/game">Games</Link>
            {/* Add more links for other routes */}
          </nav>
          <Routes>
            <Route path="/" element={<TeamInfoPage />} />
            <Route path="/win-loss" element={<Standings />} />
            <Route path="/playoffs" element={<Playoffs />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/rpm" element={<RandomPlusMinus />} />
            <Route path="/game" element={<Game />} />
            {/* Define more routes as needed */}
          </Routes>
        </div>
      </Router>
    </TeamsProvider>
  );
}

export default App;
