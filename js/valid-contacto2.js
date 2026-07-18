const form = document.getElementById('form-contacto');

form.addEventListener('submit', (event) => {
    event.preventDefault(); // Evita el envío del formulario por defecto

    // Obtener todos los campos requeridos
    const camposRequeridos = document.querySelectorAll('input[required], textarea[required]');

    let hayErrores = false;

    // Iterar sobre los campos y validar
    camposRequeridos.forEach(campo => {
        const errorSpan = campo.nextElementSibling;
        if (!campo.value.trim()) {
            errorSpan.textContent = `Por favor, completa este campo.`;
            errorSpan.classList.add('error');
            hayErrores = true;
        } else {
            errorSpan.textContent = '';
            errorSpan.classList.remove('error');
        }
    });

    // Validación adicional para el correo electrónico
    const emailInput = document.getElementById('email');
    const emailError = emailInput.nextElementSibling;
    if (!isValidEmail(emailInput.value)) {
        emailError.textContent = 'Por favor, ingresa un correo electrónico válido.';
        emailError.classList.add('error');
        hayErrores = true;
    }

    // Validación adicional para el número de teléfono (opcional)
    const telefonoInput = document.getElementById('telefono');
    const telefonoError = telefonoInput.nextElementSibling;
    if (telefonoInput.value && !isValidTelefono(telefonoInput.value)) {
        telefonoError.textContent = 'Por favor, ingresa un número de teléfono válido.';
        telefonoError.classList.add('error');
        hayErrores = true;
    }

    // Si no hay errores, enviar el formulario
    if (!hayErrores) {
        // Aquí puedes agregar código para mostrar un mensaje de éxito al usuario antes de enviar
        alert('¡Tu mensaje ha sido enviado correctamente!');
        form.submit();
    }
});

function isValidEmail(email) {
    // Expresión regular básica para validar correos electrónicos
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function isValidTelefono(telefono) {
    // Puedes personalizar esta función según el formato de teléfono que esperas
    // Por ejemplo, para números de teléfono españoles:
    const regex = /^(\+34|0034|34)?[69]\d{8}$/;
    return regex.test(telefono);
}


//* CSS: estos 2 son los span de los errores de entrada*/
/* .error-message {
    color: red;
    font-size: 12px;
    display: none;
}

.alert {
    border: 1px solid red;
    padding: 5px;
    background-color: #ffdddd;
} */