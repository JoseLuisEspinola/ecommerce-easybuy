// Condición para verificar si no hay usuario logueado
let rawUsuario = localStorage.getItem('usuarioLogueado');
let usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

if (!usuarioLogueado) { 
    alert("Debe iniciar sesión para acceder a esta página.");
    window.location.href = "login.html?origen=" + window.location.pathname;
}

// Recuperamos el carrito de localStorage o inicializamos uno vacío
let rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado?.usuario}`);
let carrito = rawCarrito ? JSON.parse(rawCarrito) : [];

const carritoDiv = document.getElementById('carrito'); // Contenedor donde se muestra el carrito

// Función para mostrar el contenido del carrito
function mostrarCarrito() {
    carritoDiv.innerHTML = ''; // Limpiamos el contenedor del carrito

    if (carrito.length === 0) {
        carritoDiv.innerHTML = '<p class="carrito-vacio">¡Su <i class="fa-solid fa-cart-shopping" style="color:grey;"></i> se encuentra vacío!</p>';
        return;
    }

    let total = 0;

    // Recorremos los productos del carrito
    carrito.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('card');
        itemDiv.id = `item-${item.id}`; // ID único para cada producto

        total += item.price * item.quantity; // Calculamos el total

        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p><strong>Precio:</strong> $${item.price.toFixed(2)}</p>
            <p>
                Cantidad: 
                <input 
                    type="number" 
                    value="${item.quantity}" 
                    min="1" 
                    id="cantidad-${item.id}" 
                    onchange="actualizarCantidad(${item.id})">
            </p>
            <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
        `;

        carritoDiv.appendChild(itemDiv); // Añadimos el producto al contenedor
    });
    
    // Mostrar el total y un botón para vaciar el carrito
    const totalDiv = document.createElement('div');
    totalDiv.classList.add('total');
    totalDiv.innerHTML = `
    <p class="total">Total: $${total.toFixed(2)}</p>
    <button class="vaciar" onclick="vaciarCarrito()">Vaciar carrito</button>
    <button class="pagar" onclick="enviarWhatsapp()">Pagar</button>
    `;
    carritoDiv.appendChild(totalDiv);

    // Actualizamos el número del carrito
    actualizarNumeroCarrito();
}

// Función para actualizar la cantidad de un producto en el carrito
function actualizarCantidad(productId) {
    const nuevaCantidad = document.getElementById(`cantidad-${productId}`).value;
    const producto = carrito.find((item) => item.id === productId);
    if (producto) {
        producto.quantity = parseInt(nuevaCantidad, 10);
        localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
        mostrarCarrito();
    }
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    carrito = carrito.filter((item) => item.id !== productId);
    localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
    mostrarCarrito();
    actualizarNumeroCarrito();
}

// Función para vaciar el carrito completamente
function vaciarCarrito() {
    carrito = [];
    localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
    mostrarCarrito();
    actualizarNumeroCarrito();
}

// Función para redirigir a WhatsApp al pagar
function enviarWhatsapp() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. No puede pagar.');
        return;
    }

    let mensaje = 'Hola, quiero realizar la compra de los siguientes productos:%0A';
    let total = 0;

    carrito.forEach((item) => {
        mensaje += `- ${item.name} (Cantidad: ${item.quantity}, Precio: $${item.price.toFixed(2)})%0A`;
        total += item.price * item.quantity;
    });

    mensaje += `%0A*Total a pagar:* $${total.toFixed(2)}`;

    const numeroWhatsapp = '+543487616158'; // Número de WhatsApp del negocio
    const url = `https://wa.me/${numeroWhatsapp}?text=${mensaje}`;

    window.open(url, '_blank');
}

// Cargar el carrito al iniciar la página
document.addEventListener('DOMContentLoaded', mostrarCarrito);
