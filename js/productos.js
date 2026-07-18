// Usuario logueado desde localStorage
let rawUsuario = localStorage.getItem('usuarioLogueado');
let usuarioLogueado = rawUsuario ? JSON.parse(rawUsuario) : null;

// URL base de tu backend en Vercel/Render
const API_BASE = "https://node-js-final-2026.vercel.app";  

// Carrito del usuario logueado (seguro contra "undefined")
let rawCarrito = localStorage.getItem(`carrito_${usuarioLogueado?.usuario}`);
let carrito = [];

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

const resultadosDiv = document.getElementById('container-productos');

// Mostrar productos desde Firestore vía backend
function mostrarProductos() {
    resultadosDiv.innerHTML = ''; 

    axios.get(`${API_BASE}/api/products`, {
        headers: usuarioLogueado?.token ? { Authorization: `Bearer ${usuarioLogueado.token}` } : {}
    })
    .then(response => {
        const data = Array.isArray(response.data) 
            ? response.data 
            : response.data.products;

        if (!data || data.length === 0) {
            resultadosDiv.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }

        data.forEach(product => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('card');

            itemDiv.innerHTML = `
                <img src="${product.imageUrl || ''}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p class="description">${product.description || ''}</p>
                ${product.discount ? `<span class="offer">En oferta!</span>` : ""}
                ${
                  product.price
                    ? `<p class="precio"><strong>Precio:</strong> $${product.price}</p>`
                    : `<p class="login-msg">Inicie sesión para ver el precio</p>`
                }
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

// Agregar producto al carrito en Firestore
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

    axios.post(`${API_BASE}/api/cart/add`, {
        productId,
        quantity: cantidad
    }, {
        headers: { Authorization: `Bearer ${usuarioLogueado.token}` }
    })
    .then(response => {
        const cartData = Array.isArray(response.data) ? response.data : [];

        carrito = cartData.map(item => ({
            id: item.id,
            name: item.name,
            image: item.imageUrl,
            price: item.price,
            quantity: item.quantity ? item.quantity : 1
        }));

        localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));
        actualizarNumeroCarrito();
        alert('Producto agregado al carrito.');
    })
    .catch(error => {
        alert('Error al agregar al carrito: ' + error.message);
    });
}

document.addEventListener('DOMContentLoaded', mostrarProductos);
