// Condición para verificar si no hay usuario logueado
let usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado')) || null;

if (!usuarioLogueado) { 
    alert("Debe iniciar sesión para acceder a esta página.");
    window.location.href = "login.html?origen=" + window.location.pathname;
}


const url = 'https://fakestoreapi.com/products'; // La URL de la API Fakestore

// Recuperamos el carrito de localStorage
// let carrito = JSON.parse(localStorage.getItem('carrito')) || []; 
// Recuperamos el carrito del usuario logueado en lugar de usar el carrito global
let carrito = JSON.parse(localStorage.getItem(`carrito_${usuarioLogueado.usuario}`)) || [];

const resultadosDiv = document.getElementById('container-productos'); // Contenedor donde mostramos los productos

// Función para mostrar los productos disponibles
function mostrarProductos() {
    // Limpiamos el contenedor de resultados
    resultadosDiv.innerHTML = ''; 

    // Realizamos la solicitud para obtener los productos
    axios.get(url)
        .then(response => {
            const data = response.data; // Datos de los productos
            data.forEach(product => {
                const itemDiv = document.createElement('div'); // Creamos un contenedor para cada producto
                itemDiv.classList.add('card'); // Añadimos la clase

                // Agregamos el contenido HTML para cada producto
                itemDiv.innerHTML = `
                    <img src="${product.image}" alt="${product.title}">
                    <h2>${product.title}</h2>
                    <p class="description">${product.description}</p>
                    <p class="precio"><strong>Precio:</strong> $${product.price}</p>
                    <input type="number" id="cantidad-${product.id}" value="1" min="1">
                    <button onclick="agregarAlCarrito(${product.id})">Agregar al carrito</button>
                `;

              resultadosDiv.appendChild(itemDiv); // Añadimos el producto al contenedor
            });
        })
      .catch(error => {
          alert('Hubo un error al obtener los productos: ' + error.message);
      });
}

// Función para agregar productos al carrito
function agregarAlCarrito(productId) {
    const cantidadInput = document.getElementById(`cantidad-${productId}`).value;
    let cantidad = parseInt(cantidadInput);

    // Validamos que la cantidad sea válida
    if (isNaN(cantidad) || cantidad < 1) {
        alert('Por favor, ingresa una cantidad válida (mínimo 1).');
        return; // Salimos de la función si la cantidad no es válida
    }

    // Obtenemos los detalles del producto
    axios.get(`https://fakestoreapi.com/products/${productId}`)
      .then(response => {
          const producto = response.data;

          // Verificamos si el producto ya está en el carrito
          const productoEnCarrito = carrito.find(item => item.id === productId);
      
          if (productoEnCarrito) {
              // Si el producto ya está, solo actualizamos la cantidad
              productoEnCarrito.quantity += cantidad;
          } else {
              // Si no está en el carrito, lo agregamos
              carrito.push({
                  id: producto.id,
                  title: producto.title,
                  price: producto.price,
                  quantity: cantidad,
                  image: producto.image
              });
          }

          // Guardamos el carrito actualizado en localStorage
          //localStorage.setItem('carrito', JSON.stringify(carrito));
          localStorage.setItem(`carrito_${usuarioLogueado.usuario}`, JSON.stringify(carrito));

          // Actualizamos el numero del carrito, que se encuentra en el otro js
          actualizarNumeroCarrito();

          // Mostramos un mensaje
          alert(`${producto.title} ha sido agregado al carrito.`);
      })
      .catch(error => {
          alert('Error al agregar al carrito: ' + error.message);
      });
}

// Llamamos a mostrar los productos cuando se carga la página
document.addEventListener('DOMContentLoaded', mostrarProductos);
