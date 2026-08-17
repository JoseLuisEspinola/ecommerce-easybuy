const API_BASE = "https://node-js-final-2026.vercel.app";

// Verificar si el usuario es admin
function verificarAdmin() {
    const raw = localStorage.getItem("usuarioLogueado");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function showMessage(msg, err = false) {
    const el = document.getElementById("admin-messages");
    if (!el) return;
    el.textContent = msg;
    el.style.color = err ? "crimson" : "green";
}

// ====== FETCH ORDERS ======
async function fetchOrders() {
    const user = verificarAdmin();
    const tbody = document.querySelector("#tabla-orders tbody");
    tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

    const headers = {};
    if (user && user.token) headers["Authorization"] = `Bearer ${user.token}`;

    try {
        const res = await fetch(`${API_BASE}/api/orders/all`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const orders = await res.json();
        renderOrders(orders);
    } catch (e) {
        console.error("fetchOrders error:", e);
        showMessage("Error al obtener órdenes: " + e.message, true);
        tbody.innerHTML = "<tr><td colspan='6'>Fallo al cargar órdenes</td></tr>";
    }
}

// ====== RENDER TABLE ======
function renderOrders(orders) {
    const tbody = document.querySelector("#tabla-orders tbody");
    tbody.innerHTML = "";
    if (!Array.isArray(orders) || orders.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6'>No hay órdenes registradas.</td></tr>";
        return;
    }

    orders.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${o.id || "—"}</td>
      <td>${o.userId || "—"}</td>
      <td>${Array.isArray(o.items) ? o.items.map(i => `${i.name} (x${i.quantity})`).join(", ") : "—"}</td>
      <td>${o.totalAmount ?? "—"}</td>
      <td>${o.status || "—"}</td>
      <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
    `;
        tbody.appendChild(tr);
    });
}

// ====== FILTROS ======
function aplicarFiltros(orders) {
    const usuario = document.getElementById("filtro-usuario").value;
    const desde = document.getElementById("filtro-desde").value;
    const hasta = document.getElementById("filtro-hasta").value;
    const estado = document.getElementById("filtro-estado").value;
    const montoDesde = document.getElementById("filtro-monto-desde").value;
    const montoHasta = document.getElementById("filtro-monto-hasta").value;
    const producto = document.getElementById("filtro-producto").value;

    let filtradas = orders;

    if (usuario) filtradas = filtradas.filter(o => o.userId === usuario);
    if (desde) filtradas = filtradas.filter(o => new Date(o.createdAt) >= new Date(desde));
    if (hasta) filtradas = filtradas.filter(o => new Date(o.createdAt) <= new Date(hasta));
    if (estado) filtradas = filtradas.filter(o => o.status === estado);
    if (montoDesde) filtradas = filtradas.filter(o => o.totalAmount >= parseFloat(montoDesde));
    if (montoHasta) filtradas = filtradas.filter(o => o.totalAmount <= parseFloat(montoHasta));
    if (producto) filtradas = filtradas.filter(o => Array.isArray(o.items) && o.items.some(i => i.productId === producto));

    renderOrders(filtradas);
}

// ====== INICIALIZAR ======
function inicializarAdminOrders() {
    const user = verificarAdmin();
    if (!user) {
        alert("Acceso restringido. Debe iniciar sesión.");
        window.location.href = "login.html?origen=" + window.location.pathname;
        return;
    }
    if (user.rol !== "admin") {
        alert("Acceso denegado. Usuario no es admin.");
        window.location.href = "index.html";
        return;
    }

    // Botón refrescar
    document.getElementById("btn-refrescar").addEventListener("click", fetchOrders);

    // Botón filtros
    document.getElementById("btn-filtros").addEventListener("click", () => {
        const panel = document.getElementById("panel-filtros");
        panel.style.display = panel.style.display === "none" ? "flex" : "none";
    });

    // Escuchar cambios en filtros
    const filtros = document.querySelectorAll("#panel-filtros input, #panel-filtros select");
    filtros.forEach(f => f.addEventListener("change", async () => {
        const user = verificarAdmin();
        const headers = {};
        if (user && user.token) headers["Authorization"] = `Bearer ${user.token}`;
        try {
            const res = await fetch(`${API_BASE}/api/orders/all`, { headers });
            const orders = await res.json();
            aplicarFiltros(orders);
        } catch (e) {
            showMessage("Error al filtrar: " + e.message, true);
        }
    }));

    // Cargar inicial
    fetchOrders();
}

document.addEventListener("DOMContentLoaded", inicializarAdminOrders);
