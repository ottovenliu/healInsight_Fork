import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { runStorageMigrations } from './utils/storageMigration.ts'

// Initialize localStorage schema version and execute migrations before React tree mounts
runStorageMigrations();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
