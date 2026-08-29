// Usuario logueado desde localStorage
let rawUsuario = localStorage.getItem('usuarioLogueado');
let usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

// URL base de tu backend
const API_BASE = "https://node-js-final-2026.vercel.app";

// Carrito del usuario logueado
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

const resultadosDiv = document.getElementById('container-ofertas');
let ofertasDisponibles = [];

// Mostrar solo productos con discount > 0
function mostrarOfertas() {
    resultadosDiv.innerHTML = '';

    const endpoint = usuarioLogueado?.token ? '/api/products' : '/api/pub/products';
    const headers = usuarioLogueado?.token ? { Authorization: `Bearer ${usuarioLogueado.token}` } : {};

    axios.get(`${API_BASE}${endpoint}`, { headers })
        .then(response => {
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.products;

            // Filtrar solo los que tengan descuento
            ofertasDisponibles = (data || []).filter(p => Number(p.discount) > 0);

            if (ofertasDisponibles.length === 0) {
                resultadosDiv.innerHTML = '<p class="no-products">No hay ofertas disponibles.</p>';
                return;
            }

            ofertasDisponibles.forEach(product => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('card');

                const precioVisible = usuarioLogueado?.token && typeof product.price !== 'undefined'
                    ? product.price
                    : 0;

                itemDiv.innerHTML = `
                    <img src="${product.imageUrl || ''}" alt="${product.name}">
                    <h2>${product.name}</h2>
                    <p class="description">${product.description || ''}</p>
                    <span class="offer">¡Oferta ${product.discount}%!</span>
                    <p class="precio"><strong>Precio:</strong> ${usuarioLogueado?.token ? `$${precioVisible}` : 'Oculto para usuarios no logueados'}</p>
                    ${usuarioLogueado?.token
                        ? `<label class="cantidad-label" for="cantidad-${product.id}">
                                Cantidad:
                                <input type="number" id="cantidad-${product.id}" value="1" min="1">
                           </label>
                           <button onclick="agregarAlCarrito('${product.id}')">Agregar al carrito</button>`
                        : `<p class="login-msg">Debe iniciar sesión para comprar</p>`
                    }
                `;

                resultadosDiv.appendChild(itemDiv);
            });
        })
        .catch(error => {
            alert('Error al obtener ofertas: ' + error.message);
        });
}

// Agregar producto al carrito
function agregarAlCarrito(productId) {
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
    const producto = ofertasDisponibles.find(p => String(p.id) === String(productId));
    actualizarCarritoLocal(producto, cantidad);
    localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
    actualizarNumeroCarrito();
    alert(`Producto ${producto.name} agregado al carrito.`);
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

document.addEventListener('DOMContentLoaded', mostrarOfertas);
