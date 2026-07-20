document.addEventListener('DOMContentLoaded', function() {
    const textLoginElement = document.querySelector('.user-name');

    let raw = localStorage.getItem('usuarioLogueado');
    let usuarioActivo = null;

    if (raw) {
        try {
            usuarioActivo = JSON.parse(raw);
        } catch (e) {
            console.error("Error al parsear usuarioLogueado:", e);
        }
    }

    if (usuarioActivo) {
        // Verificar si la sesión ha expirado (1 hora = 3600000 milisegundos)
        const unahora = 60 * 60 * 1000;
        const ahora = Date.now();

        if (usuarioActivo.loginAt && (ahora - usuarioActivo.loginAt > unahora)) {
            // Limpiar datos y redirigir
            localStorage.removeItem('usuarioLogueado');
            alert("Su sesión ha expirado (1 hora). Por favor, inicie sesión nuevamente.");
            window.location.href = "login.html";
            return;
        }

        // Mostrar el nombre si existe, si no el email
        textLoginElement.textContent = usuarioActivo.name || usuarioActivo.email || "";
        textLoginElement.style.opacity = 1;
    } else {
        // Si no hay usuario
        textLoginElement.textContent = "";
        textLoginElement.style.opacity = 0.7;
    }
});
