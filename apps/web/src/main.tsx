import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.tsx';
import './index.css';

// Empty locally: Vite proxies /api to the local API. In production, Render injects
// VITE_API_URL at build time (for example https://mahathi-api.onrender.com).
axios.defaults.baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
