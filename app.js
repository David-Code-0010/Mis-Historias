// --- BASE DE DATOS LOCAL (Simulada para 2012) ---
const stories = [
    { 
        id: 1, 
        title: 'Ángel y Demonio', 
        author: 'Anna Todd', 
        content: [
            "Él era el caos personificado, una tormenta negra en mi mundo perfecto.",
            "Sus ojos brillaban con ese verde neón que tanto me aterraba y me atraía.",
            "Cerré la puerta de la habitación, sabiendo que mi vida nunca sería la misma."
        ],
        cover: 'https://via.placeholder.com/200x300?text=Angel+y+Demonio'
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
    crea: document.getElementById('btn-crea')
};

// --- NAVEGACIÓN DEL EXPLORADOR ---
function showSection(targetKey) {
    Object.keys(sections).forEach(key => {
        sections[key].classList.add('hidden-aero');
    });
    sections[targetKey].classList.remove('hidden-aero');
}

navButtons.descubre.addEventListener('click', () => showSection('descubrir'));
navButtons.crea.addEventListener('click', () => showSection('escribir'));

// --- FUNCIÓN: ABRIR HISTORIA ---
function openStory(id) {
    const story = stories.find(s => s.id === id);
    const container = document.getElementById('contenido-lectura');
    container.innerHTML = `<h1 class="aero-title-glow">${story.title}</h1><p class="book-author mb-8">por ${story.author}</p>`;

    story.content.forEach((paragraph, index) => {
        const pElement = document.createElement('div');
        pElement.className = 'paragraph-container';
        pElement.innerHTML = `
            <p class="readable-paragraph">${paragraph}</p>
            <button class="btn-comment-bubble" onclick="toggleCommentBox(${index})">💬</button>
            <div id="comment-box-${index}" class="comment-input-area hidden-aero">
                <input type="text" placeholder="Escribe un comentario en este párrafo..." class="aero-input-small">
                <button class="btn-aero-submit-small">Publicar</button>
            </div>
        `;
        container.appendChild(pElement);
    });

    showSection('lectura');
}

// --- COMENTARIOS POR PÁRRAFO ---
window.toggleCommentBox = function(index) {
    const box = document.getElementById(`comment-box-${index}`);
    box.classList.toggle('hidden-aero');
};

// --- RENDERIZADO DE PORTADAS ---
function renderHome() {
    const grid = document.getElementById('lista-historias-descubrir');
    grid.innerHTML = '';
    stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'historia-aero-card';
        card.onclick = () => openStory(story.id);
        card.innerHTML = `
            <img src="${story.cover}" class="portada-aero">
            <h3 class="card-title">${story.title}</h3>
            <p class="card-info">${story.author}</p>
        `;
        grid.appendChild(card);
    });
}

// --- SELECTOR DE IDIOMA ---
const langBtn = document.getElementById('lang-selector-aero');
const langMenu = document.getElementById('lang-dropdown');

langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('hidden-aero');
});

langMenu.addEventListener('click', (e) => {
    if(e.target.tagName === 'LI') {
        document.getElementById('current-lang').textContent = e.target.textContent;
    }
});

// Inicializar
renderHome();
document.getElementById('btn-volver').onclick = () => showSection('descubrir');
