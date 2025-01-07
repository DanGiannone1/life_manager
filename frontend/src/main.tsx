import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store'
import App from './App'
import '@/styles/globals.css'

// Set up theme based on user preference
//const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isDarkMode = false;
document.documentElement.classList.toggle("dark", isDarkMode);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
