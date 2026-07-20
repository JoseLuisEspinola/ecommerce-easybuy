const API_BASE = "https://node-js-final-2026.vercel.app";

document.addEventListener('DOMContentLoaded', async () => {
    const tablaUsuarios = document.getElementById('tabla-usuarios'); // Asegúrate de que este ID coincida
    if (!tablaUsuarios) {
        console.error('No se encontró el elemento con ID "tabla-usuarios".');
        return;
    }

    const raw = localStorage.getItem('usuarioLogueado');
    let usuarioLogueado = null;
    if (raw) {
        try {
            usuarioLogueado = JSON.parse(raw);
        } catch (e) {
            console.error("Error al parsear usuarioLogueado:", e);
        }
    }

    if (!usuarioLogueado || !usuarioLogueado.token) {
        alert("Acceso denegado: debe iniciar sesión.");
        window.location.href = "login.html";
        return;
    }

    const tbody = tablaUsuarios.querySelector('tbody');
    tbody.innerHTML = '<tr><td colspan="3">Cargando usuarios...</td></tr>';

    let usuariosList = [];

    // Cargar usuarios desde la base de datos Firestore del backend
    async function cargarUsuarios() {
        try {
            const res = await fetch(`${API_BASE}/api/users/users`, {
                headers: {
                    'Authorization': `Bearer ${usuarioLogueado.token}`
                }
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status} al obtener usuarios`);
            }

            const data = await res.json();
            usuariosList = Array.isArray(data) ? data : (data.users || []);

            tbody.innerHTML = '';
            if (usuariosList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No hay usuarios registrados.</td></tr>';
                return;
            }

            usuariosList.forEach(usuario => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${usuario.name || usuario.nombre || 'Sin nombre'}</td>
                    <td>${usuario.email || 'Sin email'}</td>
                    <td>
                        <button class="modificar" data-id="${usuario.id}">Modificar</button>
                        <button class="eliminar" data-id="${usuario.id}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="3">Fallo al cargar usuarios: ${error.message}</td></tr>`;
        }
    }

    // Detectar clicks en los botones de la tabla
    tablaUsuarios.addEventListener('click', async (event) => {
        const target = event.target;

        if (target.classList.contains('modificar')) {
            alert('El botón de modificación no está disponible temporalmente.');
        } else if (target.classList.contains('eliminar')) {
            const userId = target.getAttribute('data-id');
            const row = target.closest('tr');
            const userEmail = row.cells[1].textContent;

            if (confirm(`¿Seguro que desea eliminar al usuario: ${userEmail}?`)) {
                try {
                    const res = await fetch(`${API_BASE}/api/users/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${usuarioLogueado.token}`
                        }
                    });

                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.message || `Error ${res.status}`);
                    }

                    alert('Usuario eliminado con éxito de Firestore.');
                    row.remove();
                } catch (e) {
                    alert('No se pudo eliminar el usuario: ' + e.message);
                }
            }
        }
    });

    await cargarUsuarios();
});

