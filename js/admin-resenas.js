const API_BASE = "https://node-js-final-2026.vercel.app";

function verificarAdmin() {
    const raw = localStorage.getItem('usuarioLogueado');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function showMessage(msg, err = false) {
    const el = document.getElementById('admin-messages');
    if (!el) return;
    el.textContent = msg;
    el.style.color = err ? 'crimson' : 'green';
}

async function fetchReviews() {
    const user = verificarAdmin();
    const tbody = document.querySelector('#tabla-reviews tbody');
    tbody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';

    const headers = {};
    if (user && user.token) headers['Authorization'] = `Bearer ${user.token}`;

    try {
        const res = await fetch(`${API_BASE}/api/reviews`, { headers });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const reviews = await res.json();
        renderReviews(reviews);
    } catch (e) {
        console.error('fetchReviews error:', e);
        showMessage('Error al obtener reseñas: ' + e.message, true);
        tbody.innerHTML = `<tr><td colspan="7">Fallo al cargar reseñas</td></tr>`;
    }
}

function renderReviews(reviews) {
    const tbody = document.querySelector('#tabla-reviews tbody');
    tbody.innerHTML = '';
    if (!Array.isArray(reviews) || reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay reseñas registradas.</td></tr>';
        return;
    }

    reviews.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.comment || 'Sin Comentario'}</td>
            <td>${r.productId || 'Sin ID Producto'}</td>
            <td>${r.rating ?? '—'}</td>
            <td>${r.userId || 'Sin ID Usuario'}</td>
            <td>${r.userName || '—'}</td>
            <td>${r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</td>
            <td class="acciones-cell"></td>
        `;

        const accionesCell = tr.querySelector('.acciones-cell');
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar';
        btnEditar.textContent = 'Editar';
        btnEditar.addEventListener('click', () => cargarFormularioParaEditarReview(r));

        const btnBorrar = document.createElement('button');
        btnBorrar.className = 'btn-borrar';
        btnBorrar.textContent = 'Eliminar';
        btnBorrar.addEventListener('click', () => borrarReview(r));

        accionesCell.appendChild(btnEditar);
        accionesCell.appendChild(btnBorrar);

        tbody.appendChild(tr);
    });
}

function cargarFormularioParaEditarReview(r) {
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('review-id').value = r.id || '';
    document.getElementById('review-comentario').value = r.comment || '';
    document.getElementById('review-productoId').value = r.productId || '';
    document.getElementById('review-rating').value = r.rating || '';
}

function limpiarFormularioReview() {
    document.getElementById('review-id').value = '';
    document.getElementById('review-comentario').value = '';
    document.getElementById('review-productoId').value = '';
    document.getElementById('review-rating').value = '';
}

async function guardarReview(e) {
    e.preventDefault();
    const user = verificarAdmin();
    if (!user || !user.token) {
        alert('No autorizado');
        return;
    }

    const id = document.getElementById('review-id').value;
    const comment = document.getElementById('review-comentario').value.trim();
    const productId = document.getElementById('review-productoId').value.trim();
    const rating = document.getElementById('review-rating').value;
    const createdAt = new Date().toISOString();

    const payload = id
        ? { comment, productId, rating } // update
        : { comment, productId, rating, createdAt }; // nuevo

    try {
        let res;
        if (id) {
            res = await fetch(`${API_BASE}/api/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch(`${API_BASE}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(payload)
            });
        }

        if (!res.ok) throw new Error(`Error ${res.status}`);
        showMessage('Operación realizada con éxito');
        limpiarFormularioReview();
        document.getElementById('form-container').style.display = 'none';
        fetchReviews();
    } catch (err) {
        showMessage('Error: ' + err.message, true);
    }
}

async function borrarReview(r) {
    if (!confirm(`¿Eliminar la reseña "${r.comment}"?`)) return;
    const user = verificarAdmin();
    if (!user || !user.token) {
        alert('No autorizado');
        return;
    }

    try {
        const reviewId = r.id;
        const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Error ${res.status}`);
        }
        showMessage('Reseña eliminada');
        fetchReviews();
    } catch (e) {
        showMessage('Error al eliminar: ' + e.message, true);
    }
}

function inicializarAdminReviews() {
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
        limpiarFormularioReview();
        document.getElementById('form-container').style.display = 'block';
    });

    document.getElementById('btn-refrescar').addEventListener('click', fetchReviews);
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        limpiarFormularioReview();
        document.getElementById('form-container').style.display = 'none';
    });

    document.getElementById('form-review').addEventListener('submit', guardarReview);

    fetchReviews();
}

document.addEventListener('DOMContentLoaded', inicializarAdminReviews);
