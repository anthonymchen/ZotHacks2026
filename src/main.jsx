
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import * as sessions from "./lib/sessions";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
window.sessions = sessions;


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)