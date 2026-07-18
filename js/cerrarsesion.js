function cerrarSesion() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioLogueado"));

    if (usuarioActivo) {
        alert(`Adiós ${usuarioActivo.name || usuarioActivo.email}...\nLa sesión fue cerrada con éxito!!!`);
    } else {
        alert("¡¡¡No hay NINGUN usuario logueado!!!.");
    }

    // Limpiar sesión
    localStorage.removeItem("usuarioLogueado");
    localStorage.setItem("sesionActiva", "false");

    // Redirigir al login
    window.location.href = "login.html"; 
}

// También cerrar sesión al cerrar pestaña/ventana
/* window.addEventListener("beforeunload", () => {
    localStorage.removeItem("usuarioLogueado");
    localStorage.setItem("sesionActiva", "false");
}); */
