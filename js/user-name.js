document.addEventListener('DOMContentLoaded', function() {
    const textLoginElement = document.querySelector('.user-name');

    let usuarioActivo = JSON.parse(localStorage.getItem('usuarioLogueado')) || null;

    if (usuarioActivo) {
        // Mostrar el nombre si existe, si no el email
        textLoginElement.textContent = usuarioActivo.name || usuarioActivo.email || "";
        textLoginElement.style.opacity = 1;
    } else {
        // Si no hay usuario, mostrar Invitado o redirigir al login
        textLoginElement.textContent = "";
        textLoginElement.style.opacity = 0.7;
        // Opcional: window.location.href = "login.html";
    }
});
