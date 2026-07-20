const API_BASE = "https://node-js-final-2026.vercel.app"; 

function validarFormulario(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Por favor, complete email y contraseña.");
        return;
    }

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

        localStorage.setItem('usuarioLogueado', JSON.stringify({
            token,
            usuario: user.id,
            rol: user.rol,
            email: user.email,
            name: user.name || user.nombre, // Ajuste para compatibilidad con el backend
            loginAt: Date.now()
        }));

        alert(`¡Bienvenido ${user.name}! Inicio de sesión exitoso.`);

        const paginaOrigen = localStorage.getItem('paginaOrigen') || "index.html";
        localStorage.removeItem('paginaOrigen');
        window.location.href = paginaOrigen;
    })
    .catch(error => {
        alert("Usuario o contraseña incorrectos: " + error.message);
    });
}

function establecerPaginaOrigen() {
    const urlParams = new URLSearchParams(window.location.search);
    const origen = urlParams.get('origen');
    if (origen) {
        localStorage.setItem('paginaOrigen', origen);
    }
}

document.getElementById("form-login").addEventListener("submit", validarFormulario);
establecerPaginaOrigen();
