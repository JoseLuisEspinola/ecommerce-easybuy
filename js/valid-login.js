const API_BASE = "https://node-js-final-2026.vercel.app"; 

function validarFormulario(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim(); // ahora es email
    const password = document.getElementById("password").value.trim();

    let errores = [];

    if (email === "") {
        errores.push("Por favor, ingrese su Email.");
    }

    if (password === "") {
        errores.push("Por favor, ingrese su Password.");
    }

    if (errores.length > 0) {
        alert(errores.join("\n"));
        return;
    }

    // Llamada real al backend con fetch
    fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error en el login");
        }
        return response.json();
    })
    .then(data => {
        const { token, user } = data;

        // Guardamos en localStorage el usuario logueado con su token
        localStorage.setItem('usuarioLogueado', JSON.stringify({
            token: token,
            usuario: user.id,
            rol: user.rol,
            email: user.email
        }));

        alert(`¡Bienvenido ${user.nombre}! Inicio de sesión exitoso.`);

        // Redirigir a la página de origen o al index
        const paginaOrigen = localStorage.getItem('paginaOrigen') || "index.html";
        localStorage.removeItem('paginaOrigen');
        window.location.href = paginaOrigen;
    })
    .catch(error => {
        alert("Usuario o contraseña incorrectos: " + error.message);
    });
}

// Función para establecer la página de origen
function establecerPaginaOrigen() {
    const urlParams = new URLSearchParams(window.location.search);
    const origen = urlParams.get('origen');
    if (origen) {
        localStorage.setItem('paginaOrigen', origen);
    }
}

document.getElementById("form-login").addEventListener("submit", validarFormulario);
establecerPaginaOrigen();
