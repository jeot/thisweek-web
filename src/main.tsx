import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes';
import { loadGA } from '@/ga';
import { AppInitializer } from '@/AppInitializer.tsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NotFoundPage } from '@/NotFoundPage.tsx'
import { AppPage } from '@/AppPage'
import { UpdatePasswordForm } from './components/update-password-form';

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

        // Check for updates immediately
        registration.update();

        // Listen for new service worker waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available! Refresh to update.');
                // Optional: Show a notification to the user
                // You could dispatch an event or update a store to show a "Update available" banner
              }
            });
          }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Check for updates on visibility change
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

  // Listen for service worker controller change (when new SW takes over)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service worker updated, reloading page...');
    window.location.reload();
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

            <Route path="/update-password" element={<div className='w-md m-auto p-3 justify-center'><UpdatePasswordForm /></div>} />

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
