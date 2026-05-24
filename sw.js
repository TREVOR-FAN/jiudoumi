// 九豆米 — Service Worker for offline PWA
const CACHE = 'jiudoumi-v3'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  }))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Never cache HTML — must always get latest version
  // Never intercept API or audio requests
  const url = new URL(e.request.url)
  if (url.pathname === '/' || url.pathname.endsWith('.html') ||
      url.pathname.startsWith('/api/') || url.pathname.startsWith('/audio/')) {
    return
  }
  // Cache static assets (images, CSS, JS) network-first
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && res.type === 'basic') {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }).catch(() => caches.match(e.request))
  )
})
