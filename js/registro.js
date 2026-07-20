const API_BASE = "https://node-js-final-2026.vercel.app";

// Array para almacenar a los usuarios (como fallback / compatibilidad local)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

// Función para validar y enviar el formulario
async function validarFormulario(event) {
    event.preventDefault(); // Evitar el envío clásico del formulario

    // Validar los campos: capturo el valor de los campos
    var nombre = document.getElementById("nombre").value.trim();
    var usuario = document.getElementById("username").value.trim();
    var email = document.getElementById("email").value.trim();
    var clave = document.getElementById("password").value;
    var clave2 = document.getElementById("password2").value;

    var errores = []; 

    if (nombre === "") {
        errores.push("Por favor, ingrese su Nombre.");
    }

    if (usuario === "") {
        errores.push("Por favor, ingrese su Nombre de Usuario.");
    }

    if (email === "") {
        errores.push("Por favor, ingrese su Email.");
    }

    if (clave.trim() === "") {
        errores.push("Por favor, ingrese una contraseña.");
    }

    if (clave2.trim() === "") {
        errores.push("Por favor, repita la contraseña.");
    }
    
    // comparo los valores que tienen las claves
    if (clave !== clave2) {
        errores.push("Las contraseñas DEBEN ser IDENTICAS.");
    }

    // Mostrar mensajes de error si la longitud es mayor a cero
    if (errores.length > 0) {
        alert(errores.join("\n"));
        return; // Detener el envío
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nombre,
                email: email,
                password: clave,
                rol: "cliente" // Por defecto todos se registran con rol de cliente
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error en el registro (${response.status})`);
        }

        const nuevoUsuarioDb = await response.json();

        // Guardar también en localStorage para compatibilidad local con listados
        const nuevoUsuarioLocal = { nombre: nombre, usuario: usuario, email: email, clave: clave };
        usuarios.push(nuevoUsuarioLocal);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert(`Usuario registrado con éxito: ${usuario}`);

        // Redirige al formulario login
        window.location.href = "login.html";
    } catch (error) {
        alert("No se pudo registrar el usuario: " + error.message);
    }
}

// Event listener al formulario "escuchar" el evento submit del boton
document.getElementById("form-registro").addEventListener("submit", validarFormulario);
