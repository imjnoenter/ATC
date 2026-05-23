self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
// Minimal fetch handler — required for Chrome PWA installability criteria
self.addEventListener('fetch', () => {})
