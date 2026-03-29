const btnVer = document.getElementById('btn-ver-historias');
const btnCrear = document.getElementById('btn-crear-historia');
const seccionVer = document.getElementById('seccion-ver');
const seccionCrear = document.getElementById('seccion-crear');
const seccionLeer = document.getElementById('seccion-leer');
const listaHistorias = document.getElementById('lista-historias');
const formulario = document.getElementById('formulario-historia');
const btnVolver = document.getElementById('btn-volver');
const lectorContenedor = document.getElementById('lector-contenedor');

// Función para extraer el ID de un video de YouTube
function obtenerIdYouTube(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function cambiarSeccion(mostrar) {
    seccionVer.classList.add('hidden');
    seccionCrear.classList.add('hidden');
    seccionLeer.classList.add('hidden');
    mostrar.classList.remove('hidden');
}

btnVer.addEventListener('click', () => { cambiarSeccion(seccionVer); btnVer.classList.add('active'); btnCrear.classList.remove('active'); cargarHistorias(); });
btnCrear.addEventListener('click', () => { cambiarSeccion(seccionCrear); btnCrear.classList.add('active'); btnVer.classList.remove('active'); });
btnVolver.addEventListener('click', () => { cambiarSeccion(seccionVer); });

function obtenerHistorias() {
    return JSON.parse(localStorage.getItem('mis-historias-pro')) || [];
}

function cargarHistorias() {
    const historias = obtenerHistorias();
    listaHistorias.innerHTML = '';

    if (historias.length === 0) {
        listaHistorias.innerHTML = '<p>No hay historias. ¡Anímate a escribir la primera!</p>';
        return;
    }

    historias.forEach((historia, index) => {
        const card = document.createElement('div');
        card.className = 'historia-card';
        // Si no puso portada, le ponemos un fondo gris por defecto
        const imagenUrl = historia.portada ? historia.portada : 'https://via.placeholder.com/300x450?text=Sin+Portada';
        
        card.innerHTML = `
            <img src="${imagenUrl}" alt="Portada" class="portada-miniatura">
            <div class="card-info">
                <h3>${historia.titulo}</h3>
                <p>${historia.contenido}</p>
            </div>
        `;
        
        // Al hacer clic, abrimos el modo lectura
        card.addEventListener('click', () => abrirModoLectura(index));
        listaHistorias.appendChild(card);
    });
}

function abrirModoLectura(index) {
    const historia = obtenerHistorias()[index];
    cambiarSeccion(seccionLeer);

    let htmlLectura = '';
    
    // Inyectamos la portada si existe
    if (historia.portada) {
        htmlLectura += `<img src="${historia.portada}" class="lector-portada">`;
    }
    
    htmlLectura += `<h1 class="lector-titulo">${historia.titulo}</h1>`;

    // Inyectamos el reproductor de YouTube si puso un link válido
    if (historia.musica) {
        const idVideo = obtenerIdYouTube(historia.musica);
        if (idVideo) {
            htmlLectura += `
                <div class="lector-musica">
                    <p style="font-size: 12px; color: #888; margin-bottom: 5px;">Dale play para ambientar tu lectura 🎵</p>
                    <iframe width="100%" height="150" src="https://www.youtube.com/embed/${idVideo}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
            `;
        }
    }

    htmlLectura += `<div class="lector-contenido">${historia.contenido}</div>`;
    lectorContenedor.innerHTML = htmlLectura;
}

formulario.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nuevaHistoria = {
        titulo: document.getElementById('titulo-historia').value,
        portada: document.getElementById('portada-historia').value,
        musica: document.getElementById('musica-historia').value,
        contenido: document.getElementById('contenido-historia').value
    };

    const historias = obtenerHistorias();
    historias.unshift(nuevaHistoria); // unshift la pone al principio de la lista
    localStorage.setItem('mis-historias-pro', JSON.stringify(historias));

    formulario.reset();
    cambiarSeccion(seccionVer);
    btnVer.classList.add('active');
    btnCrear.classList.remove('active');
    cargarHistorias();
});

// Iniciar app
cargarHistorias();