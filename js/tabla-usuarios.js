document.addEventListener('DOMContentLoaded', () => {
    const tablaUsuarios = document.getElementById('tabla-usuarios'); // Asegúrate de que este ID coincida
    if (!tablaUsuarios) {
        console.error('No se encontró el elemento con ID "tabla-usuarios".');
        return;
    }

    // Cargar usuarios desde localStorage
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
    const tbody = tablaUsuarios.querySelector('tbody');

    usuariosGuardados.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${usuario.nombre}</td>
            <td>${usuario.usuario}</td>
            <td>${usuario.clave}</td>
            <td>
                <button class="modificar">Modificar</button>
                <button class="eliminar">Eliminar</button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    // Detectar clicks en los botones de la tabla
    tablaUsuarios.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('modificar')) {
            alert('Botón Modificar...POR AHORA no tiene ningun efecto!');
        } else if (target.classList.contains('eliminar')) {
            const row = target.closest('tr');
            const usuarioEliminar = row.cells[1].textContent;

            if (confirm(`¿Seguro que desea eliminar al usuario: ${usuarioEliminar}?`)) {
                const usuariosActualizados = usuariosGuardados.filter(
                    usuario => usuario.usuario !== usuarioEliminar
                );
                localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
                row.remove();
            }
        }
    });
});

