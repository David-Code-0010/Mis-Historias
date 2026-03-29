let stories = [
    { 
        id: 1, 
        title: 'Ángel y Demonio', 
        author: 'Anna Todd', 
        images: [
            'https://via.placeholder.com/200x300/001/0cf?text=Img+1',
            'https://via.placeholder.com/200x300/002/0cf?text=Img+2',
            'https://via.placeholder.com/200x300/003/0cf?text=Img+3'
        ],
        currentImg: 0,
        content: ["Él era el caos personificado...", "Sus ojos brillaban neón."],
        comments: { 0: ["Increíble inicio", "Amo esto"], 1: ["Ese color es Dark Aero!"] }
    }
];

// --- RENDERIZADO CON CARRUSEL ---
function renderHome(data) {
    const grid = document.getElementById('lista-historias-descubrir');
    grid.innerHTML = '';
    data.forEach(story => {
        const card = document.createElement('div');
        card.className = 'historia-aero-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${story.images[story.currentImg]}" class="portada-aero" onclick="openStory(${story.id})">
                <button class="carousel-btn btn-prev" onclick="changeImg(${story.id}, -1, event)">◀</button>
                <button class="carousel-btn btn-next" onclick="changeImg(${story.id}, 1, event)">▶</button>
            </div>
            <h3 onclick="openStory(${story.id})">${story.title}</h3>
        `;
        grid.appendChild(card);
    });
}

window.changeImg = function(id, dir, e) {
    e.stopPropagation();
    const story = stories.find(s => s.id === id);
    story.currentImg = (story.currentImg + dir + story.images.length) % story.images.length;
    renderHome(stories);
};

// --- BUSCADOR ---
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const term = e.target.value.toLowerCase();
        const filtered = stories.filter(s => s.title.toLowerCase().includes(term));
        renderHome(filtered);
    }
});

// --- LECTURA Y SIDEBAR ---
function openStory(id) {
    const story = stories.find(s => s.id === id);
    const container = document.getElementById('contenido-lectura-dinamico');
    const side = document.getElementById('opiniones-contenedor');
    
    container.innerHTML = `<h1 class="aero-title-glow">${story.title}</h1>`;
    side.innerHTML = ''; // Limpiar sidebar

    story.content.forEach((p, i) => {
        // Cargar comentarios existentes en el sidebar
        if(story.comments[i]) {
            story.comments[i].forEach(msg => {
                side.innerHTML += `<div class="comment-sidebar-item"><b>Párrafo ${i+1}:</b> ${msg}</div>`;
            });
        }
        
        container.innerHTML += `
            <div class="paragraph-container">
                <p>${p}</p>
                <button class="btn-comment-bubble" onclick="toggleCommentBox(${i})">💬</button>
                <div id="comment-box-${i}" class="comment-input-area hidden-aero">
                    <input type="text" id="input-${i}" class="aero-input-small">
                    <button onclick="addComment(${story.id}, ${i})">Post</button>
                </div>
            </div>`;
    });
    showSection('lectura');
}

window.addComment = function(storyId, pIndex) {
    const val = document.getElementById(`input-${pIndex}`).value;
    if(!val) return;
    const story = stories.find(s => s.id === storyId);
    if(!story.comments[pIndex]) story.comments[pIndex] = [];
    story.comments[pIndex].push(val);
    openStory(storyId); // Refrescar para ver el comentario en el sidebar
};

// --- NAVEGACIÓN BÁSICA ---
function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden-aero'));
    document.getElementById(`seccion-${id}`).classList.remove('hidden-aero');
    if(id === 'descubrir') {
        document.getElementById('opiniones-contenedor').innerHTML = '<p class="empty-msg">Selecciona una historia...</p>';
    }
}

document.getElementById('btn-descubre').onclick = () => showSection('descubrir');
document.getElementById('btn-crea').onclick = () => showSection('escribir');
document.getElementById('btn-volver').onclick = () => showSection('descubrir');

// --- IDIOMAS ---
const langBtn = document.getElementById('lang-selector-aero');
const langMenu = document.getElementById('lang-dropdown');
langBtn.onclick = (e) => { e.stopPropagation(); langMenu.classList.toggle('hidden-aero'); };
document.onclick = () => langMenu.classList.add('hidden-aero');

renderHome(stories);
