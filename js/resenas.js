// URL base del backend. Se usa la de Vercel por defecto.
// Si querés probar localmente, cambiá esta variable por 
// const API_URL = "http://localhost:3000/api/reviews"
const API_BASE = "https://node-js-final-2026.vercel.app";
const API_URL = `${API_BASE}/api/reviews`;
const PRODUCTS_API_URL = `${API_BASE}/api/products`;


// Verificar si el usuario está logueado
function obtenerUsuarioSesion() {
    try {
        return JSON.parse(localStorage.getItem('usuarioLogueado') || 'null');
    } catch (error) {
        console.error('No se pudo leer la sesión:', error);
        return null;
    }
}

function usuarioLogueado() {
    const usuario = obtenerUsuarioSesion();
    return !!(usuario && (usuario.token || localStorage.getItem('token')));
}

function obtenerToken() {
    const usuario = obtenerUsuarioSesion();
    return usuario?.token || localStorage.getItem('token') || '';
}

// Cargar productos para el selector del formulario
async function cargarProductosParaResenas() {
    const select = document.getElementById('producto-res');
    if (!select) return;

    try {
        const response = await fetch(PRODUCTS_API_URL, {
            method: 'GET',
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error('No se pudieron cargar los productos');
        }

        const data = await response.json();
        const productos = Array.isArray(data) ? data : data.products || [];

        select.innerHTML = '<option value="">Seleccione un producto...</option>';

        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = producto.name || producto.title || producto.productName || 'Producto';
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">No se pudieron cargar los productos</option>';
    }
}

// Actualizar estado del formulario según la sesión del usuario
function inicializarFormulario() {
    const form = document.getElementById('form-resenas');
    if (!form) return;

    const controles = form.querySelectorAll('input, textarea, select, button');
    const estaLogueado = usuarioLogueado();

    controles.forEach(el => {
        el.disabled = !estaLogueado;
    });

    let aviso = document.getElementById('aviso-resenas-login');

    if (!estaLogueado) {
        if (!aviso) {
            aviso = document.createElement('p');
            aviso.id = 'aviso-resenas-login';
            aviso.textContent = 'Debes iniciar sesión para dejar tu reseña.';
            aviso.style.color = 'red';
            aviso.style.fontWeight = 'bold';
            form.insertAdjacentElement('afterend', aviso);
        }
    } else if (aviso) {
        aviso.remove();
    }
}

// Validar y enviar reseña
async function validarFormulario(event) {
    event.preventDefault();
    if (!usuarioLogueado()) {
        inicializarFormulario();
        alert('Debes iniciar sesión para publicar una reseña.');
        return;
    }

    const comentarioRes = document.getElementById('comentario-res').value.trim();
    const ratingRes = document.getElementById('rating-res').value;
    const productId = document.getElementById('producto-res').value;

    if (!comentarioRes || !ratingRes || !productId) {
        alert('Debe completar producto, comentario y puntuación.');
        return;
    }

    try {
        const token = obtenerToken();
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, comment: comentarioRes, rating: ratingRes })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar reseña');
        }

        const resenaGuardada = await response.json();
        agregarTarjetaResena(resenaGuardada);

        document.getElementById('form-resenas').reset();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// Renderizar tarjeta de reseña
function agregarTarjetaResena(resena) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('card-resenas');

    const titulo = document.createElement('h3');
    titulo.classList.add('card-title-resenas');
    titulo.textContent = resena.userName || 'Usuario';

    const producto = document.createElement('p');
    producto.classList.add('card-producto-resenas');
    producto.style.fontWeight = 'bold';
    producto.textContent = `Producto: ${resena.productName || 'Producto sin nombre'}`;

    const descripcion = document.createElement('p');
    descripcion.classList.add('card-description-resenas');
    descripcion.style.fontStyle = 'italic';
    descripcion.textContent = resena.comment;

    const puntuacion = document.createElement('p');
    puntuacion.classList.add('card-rating-resenas');
    puntuacion.textContent = `Puntuación: ${resena.rating}/5`;

    const fecha = document.createElement('p');
    fecha.classList.add('card-fecha-resenas');
    fecha.textContent = `Fecha: ${new Date(resena.createdAt).toLocaleString()}`;

    tarjeta.appendChild(titulo);
    tarjeta.appendChild(producto);
    tarjeta.appendChild(descripcion);
    tarjeta.appendChild(puntuacion);
    tarjeta.appendChild(fecha);

    document.querySelector('.container-cards').prepend(tarjeta);
}

// Cargar reseñas públicas
async function cargarResenas() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      const texto = await response.text();
      throw new Error(`Error ${response.status} al cargar reseñas. ${texto}`);
    }

    const resenas = await response.json();
    const contenedor = document.querySelector('.container-cards');
    contenedor.innerHTML = '';

    const productos = await obtenerProductosMap();

    resenas.forEach(resena => {
      const producto = productos.get(resena.productId);
      agregarTarjetaResena({
        ...resena,
        productName: producto?.name || producto?.title || producto?.productName || 'Producto sin nombre'
      });
    });
  } catch (error) {
    console.error(error);
    alert('No se pudieron cargar las reseñas. Revisa que la API de Vercel responda correctamente.');
  }
}

async function obtenerProductosMap() {
  try {
    const response = await fetch(PRODUCTS_API_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error('No se pudieron cargar los productos');
    }

    const data = await response.json();
    const productos = Array.isArray(data) ? data : data.products || [];

    return new Map(productos.map(producto => [producto.id, producto]));
  } catch (error) {
    console.error(error);
    return new Map();
  }
}

// Eventos
document.getElementById('form-resenas').addEventListener('submit', validarFormulario);
window.addEventListener('storage', inicializarFormulario);

// Inicialización
inicializarFormulario();
cargarProductosParaResenas();
cargarResenas();
