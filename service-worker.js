const CACHE_NAME = "mi-pwa-cache-v1";

// Ajusta este array con tus archivos reales en el deploy
const APP_SHELL = [
  "/",
  "/index.html",
  "/app.js",
  "/style.css", // si tu CSS se llama diferente, cámbialo aquí
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Instalación: cachear los archivos estáticos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        APP_SHELL.map(url =>
          cache.add(url).catch(err => console.warn("No se pudo cachear:", url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activación: limpiar caches antiguos si los hubiera
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: responder con cache primero, luego red desde API
self.addEventListener("fetch", event => {
  const request = event.request;

  // Puedes cachear solo tu API o todo lo que quieras
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Para archivos estáticos
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
