const API_BASE = "https://node-js-final-2026.vercel.app";

// Control de acceso: solo admin
function verificarAdmin() {
    const raw = localStorage.getItem('usuarioLogueado');
    if (!raw) return null;
    try {
        const u = JSON.parse(raw);
        return u;
    } catch (e) {
        return null;
    }
}

function showMessage(msg, err = false) {
    const el = document.getElementById('admin-messages');
    el.textContent = msg;
    el.style.color = err ? 'crimson' : 'green';
}

async function fetchProductos() {
    const user = verificarAdmin();
    const tbody = document.querySelector('#tabla-productos tbody');
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

    const headers = {};
    if (user && user.token) headers['Authorization'] = `Bearer ${user.token}`;

    try {
        const res = await fetch(`${API_BASE}/api/products`, { headers });
        if (!res.ok) {
            // intentar leer mensaje de error del body
            let txt = await res.text().catch(() => null);
            const msg = txt || `Error ${res.status}`;
            throw new Error(msg);
        }
        const productos = await res.json();
        renderProductos(productos);
        setAdminMode(true);
    } catch (e) {
        console.error('fetchProductos error:', e);
        let displayMsg = e && e.message ? e.message : 'Error al obtener productos';
        try {
            const parsed = JSON.parse(displayMsg);
            if (parsed && parsed.message) displayMsg = parsed.message;
        } catch (err) { }

        // Si hay usuario admin, NO hacer fallback automático: pedir re-login
        if (user && user.rol === 'admin' && (String(displayMsg).toLowerCase().includes('token') || String(displayMsg).includes('401') || String(displayMsg).toLowerCase().includes('invalid'))) {
            showMessage('Token inválido o expirado. Por favor, vuelva a iniciar sesión como admin.');
            renderReloginButton();
            tbody.innerHTML = `<tr><td colspan=6>Acceso restringido: token inválido. Reingrese sus credenciales.</td></tr>`;
            setAdminMode(false);
            return;
        }

        // Para invitados u otros errores, intentar vista pública
        if (String(displayMsg).toLowerCase().includes('token') || String(displayMsg).includes('401')) {
            showMessage('Token inválido o expirado. Mostrando productos públicos.', true);
            await fetchPublicProductos();
            return;
        }

        tbody.innerHTML = `<tr><td colspan=6>Fallo al cargar productos: ${displayMsg}</td></tr>`;
    }
}

function renderReloginButton() {
    const el = document.getElementById('admin-messages');
    el.innerHTML = '';
    const btn = document.createElement('button');
    btn.textContent = 'Re-iniciar sesión (Admin)';
    btn.className = 'btn';
    btn.addEventListener('click', () => {
        localStorage.removeItem('usuarioLogueado');
        // redirigir a login con origen actual
        window.location.href = 'login.html?origen=' + window.location.pathname;
    });
    el.appendChild(btn);
}

function renderProductos(productos) {
    const tbody = document.querySelector('#tabla-productos tbody');
    tbody.innerHTML = '';
    if (!Array.isArray(productos) || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay productos.</td></tr>';
        return;
    }

    productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id || p._id || p.idProducto || ''}</td>
            <td>${p.name || p.nombre || ''}</td>
            <td>${(p.unitPrice ?? p.price ?? p.precio) ? '$' + (Number(p.unitPrice ?? p.price ?? p.precio).toFixed(2)) : '—'}</td>
            <td>${p.stock ?? p.cantidad ?? 0}</td>
            <td><img src="${p.image || p.imagen || ''}" alt="" style="height:40px;"></td>
            <td>${p.activo === true ? 'Sí' : 'No'}</td>
            <td class="acciones-cell"></td>
        `;

        const accionesCell = tr.querySelector('.acciones-cell');
        // Solo añadir botones si el CRUD está habilitado
        const crudEnabled = !document.getElementById('btn-nuevo') || !document.getElementById('btn-nuevo').disabled;
        if (crudEnabled) {
            const btnEditar = document.createElement('button');
            btnEditar.className = 'btn-editar';
            btnEditar.textContent = 'Editar';
            btnEditar.addEventListener('click', () => cargarFormularioParaEditar(p));

            const btnBorrar = document.createElement('button');
            btnBorrar.className = 'btn-borrar';
            btnBorrar.textContent = 'Borrar';
            btnBorrar.addEventListener('click', () => borrarProducto(p));

            accionesCell.appendChild(btnEditar);
            accionesCell.appendChild(btnBorrar);
        } else {
            accionesCell.textContent = 'Vista pública';
        }

        tbody.appendChild(tr);
    });
}

function setAdminMode(enabled) {
    const btnNuevo = document.getElementById('btn-nuevo');
    const btnRefrescar = document.getElementById('btn-refrescar');
    const formContainer = document.getElementById('form-container');
    if (btnNuevo) btnNuevo.disabled = !enabled;
    if (btnRefrescar) btnRefrescar.disabled = false; // siempre permitir refrescar
    if (!enabled && formContainer) formContainer.style.display = 'none';
}

async function fetchPublicProductos() {
    const tbody = document.querySelector('#tabla-productos tbody');
    tbody.innerHTML = '<tr><td colspan="6">Cargando (vista pública)...</td></tr>';
    try {
        const res = await fetch(`${API_BASE}/api/pub/products`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const productos = await res.json();
        setAdminMode(false);
        renderProductos(productos);
        showMessage('Mostrando productos en modo público. Inicie sesión como admin para editar.', true);
    } catch (e) {
        console.error('fetchPublicProductos error:', e);
        tbody.innerHTML = `<tr><td colspan=6>Fallo al cargar productos públicos: ${e.message}</td></tr>`;
    }
}

function cargarFormularioParaEditar(p) {
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('producto-id').value = p.id || p._id || p.idProducto || '';
    document.getElementById('producto-nombre').value = p.name || p.nombre || '';
    document.getElementById('producto-descripcion').value = p.description || p.descripcion || '';
    document.getElementById('producto-precio').value = p.unitPrice ?? p.price ?? p.precio ?? 0;
    document.getElementById('producto-stock').value = p.stock ?? p.cantidad ?? 0;
    document.getElementById('producto-imagen').value = p.image || p.imagen || '';
}

function limpiarFormulario() {
    document.getElementById('producto-id').value = '';
    document.getElementById('producto-nombre').value = '';
    document.getElementById('producto-descripcion').value = '';
    document.getElementById('producto-precio').value = '';
    document.getElementById('producto-stock').value = '';
    document.getElementById('producto-imagen').value = '';
}

async function guardarProducto(e) {
    e.preventDefault();
    const user = verificarAdmin();
    if (!user || !user.token) {
        alert('No autorizado');
        return;
    }

    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('producto-nombre').value.trim();
    const descripcion = document.getElementById('producto-descripcion').value.trim();
    const precio = Number(document.getElementById('producto-precio').value);
    const stock = Number(document.getElementById('producto-stock').value) || 0;
    const imagen = document.getElementById('producto-imagen').value.trim();

    // Validaciones básicas antes de enviar
    if (!nombre) {
        showMessage('El nombre es obligatorio', true);
        return;
    }
    if (!descripcion) {
        showMessage('La descripción es obligatoria', true);
        return;
    }
    if (isNaN(precio) || precio <= 0) {
        showMessage('El precio debe ser un número mayor a 0', true);
        return;
    }
    if (isNaN(stock) || stock <= 0) {
        showMessage('El stock debe ser un número mayor a 0', true);
        return;
    }

    const finalImageUrl = imagen || 'https://via.placeholder.com/300x300?text=Producto+sin+imagen';
    const payload = {
        name: nombre,
        description: descripcion,
        price: precio,
        stock,
        imageUrl: finalImageUrl
    };

    try {
        let res;
        if (id) {
            // actualizar
            res = await fetch(`${API_BASE}/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
        } else {
            // crear
            res = await fetch(`${API_BASE}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) {
            // intentar leer body y mostrarlo
            let bodyText = await res.text().catch(() => null);
            try {
                const parsed = JSON.parse(bodyText);
                bodyText = parsed.message || JSON.stringify(parsed);
            } catch (e) { }
            console.error('Producto create/update failed', res.status, bodyText);
            const errMsg = bodyText || `Error ${res.status}`;
            throw new Error(errMsg);
        }

        showMessage('Operación realizada con éxito');
        limpiarFormulario();
        document.getElementById('form-container').style.display = 'none';
        fetchProductos();
    } catch (err) {
        showMessage('Error: ' + err.message, true);
        console.error('guardarProducto error', err);
    }
}

async function borrarProducto(p) {
    if (!confirm('¿Eliminar el producto "' + (p.name || p.nombre || '') + '"?')) return;
    const user = verificarAdmin();
    if (!user || !user.token) {
        alert('No autorizado');
        return;
    }

    const id = p.id || p._id || p.idProducto;
    try {
        const res = await fetch(`${API_BASE}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Error ${res.status}`);
        }
        showMessage('Producto eliminado');
        fetchProductos();
    } catch (e) {
        showMessage('Error al eliminar: ' + e.message, true);
    }
}

function inicializarAdmin() {
    const user = verificarAdmin();
    if (!user) {
        alert('Acceso restringido. Debe iniciar sesión.');
        window.location.href = 'login.html?origen=' + window.location.pathname;
        return;
    }
    if (user.rol !== 'admin') {
        alert('Acceso denegado. Usuario no es admin.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('btn-nuevo').addEventListener('click', () => {
        limpiarFormulario();
        document.getElementById('form-container').style.display = 'block';
    });

    document.getElementById('btn-refrescar').addEventListener('click', fetchProductos);
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        limpiarFormulario();
        document.getElementById('form-container').style.display = 'none';
    });

    document.getElementById('form-producto').addEventListener('submit', guardarProducto);

    fetchProductos();
}

document.addEventListener('DOMContentLoaded', inicializarAdmin);
