// app.js

// VARIABLES PARA REFERENCIAR ELEMENTOS
const btnDescubre = document.getElementById('btn-descubre');
const btnCrea = document.getElementById('btn-crea');
const seccionDescubrir = document.getElementById('seccion-descubrir');
const seccionEscribir = document.getElementById('seccion-escribir');
const listaRomance = document.getElementById('lista-historias-descubrir');
const listaScifi = document.getElementById('lista-historias-descubrir-scifi');
const destacadaContenedor = document.getElementById('historia-destacada-contenedor');
const opinionesContenedor = document.getElementById('opiniones-contenedor');

const langSelector = document.getElementById('lang-selector-aero');
const langDropdown = document.getElementById('lang-dropdown');
const currentLangSpan = document.getElementById('current-lang');

// 1. DATOS PLACEHOLDER SKEUOMÓRFICOS (Estilo Wattpad 2012-2013)
// En la vida real, usaríamos links reales a imágenes
const romanceStories = [
  { id: 1, title: 'Ángel y Demonio', author: 'Anna Todd', reads: '14,940', cover: 'https://via.placeholder.com/200x300?text=Ángel+Y+Demonio' },
  { id: 2, title: 'ROMPIENDO REGLAS', author: 'Ariana Godoy', reads: '4,216', cover: 'https://via.placeholder.com/200x300?text=Rompiendo+Reglas' },
];

const scifiStories = [
  { id: 3, title: 'Un mundo feliz - Huxley', author: 'Ariana Godoy', reads: '3,805', cover: 'https://via.placeholder.com/200x300?text=Un+Mundo+Feliz' },
  { id: 4, title: 'Los Miserables, Victor Hugo', author: 'Anna Todd', reads: '3,459', cover: 'https://via.placeholder.com/200x300?text=Los+Miserables' },
];

const featuredStory = {
  title: 'An Evil Shadow - A Val Bosanquet Mystery',
  author: 'ajdavidson',
  reads: '210,500',
  cover: 'https://via.placeholder.com/100x150?text=Evil+Shadow',
  comment: 'Fans of Harlan Coben and James Patterson will enjoy this book...'
};

const opinions = [
  { author: 'TheGirlLost', comment: 'Aff re super Ya te dije k amo tu escrito ??!!! Xd hihi Pues te lo repito Amo no re Amo tu... ' },
  { author: 'LectoraNostalgica', comment: 'Me encanta este estilo skeuo me hace recordar mis inicios en Wattpad... ' }
];

// 2. GESTIÓN DE LA NAVEGACIÓN
function cambiarSeccion(mostrar, ocultar, btnActivar, btnDesactivar) {
    ocultar.classList.add('hidden-aero');
    mostrar.classList.remove('hidden-aero');
    btnDesactivar.classList.remove('active');
    btnActivar.classList.add('active');
}

btnDescubre.addEventListener('click', () => cambiarSeccion(seccionDescubrir, seccionEscribir, btnDescubre, btnCrea));
btnCrea.addEventListener('click', () => cambiarSeccion(seccionEscribir, seccionDescubrir, btnCrea, btnDescubre));

// 3. CARGA DINÁMICA DE HISTORIAS
function cargarStoriesGrid(lista, historias) {
    lista.innerHTML = '';
    historias.forEach(story => {
        const card = document.createElement('div');
        card.className = 'historia-aero-card';
        card.innerHTML = `
            <img src="${story.cover}" alt="Portada" class="portada-aero glassy-box">
            <h3 class="card-title">${story.title}</h3>
            <p class="card-info">${story.author}</p>
            <p class="card-info">${story.reads} leídos</p>
        `;
        lista.appendChild(card);
    });
}

function cargarDestacada() {
    destacadaContenedor.innerHTML = `
        <div class="destacada-card">
            <img src="${featuredStory.cover}" alt="destacada" class="portada-destacada-aero">
            <div class="destacada-info">
                <h4>${featuredStory.title}</h4>
                <p>${featuredStory.author}</p>
                <p>${featuredStory.comment}</p>
                <span class="mas-destacada">más ></span>
            </div>
        </div>
    `;
}

function cargarOpiniones() {
    opinionesContenedor.innerHTML = '';
    opiniones.forEach(opinion => {
        const opinionElement = document.createElement('div');
        opinionElement.className = 'opinion-aero';
        opinionElement.innerHTML = `
            <img src="https://via.placeholder.com/300x300?text=Avatar" alt="avatar" class="avatar-aero">
            <p class="opinion-aero-text">
                <span class="opinion-aero-author">${opinion.author}</span>: ${opinion.comment}
            </f>
        `;
        opinionesContenedor.appendChild(opinionElement);
    });
}

// 4. FUNCIONALIDAD SELECTOR DE IDIOMA SKEUO
// Hacemos que el dropdown aparezca/desaparezca skeuomórficamente
langSelector.addEventListener('click', function(event) {
    event.stopPropagation(); // Evita que se cierre al hacer clic dentro
    langDropdown.classList.toggle('hidden-aero');
});

// Cerramos el menú si se hace clic fuera
document.addEventListener('click', function() {
    langDropdown.classList.add('hidden-aero');
});

// Lógica de selección de idioma (No cambia el texto real, solo el display)
langDropdown.addEventListener('click', function(event) {
    const li = event.target.closest('li');
    if (li) {
        const selectedLang = li.textContent;
        const langCode = li.dataset.lang;
        
        currentLangSpan.textContent = selectedLang;
        // Podrías usar 'langCode' para guardar la preferencia en LocalStorage más adelante
    }
});

// INICIALIZACIÓN
cargarStoriesGrid(listaRomance, romanceStories);
cargarStoriesGrid(listaScifi, scifiStories);
cargarDestacada();
cargarOpiniones();
