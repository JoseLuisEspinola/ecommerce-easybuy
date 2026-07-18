// Función para actualizar el número del carrito
function actualizarNumeroCarrito() {
    let rawUsuario = localStorage.getItem('usuarioLogueado');
    let usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

    if (!usuarioLogueado) return; // Si no hay usuario logueado, no actualizamos el contador

    let rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado.usuario}`);
    let carrito = [];

    if (rawCarrito && rawCarrito !== "undefined") {
        try {
            carrito = JSON.parse(rawCarrito);
        } catch (e) {
            console.error("Carrito corrupto, se vacía:", e);
            carrito = [];
            localStorage.removeItem(`carrito_${usuarioLogueado.usuario}`);
        }
    }

    //const totalItems = carrito.reduce((total, producto) => total + producto.quantity, 0);

    const totalItems = carrito.reduce((total, producto) => {
        const qty = producto.quantity && !isNaN(producto.quantity) ? producto.quantity : 1;
        return total + qty;
    }, 0);


    const contadorCarrito = document.querySelector('.fa-cart-shopping span');
    if (contadorCarrito) {
        contadorCarrito.textContent = totalItems;
    }
}

// Actualiza el número al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarNumeroCarrito();
});

// Escucha cambios en localStorage (si aplica)
window.addEventListener('storage', actualizarNumeroCarrito);
