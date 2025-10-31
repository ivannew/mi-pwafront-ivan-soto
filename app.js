// URL completa de tu API
const API_URL = "https://mi-pwa-ivan-soto-nj7fs6fpd-ivannews-projects.vercel.app/api/actividades";


const contenido = document.getElementById("contenido");
const statusEl = document.getElementById("status");

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
  } catch (err) {
    console.error("❌ Error:", err);
    contenido.innerHTML = "⚠️ No se pudieron cargar los datos.";
  }
}

// Estado de conexión
window.addEventListener("online", () => {
  statusEl.classList.add("hidden");
  obtenerDatos();
});

window.addEventListener("offline", () => {
  statusEl.classList.remove("hidden");
});

// Registrar el service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

document.addEventListener("DOMContentLoaded", obtenerDatos);
