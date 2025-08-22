// /public/service-worker.js

// Install event (required for PWA)
self.addEventListener("install", (event) => {
  console.log("Service Worker installed (minimal, non-blocking)");
  self.skipWaiting(); // activates immediately
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  self.clients.claim(); // takes control of all pages immediately
});

// Do NOT intercept fetch events
// This way, all network requests go directly to the server

