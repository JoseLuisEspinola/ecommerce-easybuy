function cadenaSimple() {
    let mensajes = ["EasyBuy...", "¡La tienda a tu manera!", "¡Empieza a navegar ya!"];
    let index = 0;
    
    function cambiarTitle() {
        document.title = mensajes[index];
        index = (index + 1) % mensajes.length;
        setTimeout(cambiarTitle, 2000);
    }
    
    cambiarTitle();
}


function cadenaDoble() {
    let emojis = ["💚", "💛", "💙", "💜", "❤️"];
    let i = 0;

    function animarEmoji() {
        document.title = `${emojis[i]} ¡ShopEase! ${emojis[i]}`;
        i = (i + 1) % emojis.length;
        setTimeout(animarEmoji, 1000);
    }

    animarEmoji();
}

cadenaSimple();