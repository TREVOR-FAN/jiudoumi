// 九豆米 — Service Worker for offline PWA
const CACHE = 'jiudoumi-v1'
const ASSETS = [
  '/preview.html',
  '/images/logo.png',
  '/images/logo.jpg',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/apple-touch-icon.png'
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  }))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Don't cache API proxy requests — they must be live
  if (e.request.url.includes('/api/stream')) return

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok && res.type === 'basic') {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }))
  )
})
