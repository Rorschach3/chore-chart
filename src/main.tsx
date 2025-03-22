import React from 'react'
import App from './App.tsx'
import ReactDOM from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
        <Analytics />
    </React.StrictMode>
);
