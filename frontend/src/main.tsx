import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { mockDb } from './services/mockDb.ts'

// Initialize the database synchronization cache before mounting the React app
mockDb.init().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error("Failed to initialize database sync cache:", error);
  // Still mount App so page doesn't remain blank on connection errors
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
