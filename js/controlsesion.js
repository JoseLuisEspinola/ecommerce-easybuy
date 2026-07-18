// Cerrar sesión al cerrar la pestaña activa o ventana
window.addEventListener("beforeunload", () => {
    localStorage.removeItem("usuarioLogueado");
    localStorage.setItem("sesionActiva", "false");
});

// Verificar si hay una sesión activa al cargar la página
/* document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuarioLogueado) {
        alert(`Bienvenido de nuevo, ${usuarioLogueado.usuario}!`);
    } else {
        alert("No estás logueado, por favor inicia sesión.");
    }
}); */
