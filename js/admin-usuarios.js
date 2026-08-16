const API_BASE = "https://node-js-final-2026.vercel.app";

// Verificar si el usuario es admin
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
    if (!el) return;
    el.textContent = msg;
    el.style.color = err ? 'crimson' : 'green';
}

async function fetchUsuarios() {
    const user = verificarAdmin();
    const tbody = document.querySelector('#tabla-usuarios tbody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    const headers = {};
    if (user && user.token) headers['Authorization'] = `Bearer ${user.token}`;

    try {
        const res = await fetch(`${API_BASE}/api/users`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const usuarios = await res.json();
        renderUsuarios(usuarios);
    } catch (e) {
        console.error('fetchUsuarios error:', e);
        showMessage('Error al obtener usuarios: ' + e.message, true);
        tbody.innerHTML = `<tr><td colspan="4">Fallo al cargar usuarios</td></tr>`;
    }
}

function renderUsuarios(usuarios) {
    const tbody = document.querySelector('#tabla-usuarios tbody');
    tbody.innerHTML = '';
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
        return;
    }

    usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.name || 'Sin nombre'}</td>
            <td>${u.email || 'Sin email'}</td>
            <td>${u.rol || 'Sin rol'}</td>
            <td>${u.activo === true ? "Si" : "No"}</td>
            <td class="acciones-cell"></td>
        `;

        const accionesCell = tr.querySelector('.acciones-cell');
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar';
        btnEditar.textContent = 'Editar';
        btnEditar.addEventListener('click', () => cargarFormularioParaEditarUsuario(u));

        const btnBorrar = document.createElement('button');
        btnBorrar.className = 'btn-borrar';
        btnBorrar.textContent = 'Eliminar';
        btnBorrar.addEventListener('click', () => borrarUsuario(u));

        accionesCell.appendChild(btnEditar);
        accionesCell.appendChild(btnBorrar);

        tbody.appendChild(tr);
    });
}

function cargarFormularioParaEditarUsuario(u) {
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('usuario-id').value = u.id || '';
    document.getElementById('usuario-nombre').value = u.name || '';
    document.getElementById('usuario-email').value = u.email || '';
    document.getElementById('usuario-rol').value = u.rol || 'cliente';
    document.getElementById('usuario-activo').checked = u.activo === true;
    document.getElementById('usuario-notas').value = u.notasCliente || '';
    document.getElementById('usuario-password').value = ''; // vacío por seguridad
}

function limpiarFormularioUsuario() {
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-nombre').value = '';
    document.getElementById('usuario-email').value = '';
    document.getElementById('usuario-rol').value = 'cliente';
    document.getElementById('usuario-activo').checked = false;
    document.getElementById('usuario-notas').value = '';
    document.getElementById('usuario-password').value = '';
}

async function guardarUsuario(e) {
    e.preventDefault();
    const user = verificarAdmin();
    if (!user || !user.token) {
        alert('No autorizado');
        return;
    }

    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('usuario-nombre').value.trim();
    const email = document.getElementById('usuario-email').value.trim();
    const rol = document.getElementById('usuario-rol').value;
    const activo = document.getElementById('usuario-activo').checked;
    const notasCliente = document.getElementById('usuario-notas').value.trim();
    const password = document.getElementById('usuario-password').value.trim();

    const payload = { name: nombre, email, rol, activo, notasCliente };
    if (password) payload.password = password;

    try {
        let res;
        if (id) {
            res = await fetch(`${API_BASE}/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) throw new Error(`Error ${res.status}`);
        showMessage('Operación realizada con éxito');
        limpiarFormularioUsuario();
        document.getElementById('form-container').style.display = 'none';
        fetchUsuarios();
    } catch (err) {
        showMessage('Error: ' + err.message, true);
    }
}

async function borrarUsuario(u) {
    if (!confirm(`¿Eliminar el usuario "${u.email}"?`)) return;
    const user = verificarAdmin();
    if (!user || !user.token) {
        alert('No autorizado');
        return;
    }

    try {
        const userId = u.id || u.idUsuario;
        const res = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Error ${res.status}`);
        }
        showMessage('Usuario eliminado');
        fetchUsuarios();
    } catch (e) {
        showMessage('Error al eliminar: ' + e.message, true);
    }
}

function inicializarAdminUsuarios() {
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
        limpiarFormularioUsuario();
        document.getElementById('form-container').style.display = 'block';
    });

    document.getElementById('btn-refrescar').addEventListener('click', fetchUsuarios);
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        limpiarFormularioUsuario();
        document.getElementById('form-container').style.display = 'none';
    });

    document.getElementById('form-usuario').addEventListener('submit', guardarUsuario);

    fetchUsuarios();
}

document.addEventListener('DOMContentLoaded', inicializarAdminUsuarios);
