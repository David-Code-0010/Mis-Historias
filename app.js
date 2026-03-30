let historiasDb = []; 

document.addEventListener('DOMContentLoaded', () => {
    // Selectores de secciones
    const sDescubrir = document.getElementById('seccion-descubrir');
    const sEscribir = document.getElementById('seccion-escribir');
    const sLectura = document.getElementById('seccion-lectura');
    const sBot = document.getElementById('seccion-bot');

    // Botones de navegación
    const bDescubre = document.getElementById('btn-descubre');
    const bCrea = document.getElementById('btn-crea');
    const bBot = document.getElementById('btn-bot');
    const bVolver = document.getElementById('btn-volver');

    function showSection(section, button) {
        [sDescubrir, sEscribir, sLectura, sBot].forEach(s => s.classList.add('hidden-aero'));
        section.classList.remove('hidden-aero');
        document.querySelectorAll('.btn-aero-text').forEach(b => b.classList.remove('active'));
        if(button) button.classList.add('active');
    }

    // Eventos
    bDescubre.onclick = () => { showSection(sDescubrir, bDescubre); cargarHistorias(); };
    bCrea.onclick = () => showSection(sEscribir, bCrea);
    bBot.onclick = () => showSection(sBot, bBot);
    bVolver.onclick = () => showSection(sDescubrir, bDescubre);

    // Cargar historias de la API (Neon)
    async function cargarHistorias() {
        const grid = document.getElementById('lista-historias-descubrir');
        try {
            grid.innerHTML = '<p>Sincronizando con Neon...</p>';
            const res = await fetch('/api/historias');
            historiasDb = await res.json();
            grid.innerHTML = historiasDb.map(h => `
                <div class="historia-aero-card glassy-box p-20" onclick="window.abrirLectura(${h.id})">
                    <img src="${h.portada_url || 'https://via.placeholder.com/200x260?text=Neon+Story'}" class="portada-aero" style="width:100%; height:260px; object-fit:cover;">
                    <h3 class="card-title" style="color:var(--aero-aqua-base); margin-top:10px;">${h.titulo}</h3>
                    <p class="card-info">Por ${h.autor}</p>
                </div>
            `).join('');
        } catch (e) {
            grid.innerHTML = '<p style="color:red">Error de conexión con Neon.</p>';
        }
    }

    // Preview de imágenes
    const inputFotos = document.getElementById('fotos-historia');
    inputFotos.onchange = (e) => {
        const preview = document.getElementById('preview-fotos');
        preview.innerHTML = '';
        Array.from(e.target.files).slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                preview.innerHTML += `<img src="${ev.target.result}" class="preview-img">`;
            };
            reader.readAsDataURL(file);
        });
    };

    cargarHistorias();
});

// Función global para abrir lectura
window.abrirLectura = (id) => {
    const sLectura = document.getElementById('seccion-lectura');
    const sDescubrir = document.getElementById('seccion-descubrir');
    const panel = document.getElementById('lectura-contenido-dinamico');
    
    const historia = historiasDb.find(h => h.id === id);
    if(historia) {
        sDescubrir.classList.add('hidden-aero');
        sLectura.classList.remove('hidden-aero');
        panel.innerHTML = `<h1 class="aero-title-glow">${historia.titulo}</h1><p class="parrafo-texto">${historia.texto}</p>`;
    }
};
