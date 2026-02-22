import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/700.css'
import './app.css'

createRoot(document.getElementById('app')!).render(<StrictMode><App /></StrictMode>)
