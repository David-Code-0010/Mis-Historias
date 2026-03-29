// Base de datos de prueba de Mis-Historias
const historiasDb = [
    { 
        id: 1, 
        titulo: 'Oscuridad Neón', 
        autor: 'Cyber_Anna',
        portada: 'https://via.placeholder.com/200x300?text=Neón',
        texto: "La luz de la ciudad se reflejaba en el asfalto mojado. Todo era azul y naranja. Él me miró con esos ojos que parecían circuitos integrados y supe que estaba perdida.",
        comentarios: ["¡Amo esa descripción del asfalto!", "Vibras estéticas totales", "Necesito el próximo capítulo YA"]
    },
    { 
        id: 2, 
        titulo: 'Reglas del Juego', 
        autor: 'AeroWriter',
        portada: 'https://via.placeholder.com/200x300?text=Reglas',
        texto: "Regla número 1: No confíes en nadie con un perfil sin foto.",
        comentarios: ["Totalmente cierto jaja", "Qué intenso inicio"]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');

    // --- RENDERIZAR BIBLIOTECA INICIAL ---
    function renderInicio() {
        gridDescubrir.innerHTML = '';
        historiasDb.forEach(h => {
            const div = document.createElement('div');
            div.className = 'historia-aero-card glassy-box';
            div.onclick = () => abrirLectura(h.id);
            div.innerHTML = `
                <img src="${h.portada}" class="portada-aero" alt="${h.titulo}">
                <h3 class="card-title">${h.titulo}</h3>
                <p class="card-info">Por ${h.autor}</p>
            `;
            gridDescubrir.appendChild(div);
        });
    }

    // --- FUNCIÓN: ABRIR HISTORIA Y CARGAR COMENTARIOS ---
    function abrirLectura(id) {
        const historia = historiasDb.find(h => h.id === id);
        
        // Cambiar Vistas
        seccionDescubrir.classList.add('hidden-aero');
        seccionEscribir.classList.add('hidden-aero');
        seccionLectura.classList.remove('hidden-aero');

        // Cargar Texto
        panelLectura.innerHTML = `
            <h1 class="aero-title-glow" style="margin-bottom: 20px;">${historia.titulo}</h1>
            <p style="font-size: 16px; line-height: 1.8;">${historia.texto}</p>
        `;

        // Cargar Sidebar de Opiniones
        panelOpiniones.innerHTML = '';
        if (historia.comentarios.length > 0) {
            historia.comentarios.forEach(comentario => {
                panelOpiniones.innerHTML += `
                    <div class="opinion-aero">
                        <img src="https://via.placeholder.com/30" class="avatar-aero">
                        <div>
                            <span class="opinion-aero-author">Lector Anónimo</span>
                            <p class="opinion-aero-text">${comentario}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey);">Sé el primero en opinar.</p>';
        }
    }

    // --- NAVEGACIÓN ---
    document.getElementById('btn-descubre').addEventListener('click', () => {
        seccionDescubrir.classList.remove('hidden-aero');
        seccionLectura.classList.add('hidden-aero');
        seccionEscribir.classList.add('hidden-aero');
        panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey); font-size:12px; font-style:italic;">Selecciona una historia para ver los comentarios.</p>';
    });

    document.getElementById('btn-volver').addEventListener('click', () => {
        document.getElementById('btn-descubre').click();
    });

    document.getElementById('btn-crea').addEventListener('click', () => {
        seccionDescubrir.classList.add('hidden-aero');
        seccionLectura.classList.add('hidden-aero');
        seccionEscribir.classList.remove('hidden-aero');
    });

    // --- SUBIDA DE 5 FOTOS (Previsualización) ---
    const inputFotos = document.getElementById('fotos-historia');
    const previewGrid = document.getElementById('preview-fotos');

    inputFotos.addEventListener('change', function(e) {
        previewGrid.innerHTML = '';
        const files = Array.from(e.target.files).slice(0, 5); // Limitar a 5
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-img';
                    previewGrid.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // --- SELECTOR DE IDIOMAS ---
    const langSelector = document.getElementById('lang-selector-aero');
    const langDropdown = document.getElementById('lang-dropdown');
    const currentLangText = document.getElementById('current-lang');

    langSelector.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden-aero');
    });

    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden-aero');
    });

    langDropdown.addEventListener('click', (e) => {
        if(e.target.tagName === 'LI') {
            currentLangText.textContent = e.target.textContent;
        }
    });

    // Iniciar el renderizado
    renderInicio();
});
