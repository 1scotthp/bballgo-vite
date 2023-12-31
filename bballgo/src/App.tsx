import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { loadData } from './utils/loadData'
import { db } from "./db";
import { TeamsProvider } from './TeamsProvider'
import TeamInfoPage from './pages/TeamInfoPage'


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
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <TeamInfoPage/>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </TeamsProvider>
  )
}

export default App
