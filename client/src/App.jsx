import { Link, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'

function Home() {
  useEffect(() => {
    fetch('http://127.0.0.1:3000/')
      .then(response => response.text())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error))
  }, [])

  return (
    <section>
      <h1>Simple React Router Demo</h1>
      <p>Use the links above to open Page 1 or Page 2.</p>
    </section>
  )
}

function Page1() {
  return (
    <section>
      <h1>Page 1</h1>
      <p>This is the React page at /page1.</p>
    </section>
  )
}

function Page2() {
  return (
    <section>
      <h1>Page 2</h1>
      <p>This is the React page at /page2.</p>
    </section>
  )
}

function NotFound() {
  return (
    <section>
      <h1>Not Found</h1>
      <p>This route does not exist.</p>
    </section>
  )
}

function App() {
  return (
    <main className="app-shell">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/page1">Page 1</Link>
        <Link to="/page2">Page 2</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="*" element={<NotFound />} />
      </Routes>·
    </main>
  )
}

export default App
