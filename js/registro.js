//Array para almacenar a los usuarios (inicializado desde localStorage)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
// let usuarios = JSON.parse(sessionStorage.getItem('usuarios')) || [];

// Función para validar el formulario
function validarFormulario(event) {
    
    // alert("Entro a la funcion");
    event.preventDefault(); // Evitar el envío del formulario

    // Validar los campos: capturo el valor de los campos
    var nombre = document.getElementById("nombre").value;
    var usuario = document.getElementById("username").value;
    var clave = document.getElementById("password").value;
    var clave2 = document.getElementById("password2").value;

    var errores = []; 

    if (nombre.trim() === "") {
        errores.push("Por favor, ingrese su Nombre.");
    }

    if (usuario.trim() === "") {
        errores.push("Por favor, ingrese su Nombre de Usuario.");
    }

    if (clave.trim() === "") {
        errores.push("Por favor, ingrese una contraseña.");
    }

    if (clave2.trim() === "") {
        errores.push("Por favor, repita la contaseña.");
    }
    
    // comparo los valores que tienen las claves
    if (clave !== clave2) {
        errores.push("Las contraseñas DEBEN ser IDENTICAS.")
    }

    // Nueva validación: verificar que el nombre de usuario sea único
    if (usuarios.some(u => u.usuario === usuario)) {
        errores.push("El nombre de usuario ya está en uso.");
    }

    // Mostrar mensajes de error si la longitud es mayor a cero
    if (errores.length > 0) {
        alert(errores.join("\n"));
        return; // Detener el envío del formulario si hay errores, osea que se retorna
    }

    if (errores.length === 0) {
        const nuevoUsuario = {nombre:nombre, usuario:usuario, clave:clave};
        usuarios.push(nuevoUsuario);

        // Actualizar localStorage
        localStorage.setItem('usuarios', JSON.stringify(usuarios));  // local mantiene el array en memoria del navegador
        //sessionStorage.setItem('usuarios', JSON.stringify(usuarios));   // session solo mantiene el array hasta que se cierra el navegador

        alert(`Usuario registrado con éxito: ${nuevoUsuario.usuario}`);

        // Redirige al formulario login
        window.location.href = "login.html";
    }
    
}

// Event listener al formulario "escuchar" el evento submit del boton
document.getElementById("form-registro").addEventListener("submit", validarFormulario);
