// --- VARIABLES GLOBALES ---
let historiasDb = []; 
let seccionLecturaActiva = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('lectura-contenido-dinamico');
    const chatWindow = document.getElementById('chat-window');
    
    // Secciones
    const sDescubrir = document.getElementById('seccion-descubrir');
    const sEscribir = document.getElementById('seccion-escribir');
    const sLectura = document.getElementById('seccion-lectura');
    const sBot = document.getElementById('seccion-bot');

    // Botones
    const bDescubre = document.getElementById('btn-descubre');
    const bCrea = document.getElementById('btn-crea');
    const bBot = document.getElementById('btn-bot');
    const bVolver = document.getElementById('btn-volver');

    // --- FUNCIÓN DE NAVEGACIÓN ---
    function showSection(section, button) {
        [sDescubrir, sEscribir, sLectura, sBot].forEach(s => s.classList.add('hidden-aero'));
        section.classList.remove('hidden-aero');
        document.querySelectorAll('.btn-aero-text').forEach(b => b.classList.remove('active'));
        if(button) button.classList.add('active');
    }

    // --- EVENTOS DE NAVEGACIÓN ---
    bDescubre.onclick = () => { showSection(sDescubrir, bDescubre); cargarHistorias(); };
    bCrea.onclick = () => showSection(sEscribir, bCrea);
    bBot.onclick = () => showSection(sBot, bBot);
    bVolver.onclick = () => showSection(sDescubrir, bDescubre);

    // --- FUNCIÓN: TRAER HISTORIAS DE NEON ---
    async function cargarHistorias() {
        try {
            gridDescubrir.innerHTML = '<p style="color:var(--aero-aqua-base); text-align:center;">Conectando con Neon...</p>';
            const respuesta = await fetch('/api/historias');
            historiasDb = await respuesta.json();
            
            gridDescubrir.innerHTML = '';
            historiasDb.forEach(h => {
                const div = document.createElement('div');
                div.className = 'historia-aero-card glassy-box';
                div.onclick = () => abrirLectura(h.id);
                
                // Muestra la primera imagen de las 5 o placeholder
                const miniatura = h.portada_url ? h.portada_url : 'https://via.placeholder.com/200x260?text=No+Cover';
                
                div.innerHTML = `
                    <img src="${miniatura}" class="portada-aero">
                    <h3 class="card-title">${h.titulo}</h3>
                    <p class="card-info">Por ${h.autor}</p>
                `;
                gridDescubrir.appendChild(div);
            });
        } catch (error) {
            console.error("Error Neon:", error);
            gridDescubrir.innerHTML = '<p style="color:red; text-align:center;">Fallo de conexión con Neon.</p>';
        }
    }

    // --- FUNCIÓN: ABRIR HISTORIA (Para comentarios por párrafo) ---
    function abrirLectura(id) {
        const historia = historiasDb.find(h => h.id === id);
        showSection(sLectura);

        panelLectura.innerHTML = `<h1 class="aero-title-glow" style="text-align:center;">${historia.titulo}</h1>`;

        // Divide por párrafos
        const parrafos = historia.texto.split(/\n+/);
        parrafos.forEach((p, index) => {
            if (p.trim() === '') return; 
            
            const div = document.createElement('div');
            div.className = 'parrafo-container mb-20';
            div.style.position = 'relative';
            div.innerHTML = `
                <p class="parrafo-texto" style="font-size:16px;">${p}</p>
                <button class="btn-aero-text" style="position:absolute; right:0; top:0; padding:2px 8px; font-size:11px;">
                    💬 <span class="contador-cmt">0</span>
                </button>
            `;
            panelLectura.appendChild(div);
        });

        // Simula la Sidebar
        document.getElementById('opiniones-contenedor').innerHTML = '<p style="font-size:12px; font-style:italic; color:var(--text-grey);">Comentarios por párrafo coming soon...</p>';
    }

    // --- LÓGICA DE PREVIEW DE FOTOS (Hasta 5 imágenes) ---
    const inputFotos = document.getElementById('fotos-historia');
    const previewGrid = document.getElementById('preview-fotos');

    inputFotos.addEventListener('change', (e) => {
        previewGrid.innerHTML = '';
        const files = Array.from(e.target.files).slice(0, 5); // Tomamos máximo 5

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-img glassy-box';
                    previewGrid.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // --- LÓGICA DEL CHATBOT ---
    const bEnviarBot = document.getElementById('btn-enviar-bot');
    const inputBot = document.getElementById('input-bot');

    if (bEnviarBot) {
        bEnviarBot.onclick = async () => {
            const msj = inputBot.value.trim();
            if (!msj) return;

            // Mensaje usuario
            chatWindow.innerHTML += `<div class="msg-user"><p>${msj}</p></div>`;
            inputBot.value = '';
            chatWindow.scrollTop = chatWindow.scrollHeight;

            try {
                const res = await fetch('/api/chat-bot', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ mensaje: msj })
                });
                const data = await res.json();
                
                // Mensaje Bot
                chatWindow.innerHTML += `
                    <div class="msg-bot">
                        <span class="opinion-aero-author">Bot:</span>
                        <p>${data.respuesta}</p>
                    </div>`;
                chatWindow.scrollTop = chatWindow.scrollHeight;
            } catch (e) {
                console.error("Error Bot:", e);
                chatWindow.innerHTML += `<div class="msg-bot"><p style="color:red;">Error de conexión.</p></div>`;
            }
        };
    }

    // Carga inicial
    cargarHistorias();
});
