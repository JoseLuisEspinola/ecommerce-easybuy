// Condición para verificar si no hay usuario logueado
let rawUsuario = localStorage.getItem('usuarioLogueado');
let usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

const API_BASE = "https://node-js-final-2026.vercel.app";

if (!usuarioLogueado) { 
    alert("Debe iniciar sesión para acceder a esta página.");
    window.location.href = "login.html?origen=" + window.location.pathname;
}

// Recuperamos el carrito de localStorage o inicializamos uno vacío
let rawCarrito = null;
let carrito = [];

const carritoDiv = document.getElementById('carrito'); // Contenedor donde se muestra el carrito

function cargarCarritoDesdeLocalStorage() {
    rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado?.usuario}`);

    if (rawCarrito && rawCarrito !== "undefined") {
        try {
            carrito = JSON.parse(rawCarrito);
        } catch (e) {
            console.error("Carrito corrupto en localStorage:", e);
            carrito = [];
            localStorage.removeItem(`carrito_${usuarioLogueado.usuario}`);
        }
    } else {
        carrito = [];
    }
}

cargarCarritoDesdeLocalStorage();

// Función para mostrar el contenido del carrito
function mostrarCarrito() {
    cargarCarritoDesdeLocalStorage();
    carritoDiv.innerHTML = ''; // Limpiamos el contenedor del carrito

    if (carrito.length === 0) {
        carritoDiv.innerHTML = '<p class="carrito-vacio">¡Su <i class="fa-solid fa-cart-shopping" style="color:grey;"></i> se encuentra vacío!</p>';
        actualizarNumeroCarrito();
        return;
    }

    let total = 0;

    // Recorremos los productos del carrito
    carrito.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('card');
        itemDiv.id = `item-${item.id}`; // ID único para cada producto

        const itemUnitPrice = Number(item.unitPrice ?? item.price);
        const itemQuantity = Number(item.quantity);
        const safeUnitPrice = !isNaN(itemUnitPrice) ? itemUnitPrice : 0;
        const safeQuantity = !isNaN(itemQuantity) && itemQuantity > 0 ? itemQuantity : 1;
        const lineTotal = safeUnitPrice * safeQuantity;

        total += lineTotal; // Calculamos el total

        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p><strong>Precio unitario:</strong> ${!isNaN(itemUnitPrice) ? `$${safeUnitPrice.toFixed(2)}` : 'Sin precio'}</p>
            <p><strong>Cantidad:</strong> ${safeQuantity}</p>
            <p><strong>Precio total:</strong> ${!isNaN(itemUnitPrice) ? `$${lineTotal.toFixed(2)}` : 'Sin precio'}</p>
            <p>
                Actualizar cantidad: 
                <input 
                    type="number" 
                    value="${safeQuantity}" 
                    min="1" 
                    id="cantidad-${item.id}" 
                    onchange="actualizarCantidad('${item.id}')">
            </p>
            <button type="button" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
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
    const nuevaCantidad = Number(document.getElementById(`cantidad-${productId}`).value);
    const producto = carrito.find((item) => String(item.id) === String(productId));
    if (producto && !isNaN(nuevaCantidad) && nuevaCantidad > 0) {
        producto.quantity = nuevaCantidad;
        const unitPrice = Number(producto.unitPrice ?? producto.price) || 0;
        producto.totalPrice = unitPrice * nuevaCantidad;
        localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
        mostrarCarrito();
    }
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    if (!productId) {
        console.warn('Producto inválido para eliminar:', productId);
        return;
    }

    const itemIndex = carrito.findIndex((item) => String(item.id) === String(productId));
    if (itemIndex === -1) {
        console.warn('No se encontró el producto en el carrito:', productId);
        return;
    }

    carrito.splice(itemIndex, 1);
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
// Reemplaza la función enviarWhatsapp por esto:
async function enviarWhatsapp() {
    if (!usuarioLogueado || !usuarioLogueado.token) {
        alert('Debe iniciar sesión para finalizar la compra.');
        window.location.href = 'login.html?origen=' + window.location.pathname;
        return;
    }

    if (carrito.length === 0) {
        alert('El carrito está vacío. No puede pagar.');
        return;
    }

    // Preparar payload para backend
    const itemsPayload = carrito.map(item => ({
        productId: item.id,
        name: item.name,
        unitPrice: Number(item.unitPrice ?? item.price) || 0,
        quantity: Number(item.quantity) || 0
    }));

    const totalAmount = itemsPayload.reduce((s, it) => s + (it.unitPrice * it.quantity), 0);

    try {
        const resp = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuarioLogueado.token}`
            },
            body: JSON.stringify({ items: itemsPayload })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || `Error al crear orden (${resp.status})`);
        }

        const data = await resp.json();
        const orderId = data.orderId || (data.order && data.order.id) || null;

        // Limpiar carrito local
        carrito = [];
        localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
        mostrarCarrito();
        actualizarNumeroCarrito();

        // Preparar mensaje para WhatsApp (incluye ID de orden si hay)
        let mensaje = `Hola, has realizado la siguiente compra (Orden ID: ${orderId || 'N/A'})%0A%0A`;
        itemsPayload.forEach(it => {
            mensaje += `- ${it.name} (Cantidad: ${it.quantity}, Unit: $${it.unitPrice.toFixed(2)})%0A`;
        });
        mensaje += `%0A*Total:* $${totalAmount.toFixed(2)}`;

        const numeroWhatsapp = '+543487616158';
        const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(decodeURIComponent(mensaje))}`;

        // Abrir WhatsApp
        window.open(url, '_blank');

        alert('Orden registrada correctamente.' + (orderId ? ` ID: ${orderId}` : ''));
    } catch (error) {
        console.error('Checkout error', error);
        alert('No se pudo procesar la orden: ' + error.message);
    }
}

// Cargar el carrito al iniciar la página
document.addEventListener('DOMContentLoaded', mostrarCarrito);
