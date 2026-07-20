// Usuario logueado desde localStorage
let rawUsuario = localStorage.getItem('usuarioLogueado');
let usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

// URL base de tu backend en Vercel/Render
const API_BASE = "https://node-js-final-2026.vercel.app";  

// Carrito del usuario logueado (seguro contra "undefined")
let rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado?.usuario}`);
let carrito = [];

function cargarCarritoDesdeLocalStorage() {
    rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado?.usuario}`);
    carrito = [];

    if (rawCarrito && rawCarrito !== "undefined") {
        try {
            carrito = JSON.parse(rawCarrito);
        } catch (e) {
            console.error("Carrito corrupto, se vacía:", e);
            carrito = [];
            if (usuarioLogueado) {
                localStorage.removeItem(`carrito_${usuarioLogueado.usuario}`);
            }
        }
    }
}

cargarCarritoDesdeLocalStorage();

const resultadosDiv = document.getElementById('container-productos');
let productosDisponibles = [];

// Mostrar productos desde Firestore vía backend
function mostrarProductos() {
    resultadosDiv.innerHTML = '';

    const endpoint = usuarioLogueado?.token ? '/api/products' : '/api/pub/products';
    const headers = usuarioLogueado?.token ? { Authorization: `Bearer ${usuarioLogueado.token}` } : {};

    axios.get(`${API_BASE}${endpoint}`, { headers })
    .then(response => {
        const data = Array.isArray(response.data)
            ? response.data
            : response.data.products;

        productosDisponibles = Array.isArray(data) ? data : [];

        if (!productosDisponibles || productosDisponibles.length === 0) {
            resultadosDiv.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }

        productosDisponibles.forEach(product => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('card');

            const precioVisible = usuarioLogueado?.token && typeof product.price !== 'undefined'
                ? product.price
                : 0;

            itemDiv.innerHTML = `
                <img src="${product.imageUrl || ''}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p class="description">${product.description || ''}</p>
                ${product.discount ? `<span class="offer">En oferta!</span>` : ""}
                <p class="precio"><strong>Precio:</strong> ${usuarioLogueado?.token ? `$${precioVisible}` : 'Oculto para usuarios no logueados'}</p>
                ${
                  usuarioLogueado?.token
                    ? `<input type="number" id="cantidad-${product.id}" value="1" min="1">
                       <button onclick="agregarAlCarrito('${product.id}')">Agregar al carrito</button>`
                    : `<p class="login-msg">Debe iniciar sesión para comprar</p>`
                }
            `;

            resultadosDiv.appendChild(itemDiv);
        });
    })
    .catch(error => {
        alert('Error al obtener productos: ' + error.message);
    });
}

// Agregar producto al carrito local en localStorage
function agregarAlCarrito(productId) {
    // Verificamos si hay usuario logueado
    if (!usuarioLogueado || !usuarioLogueado.token) {
        alert("Debe iniciar sesión para agregar productos al carrito.");
        window.location.href = "login.html?origen=" + window.location.pathname;
        return;
    }

    const cantidadInput = document.getElementById(`cantidad-${productId}`).value;
    let cantidad = parseInt(cantidadInput);

    if (isNaN(cantidad) || cantidad < 1) {
        alert('Por favor, ingresa una cantidad válida (mínimo 1).');
        return;
    }

    cargarCarritoDesdeLocalStorage();
    const producto = productosDisponibles.find(p => String(p.id) === String(productId));
    actualizarCarritoLocal(producto, cantidad);
    localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
    actualizarNumeroCarrito();
    alert('Producto agregado al carrito.');
}

function actualizarCarritoLocal(producto, cantidad) {
    if (!producto) return;

    const unitPrice = Number(producto.price) || 0;
    const existingItem = carrito.find(item => String(item.id) === String(producto.id));

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + cantidad;
        existingItem.totalPrice = Number(existingItem.quantity) * unitPrice;
        existingItem.price = unitPrice;
        existingItem.unitPrice = unitPrice;
    } else {
        carrito.push({
            id: producto.id,
            name: producto.name,
            image: producto.imageUrl || producto.image || '',
            unitPrice: unitPrice,
            price: unitPrice,
            quantity: cantidad,
            totalPrice: unitPrice * cantidad
        });
    }
}

document.addEventListener('DOMContentLoaded', mostrarProductos);
