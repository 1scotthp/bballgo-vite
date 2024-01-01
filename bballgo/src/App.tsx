import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { loadData } from './utils/loadData'
import { db } from "./db";
import { TeamsProvider } from './TeamsProvider'
import TeamInfoPage from './pages/TeamInfoPage'
import Standings from './pages/Standings'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Playoffs from './pages/Playoffs'


function App() {

  const [count, setCount] = useState(0)
  const [dbReady, setDbReady] = useState(false);


  useEffect(() => {
    loadData()
      .then(() => setDbReady(true))
      .catch((error) => {
        console.error("Error setting up the database:", error);
      });
  }, []);

  useEffect(() => {
    if (dbReady) {
      db.teams.toArray().then(contracts => {
        console.log("Contracts loaded:", contracts);
      });
    }
  }, [dbReady]);



  return (
    <TeamsProvider>
          <Router>
      <div>
        <nav>
          <Link to="/">Home</Link> | <Link to="/win-loss">Standings</Link> | <Link to="/playoffs">Playoffs</Link>  
          {/* Add more links for other routes */}
        </nav>
        <Routes>
          <Route path="/" element={<TeamInfoPage/>} />
          <Route path="/win-loss" element={ <Standings/>} />
          <Route path="/playoffs" element={ <Playoffs/>} />
          {/* Define more routes as needed */}
        </Routes>
      </div>
    </Router>
    </TeamsProvider>
  )
}

export default App
