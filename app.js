// app.js

// --- BASE DE DATOS LOCAL SKEUOMÓRFICA (Estilo 2012) ---
// Placeholders de 5 imágenes skeuo para la destacada
const stories = [
    { 
        id: 1, 
        title: 'Ángel y Demonio', 
        author: 'Anna Todd', 
        category: 'romance',
        // Carrusel de portadas skeuo (placeholders)
        covers: [
            'https://via.placeholder.com/200x300?text=Cover+1',
            'https://via.placeholder.com/200x300?text=Cover+2',
            'https://via.placeholder.com/200x300?text=Cover+3'
        ],
        // Texto de lectura con comentarios reales de lectores por renglón/párrafo
        content: [
            { text: "Él era el caos personificado, una tormenta negra en mi mundo perfecto.", comments: ["Increíble inicio!", "OMG Amo"] },
            { text: "Sus ojos brillaban con ese verde neón que tanto me aterraba y me atraía.", comments: ["Ese neón Aero!"] },
            { text: "Cerré la puerta de la habitación, sabiendo que mi vida nunca sería la misma.", comments: ["Postea ya!", "F"] }
        ]
    },
    { id: 2, title: 'ROMPIENDO REGLAS', author: 'Ariana Godoy', category: 'romance', covers: ['https://via.placeholder.com/200x300?text=Rules'], content: [{ text: "Regla número uno: No te enamores." }] }
];

// --- SELECTORES ---
const sections = { descubri: document.getElementById('seccion-descubrir'), escribi: document.getElementById('seccion-escribir'), lectura: document.getElementById('seccion-lectura') };
const navButtons = { descubre: document.getElementById('btn-descubre'), crea: document.getElementById('btn-crea'), volver: document.getElementById('btn-volver') };
const searchInput = document.getElementById('search-input');
const opinionesContenedor = document.getElementById('opiniones-contenedor');

// --- NAVEGACIÓN Layout ---
function showSection(targetKey) {
    Object.keys(sections).forEach(key => sections[key].classList.add('hidden-aero'));
    sections[targetKey].classList.remove('hidden-aero');
    // UX: Limpiar Sidebar al salir de lectura
    if(targetKey !== 'lectura') opinionesContenedor.innerHTML = '<p class="empty-msg">Selecciona una historia...</p>';
}

navButtons.descubre.addEventListener('click', () => { showSection('descubri'); renderHome(); });
navButtons.crea.addEventListener('click', () => showSection('escribi'));
navButtons.volver.onclick = () => showSection('descubri');

// --- LÓGICA DEL BUSCADOR (Enter) ---
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const termino = searchInput.value.toLowerCase();
        const historiasFiltradas = stories.filter(s => s.title.toLowerCase().includes(termino));
        showSection('descubri');
        renderHome(historiasFiltradas);
    }
});

// --- FUNCIÓN: ABRIR HISTORIA & CARGAR SIDEBAR DINÁMICO ---
function openStory(id) {
    const story = stories.find(s => s.id === id);
    const containerLectura = document.getElementById('contenido-lectura-dinamico');
    
    // 1. Limpiar y Cargar Sidebar: LECTORES OPINAN reales
    opinionesContenedor.innerHTML = '';
    let opinionesHtml = '';
    story.content.forEach((paragraph, index) => {
        if(paragraph.comments && paragraph.comments.length > 0) {
            paragraph.comments.forEach(msg => {
                opinionesHtml += `
                    <div class="opinion-aero">
                        <p class="opinion-aero-text">
                            <span class="opinion-aero-author">Párrafo ${index + 1} lector</span>: ${msg}
                        </p>
                    </div>`;
            });
        }
    });
    opinionesContenedor.innerHTML = opinionesHtml || '<p class="empty-msg">Aún no hay comentarios.</p>';

    // 2. Cargar Modo Lectura skeuo con burbujas
    containerLectura.innerHTML = `<h1 class="aero-title-glow mb-10">${story.title}</h1>`;
    story.content.forEach((paragraph, index) => {
        containerLectura.innerHTML += `
            <div class="readable-paragraph">
                <p>${paragraph.text}</p>
                <button class="btn-comment-bubble" onclick="toggleCommentBox(${index})">💬</button>
                <div id="comment-box-${index}" class="comment-input-area hidden-aero">
                    <input type="text" placeholder="Escribe..." class="aero-input-small">
                    <button class="btn-aero-submit-small">Post</button>
                </div>
            </div>`;
    });
    showSection('lectura');
}

// Lógica de burbujas
window.toggleCommentBox = function(index) {
    document.getElementById(`comment-box-${index}`).classList.toggle('hidden-aero');
};

// --- RENDERIZADO DE PORTADAS CON CARRUSEL Layout ---
function renderHome(listaABuscar = stories) {
    const grid = document.getElementById('lista-historias-descubrir');
    grid.innerHTML = '';
    listaABuscar.forEach(story => {
        const card = document.createElement('div');
        card.className = 'historia-aero-card glassy-box p-4';
        card.innerHTML = `
            <img src="${story.covers[0]}" class="portada-aero" onclick="openStory(${story.id})">
            <h3 class="card-title">${story.title}</h3>
            <p class="card-info">${story.author}</p>
        `;
        grid.appendChild(card);
    });
}

// --- IDIOMAS Lógica con UX Mejorada ---
const langBtn = document.getElementById('lang-selector-aero');
const langMenu = document.getElementById('lang-dropdown');
langBtn.onclick = (e) => { e.stopPropagation(); langMenu.classList.toggle('hidden-aero'); };
document.onclick = () => langMenu.classList.add('hidden-aero');
langMenu.onclick = (e) => { if(e.target.tagName === 'LI') document.getElementById('current-lang').textContent = e.target.textContent; };

// Inicialización
renderHome();
