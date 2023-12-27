import React, { useEffect } from 'react'
import './App.css'

function App() {
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/stream3')
    eventSource.onmessage = ({ data }) => {
      console.log(data)
    }
  }, [])

  return <div className='App'>Hello</div>
}

export default App
