// --- BASE DE DATOS LOCAL (Simulada para 2012) ---
const stories = [
    { 
        id: 1, 
        title: 'Ángel y Demonio', 
        author: 'Anna Todd', 
        category: 'romance',
        content: [
            "Él era el caos personificado, una tormenta negra en mi mundo perfecto.",
            "Sus ojos brillaban con ese verde neón que tanto me aterraba y me atraía.",
            "Cerré la puerta de la habitación, sabiendo que mi vida nunca sería la misma."
        ],
        cover: 'https://via.placeholder.com/200x300?text=Angel+y+Demonio'
    },
    { 
        id: 2, 
        title: 'ROMPIENDO REGLAS', 
        author: 'Ariana Godoy', 
        category: 'romance',
        content: ["Regla número uno: No te enamores del vecino."],
        cover: 'https://via.placeholder.com/200x300?text=Rompiendo+Reglas'
    }
];

// --- SELECTORES ---
const sections = {
    descubrir: document.getElementById('seccion-descubrir'),
    escribir: document.getElementById('seccion-escribir'),
    lectura: document.getElementById('seccion-lectura')
};

const navButtons = {
    descubre: document.getElementById('btn-descubre'),
    crea: document.getElementById('btn-crea'),
    volver: document.getElementById('btn-volver')
};

const searchInput = document.getElementById('search-input');

// --- NAVEGACIÓN ---
function showSection(targetKey) {
    Object.keys(sections).forEach(key => {
        sections[key].classList.add('hidden-aero');
    });
    sections[targetKey].classList.remove('hidden-aero');
    // Si volvemos a descubrir, reseteamos la lista completa
    if(targetKey === 'descubrir') renderHome(stories);
}

navButtons.descubre.addEventListener('click', () => showSection('descubrir'));
navButtons.crea.addEventListener('click', () => showSection('escribir'));
navButtons.volver.onclick = () => showSection('descubrir');

// --- LÓGICA DEL BUSCADOR (FILTRADO) ---
function ejecutarBusqueda() {
    const termino = searchInput.value.toLowerCase();
    const historiasFiltradas = stories.filter(s => 
        s.title.toLowerCase().includes(termino) || 
        s.author.toLowerCase().includes(termino)
    );
    
    // Mostramos los resultados en la sección de descubrir
    showSection('descubrir');
    renderHome(historiasFiltradas);

    if(historiasFiltradas.length === 0) {
        document.getElementById('lista-historias-descubrir').innerHTML = `<p class="aero-subtitle">No se encontraron historias para "${termino}"</p>`;
    }
}

// 1. Detectar ENTER en el buscador
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        ejecutarBusqueda();
    }
});

// 2. Detectar clic en el botón de la lupa (si lo hay)
document.querySelector('.btn-search-aero')?.addEventListener('click', ejecutarBusqueda);


// --- FUNCIÓN: ABRIR HISTORIA ---
function openStory(id) {
    const story = stories.find(s => s.id === id);
    const container = document.getElementById('contenido-lectura-dinamico');
    container.innerHTML = `<h1 class="aero-title-glow">${story.title}</h1><p class="book-author mb-8">por ${story.author}</p>`;

    story.content.forEach((paragraph, index) => {
        const pElement = document.createElement('div');
        pElement.className = 'paragraph-container';
        pElement.innerHTML = `
            <p class="readable-paragraph">${paragraph}</p>
            <button class="btn-comment-bubble" onclick="toggleCommentBox(${index})">💬</button>
            <div id="comment-box-${index}" class="comment-input-area hidden-aero">
                <input type="text" placeholder="Escribe un comentario..." class="aero-input-small">
                <button class="btn-aero-submit-small">Post</button>
            </div>
        `;
        container.appendChild(pElement);
    });

    showSection('lectura');
}

window.toggleCommentBox = function(index) {
    const box = document.getElementById(`comment-box-${index}`);
    box.classList.toggle('hidden-aero');
};

// --- RENDERIZADO DE PORTADAS ---
function renderHome(listaAEnviar) {
    const grid = document.getElementById('lista-historias-descubrir');
    grid.innerHTML = '';
    listaAEnviar.forEach(story => {
        const card = document.createElement('div');
        card.className = 'historia-aero-card';
        card.onclick = () => openStory(story.id);
        card.innerHTML = `
            <img src="${story.cover}" class="portada-aero glassy-box">
            <h3 class="card-title">${story.title}</h3>
            <p class="card-info">${story.author}</p>
        `;
        grid.appendChild(card);
    });
}

// --- IDIOMA ---
const langBtn = document.getElementById('lang-selector-aero');
const langMenu = document.getElementById('lang-dropdown');

langBtn.onclick = (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('hidden-aero');
};

document.onclick = () => langMenu.classList.add('hidden-aero');

langMenu.onclick = (e) => {
    if(e.target.tagName === 'LI') {
        document.getElementById('current-lang').textContent = e.target.textContent;
    }
};

// --- FORMULARIO ESCRIBIR (LOGICA BASICA) ---
document.getElementById('formulario-historia').onsubmit = (e) => {
    e.preventDefault();
    const titulo = document.getElementById('titulo-historia').value;
    const contenido = document.getElementById('contenido-historia').value;
    
    // Añadimos la nueva historia al array para que aparezca en el buscador e inicio
    const nueva = {
        id: stories.length + 1,
        title: titulo,
        author: "Tú (Escritor Dark Aero)",
        content: [contenido],
        cover: 'https://via.placeholder.com/200x300?text=Mi+Obra'
    };
    
    stories.push(nueva);
    alert("¡Historia publicada con éxito!");
    showSection('descubrir');
};

// Inicialización
renderHome(stories);
