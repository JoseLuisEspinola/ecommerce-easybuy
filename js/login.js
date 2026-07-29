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

            //Habilitar la siguiente linea, SI ES QUE SE SACA el swal.fire.
            //alert(`¡Bienvenido ${user.name}! Inicio de sesión exitoso.`);

            // Swal para que se vea el login, con toast  
            Swal.fire({
                toast: true,
                position: 'top',          // esquina superior centro
                icon: 'success',
                title: `¡Bienvenido ${user.name}, inicio de sesión exitoso!`,
                showConfirmButton: false,
                timer: 5000,                  // se cierra solo en 3 segundos
                background: '#ffffff',        // fondo sólido
                color: '#0d8303ff'              // texto negro bien visible
            });

            const paginaOrigen = localStorage.getItem('paginaOrigen') || "index.html";
            localStorage.removeItem('paginaOrigen');
            window.location.href = paginaOrigen;
        })
        .catch(error => {
            Swal.fire({
                toast: true,
                position: 'top',          // esquina superior centro
                icon: 'success',
                title: `¡Usuario o contraseña incorrectos!...` + error.message,
                showConfirmButton: false,
                timer: 3000,                  // se cierra solo en 3 segundos
                background: '#ffffff',        // fondo sólido
                color: '#ad0404ff'              // texto negro bien visible
            });
            //alert("Usuario o contraseña incorrectos: " + error.message);
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
