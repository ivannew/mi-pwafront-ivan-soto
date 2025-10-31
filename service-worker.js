const CACHE_NAME = "mi-pwa-cache-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/app.js",
  "/style.css",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Si es llamada a la API
  if (url.origin === "https://mi-pwa-ivan-soto-kdyi.vercel.app") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(JSON.stringify([]), {
              headers: { "Content-Type": "application/json" }
            });
          })
        )
    );
    return;
  }

  // Para archivos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
