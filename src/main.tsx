import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes';
import App from './App.tsx'
import { loadGA } from './ga';
import { AppInitializer } from './AppInitializer.tsx';

console.log(`ThisWeek App v${__APP_VERSION__}`);

// Load GA only in production and if ID is provided
if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
  console.log("loading GA...");
  loadGA(import.meta.env.VITE_GA_ID);
} else {
  console.log("not in production or invalid GA id");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppInitializer>
        <App />
      </AppInitializer>
    </ThemeProvider>
  </StrictMode>,
)
