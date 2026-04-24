import { Link, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import Dashboard from './Components/Dashboard'

function App() {
  return (
    <main className="app-shell">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/Dashboard">Dashboard</Link>
        <Link to="/page2">Page 2</Link>
      </nav>

      <Routes>
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </main>
  )
}

export default App


