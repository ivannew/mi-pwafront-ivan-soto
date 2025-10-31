// service-worker.js
const CACHE_NAME = "pwa-cache-v1";
const APP_SHELL = [
  "/",           // index.html
  "/app.js",     // tu app.js
  "/style.css",  // si tienes CSS
  "/favicon.ico" // si tienes ícono
];

// Instalar service worker y cachear archivos
self.addEventListener("install", event => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

// Activar service worker
self.addEventListener("activate", event => {
  console.log("Service Worker activado");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME)
      .map(key => caches.delete(key)))
    )
  );
});

// Interceptar fetch
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Guardar en cache la nueva respuesta
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Si falla y no hay cache, devolver array vacío para la API
          if (event.request.url.includes("/api/actividades")) {
            return new Response(JSON.stringify([]), {
              headers: { "Content-Type": "application/json" }
            });
          }
        });
    })
  );
});
