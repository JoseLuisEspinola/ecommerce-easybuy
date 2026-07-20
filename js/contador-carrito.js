// Función para actualizar el número del carrito
function actualizarNumeroCarrito() {
    const rawUsuario = localStorage.getItem('usuarioLogueado');
    const usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

    let carrito = [];

    if (usuarioLogueado) {
        const rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado.usuario}`);

        if (rawCarrito && rawCarrito !== "undefined") {
            try {
                carrito = JSON.parse(rawCarrito);
            } catch (e) {
                console.error("Carrito corrupto, se vacía:", e);
                carrito = [];
                localStorage.removeItem(`carrito_${usuarioLogueado.usuario}`);
            }
        }
    }

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
window.addEventListener('storage', () => {
    actualizarNumeroCarrito();
});
