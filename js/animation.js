window.sr = ScrollReveal();

/* index.html */
sr.reveal('.renglon1', {
    duration: 3000,
    origin: 'top',
    distance: '-300px'
});

sr.reveal('.resenas', {
    duration: 4000,
    origin: 'bottom',
    distance: '-300px'
});

sr.reveal('.title-nosotros', {
    duration: 2000,
    origin: 'top',
    distance: '200px'
});

sr.reveal('.titulo-sucursales', {
    duration: 2000,
    origin: 'top',
    distance: '200px'
});

sr.reveal('.titulo-form', {
    duration: 2000,
    origin: 'top',
    distance: '200px'
});

sr.reveal('#form-contacto', {
    duration: 4000,
    origin: 'right',
    distance: '-300px'
});




/* productos.html */
sr.reveal('.titulo-productos', {
    duration: 4000,
    origin: 'bottom',
    distance: '300px'
});




/* ofertas.html */
sr.reveal('.title-ofertas', {
    duration: 3000,
    origin: 'bottom',
    distance: '-100px'
});

sr.reveal('.renglon1', {
    duration: 3000,
    origin: 'top',
    distance: '-300px'
});



/* resenas.html */
sr.reveal('.title-resenas', {
    duration: 2600,
    origin: 'bottom',
    distance: '300px'
});



/* admin-productos.html */
sr.reveal('.title-crud-productos', {
    duration: 3000,
    origin: 'bottom',
    distance: '300px'
});

sr.reveal('#btn-nuevo', {
    duration: 1800,   // velocidad de la animación
    delay: 1800,       // retardo antes de aparecer
    opacity: 0,       // empieza invisible
    scale: 0.9        // opcional: aparece con un leve zoom 
});

sr.reveal('#btn-refrescar', {
    duration: 1800,   // velocidad de la animación
    delay: 1800,       // retardo antes de aparecer
    opacity: 0,       // empieza invisible
    scale: 0.9        // opcional: aparece con un leve zoom
});
