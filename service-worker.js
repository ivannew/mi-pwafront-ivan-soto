const CACHE_NAME = "mi-pwa-cache-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/app.js",
  "/style.css", // asegúrate que exista
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];


// Instalación: cachear los assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activación: tomar control
self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

// Interceptar requests
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Si es API
  if (url.origin === "https://mi-pwa-ivan-soto-kdyi.vercel.app") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cachear respuesta
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            // Si no hay cache, devuelve array vacío
            return new Response(JSON.stringify([]), {
              headers: { "Content-Type": "application/json" }
            });
          })
        )
    );
    return;
  }

  // Archivos estáticos
  event.respondWith(
    caches.match(event.request).then(cachedResponse => cachedResponse || fetch(event.request))
  );
});
