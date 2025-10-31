// app.js
const API_URL = "https://mi-pwa-ivan-soto-kdyi.vercel.app/api/actividades"; // URL de tu API remota

const contenido = document.getElementById("contenido");
const statusEl = document.getElementById("status");

// Función para obtener datos de la API
async function obtenerDatos() {
  try {
    console.log("📡 Consultando API:", API_URL);
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error en la API: ${response.status}`);

    const data = await response.json();
    console.log("✅ Datos recibidos:", data);

    contenido.innerHTML = data
      .map(item => `
        <div class="card">
          <h3>${item.nombre}</h3>
          <p><b>Categoría:</b> ${item.categoria}</p>
          <p><b>Nivel:</b> ${item.nivel}</p>
        </div>
      `)
      .join('');

    // Guardar en cache para offline
    if ("caches" in window) {
      caches.open("actividades-cache").then(cache => {
        cache.put(API_URL, new Response(JSON.stringify(data)));
      });
    }

  } catch (err) {
    console.error("❌ Error:", err);

    // Intentar mostrar datos desde cache si hay error
    if ("caches" in window) {
      const cacheResponse = await caches.match(API_URL);
      if (cacheResponse) {
        const data = await cacheResponse.json();
        contenido.innerHTML = data
          .map(item => `
            <div class="card">
              <h3>${item.nombre}</h3>
              <p><b>Categoría:</b> ${item.categoria}</p>
              <p><b>Nivel:</b> ${item.nivel}</p>
            </div>
          `)
          .join('');
        return;
      }
    }

    contenido.innerHTML = "⚠️ No se pudieron cargar los datos.";
  }
}

// Detectar conexión online/offline
window.addEventListener("online", () => {
  statusEl.classList.add("hidden");
  obtenerDatos();
});

window.addEventListener("offline", () => {
  statusEl.classList.remove("hidden");
});

// Registrar el service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(reg => console.log("Service Worker registrado:", reg.scope))
    .catch(err => console.error("Error registrando Service Worker:", err));
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", obtenerDatos);
