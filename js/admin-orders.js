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

    // Botón filtros
    document.getElementById("btn-filtros").addEventListener("click", () => {
        const panel = document.getElementById("panel-filtros");
        panel.style.display = panel.style.display === "none" ? "flex" : "none";
    });

    // Botón refrescar
    document.getElementById("btn-refrescar").addEventListener("click", fetchOrders);

    // Botón imprimir
    document.getElementById("btn-imprimir").addEventListener("click", () => {
        const tablaHTML = document.getElementById("tabla-orders").outerHTML;

        // Calcular la suma de la columna Total (índice 3)
        let sumaTotal = 0;
        const filas = document.querySelectorAll("#tabla-orders tbody tr");
        filas.forEach(fila => {
            const celdaTotal = fila.cells[3]; // La columna de 'Total'
            if (celdaTotal) {
                const valor = parseFloat(celdaTotal.textContent);
                if (!isNaN(valor)) {
                    sumaTotal += valor;
                }
            }
        });

        const ventana = window.open('', '', 'height=600,width=800');
        ventana.document.write('<html><head><title>Reporte de Órdenes</title>');
        ventana.document.write('<style>');
        // === AQUÍ PUEDES CONTROLAR LOS TAMAÑOS DE LETRA ===
        ventana.document.write('body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }'); // Tamaño de texto general
        ventana.document.write('h1 { text-align: center; color: #333; font-size: 24px; }'); // Tamaño del título principal
        ventana.document.write('p { font-size: 12px; color: #555; }'); // Tamaño del texto de los párrafos (ej. la fecha)
        ventana.document.write('table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }'); // Tamaño de la letra dentro de la tabla
        ventana.document.write('th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }');
        ventana.document.write('th { background-color: #f4f4f4; font-size: 13px; font-weight: bold; }'); // Tamaño de los encabezados de la tabla
        ventana.document.write('.total-general { text-align: right; font-size: 16px; margin-top: 20px; color: #333; }'); // Tamaño del total
        // ==================================================
        ventana.document.write('</style>');
        ventana.document.write('</head><body>');

        // Aquí defines exactamente qué quieres que aparezca en el papel
        ventana.document.write('<h1>Reporte de Órdenes - EasyBuy</h1>');
        ventana.document.write('<p>Fecha de emisión: ' + new Date().toLocaleDateString() + '</p>');
        ventana.document.write(tablaHTML);

        // Agregar el total sumado
        ventana.document.write('<h3 class="total-general">Total General: $' + sumaTotal.toFixed(2) + '</h3>');

        ventana.document.write('</body></html>');
        ventana.document.close();
        ventana.focus();

        setTimeout(() => {
            ventana.print();
            ventana.close();
        }, 250);
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
