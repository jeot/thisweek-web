// Minimal SW just to enable PWA install
self.addEventListener("install", () => {
  console.log("Service Worker installed");
});

self.addEventListener("fetch", (event) => {
  // Empty fetch handler required for installability
});

