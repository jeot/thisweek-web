import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes';
import { loadGA } from '@/ga';
import { AppInitializer } from '@/AppInitializer.tsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NotFoundPage } from '@/NotFoundPage.tsx'
import { AppPage } from '@/AppPage'

console.log(`* ThisWeek App v${__APP_VERSION__}`);

// Load GA only in production and if ID is provided
if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
  console.log("loading GA...");
  loadGA(import.meta.env.VITE_GA_ID);
} else {
  console.log("not in production or invalid GA id");
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);

        // Check for updates periodically
        registration.update();

        // Optional: Check for updates on visibility change
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            registration.update();
          }
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppInitializer>
        <BrowserRouter basename="/">
          <Routes>
            {/* Redirect / to /app for now */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            {/* use this when your landing page gets ready: */}
            {/* <Route path="/" element={<LandingPage />} /> */}

            {/* Your main app route */}
            <Route path="/app/*" element={<AppPage />} />

            {/* Not found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </ThemeProvider>
  </StrictMode>,
)
