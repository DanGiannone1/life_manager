import { useEffect } from 'react'
import './styles/globals.css'

function App() {
  useEffect(() => {
    // Set up theme based on user preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-heading font-bold text-center py-8">
        Life Manager
      </h1>
      <div className="container mx-auto px-4">
        <p className="text-center">
          Welcome to Life Manager - Your personal task and goal management system
        </p>
      </div>
    </div>
  )
}

export default App
