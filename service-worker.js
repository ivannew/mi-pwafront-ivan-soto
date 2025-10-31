const CACHE_NAME = "pwa-cache-v2";
const API_URL = "http://localhost:3000/api/actividades";

// Archivos esenciales que queremos guardar para modo offline
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js"
];

// Instalar y cachear archivos base
self.addEventListener("install", event => {
  console.log("🟢 Service Worker instalado");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activar y limpiar versiones viejas del caché
self.addEventListener("activate", event => {
  console.log("⚙️ Activando nuevo Service Worker...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Interceptar peticiones
self.addEventListener("fetch", event => {
  if (event.request.url === API_URL) {
    // Si es la API, intentamos red de primero y cache de respaldo
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          console.warn("📦 Cargando datos desde caché");
          return caches.match(event.request);
        })
    );
  } else {
    // Para los demás archivos (HTML, CSS, JS)
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
