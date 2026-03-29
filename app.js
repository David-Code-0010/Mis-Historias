// Base de datos de prueba de Mis-Historias
// Los comentarios están organizados por el índice del párrafo (0, 1, 2...)
let historiasDb = [
    { 
        id: 1, 
        titulo: 'Oscuridad Neón', 
        autor: 'Cyber_Anna',
        portada: 'https://via.placeholder.com/200x300?text=Neón',
        texto: "La luz de la ciudad se reflejaba en el asfalto mojado. Todo era azul y naranja.\n\nÉl me miró con esos ojos que parecían circuitos integrados y supe que estaba perdida.\n\nNo había vuelta atrás, el sistema nos había detectado.",
        comentarios: {
            0: ["¡Amo esa descripción del asfalto!"],
            1: ["Vibras estéticas totales", "Qué intenso"],
            2: []
        }
    },
    { 
        id: 2, 
        titulo: 'Reglas del Juego', 
        autor: 'AeroWriter',
        portada: 'https://via.placeholder.com/200x300?text=Reglas',
        texto: "Regla número 1: No confíes en nadie con un perfil sin foto.\n\nRegla número 2: Nunca reveles tu verdadera identidad en la red.",
        comentarios: {
            0: ["Totalmente cierto jaja", "Qué intenso inicio"],
            1: []
        }
    }
];

// Variables globales del estado
let historiaActivaId = null;
let parrafoActivoIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');
    
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');

    // --- RENDERIZAR BIBLIOTECA INICIAL ---
    function renderInicio(datos = historiasDb) {
        gridDescubrir.innerHTML = '';
        if (datos.length === 0) {
            gridDescubrir.innerHTML = '<p style="color:var(--text-grey);">No se encontraron historias.</p>';
            return;
        }

        datos.forEach(h => {
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

    // --- BUSCADOR (Enter Key) ---
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const busqueda = searchInput.value.toLowerCase();
            const filtradas = historiasDb.filter(h => h.titulo.toLowerCase().includes(busqueda) || h.autor.toLowerCase().includes(busqueda));
            document.getElementById('btn-descubre').click();
            renderInicio(filtradas);
        }
    });

    // --- FUNCIÓN: ABRIR HISTORIA Y DIVIDIR EN PÁRRAFOS ---
    function abrirLectura(id) {
        const historia = historiasDb.find(h => h.id === id);
        historiaActivaId = id;
        parrafoActivoIndex = null; 
        
        seccionDescubrir.classList.add('hidden-aero');
        seccionEscribir.classList.add('hidden-aero');
        seccionLectura.classList.remove('hidden-aero');

        // Renderizar Título
        panelLectura.innerHTML = `<h1 class="aero-title-glow" style="margin-bottom: 20px;">${historia.titulo}</h1>`;

        // Dividir el texto en párrafos
        const parrafos = historia.texto.split(/\n+/);
        
        parrafos.forEach((p, index) => {
            if (p.trim() === '') return; 
            
            // Si el objeto de comentarios no existe para este párrafo, crearlo
            if (!historia.comentarios[index]) historia.comentarios[index] = [];
            
            const numComentarios = historia.comentarios[index].length;
            
            // Crear el contenedor del párrafo con su botón flotante
            const div = document.createElement('div');
            div.className = 'parrafo-container';
            div.innerHTML = `
                <p class="parrafo-texto">${p}</p>
                <button class="btn-comentar-parrafo" onclick="abrirComentarios(${id}, ${index})">
                    💬 <span id="contador-${id}-${index}">${numComentarios}</span>
                </button>
            `;
            panelLectura.appendChild(div);
        });

        // Limpiar Sidebar
        tituloOpiniones.innerText = 'LECTORES OPINAN ✨';
        panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey);">Haz clic en el icono 💬 de un párrafo para ver u opinar.</p>';
        cajaComentario.classList.add('hidden-aero');
    }

    // --- FUNCIÓN GLOBAL: ABRIR COMENTARIOS DE UN PÁRRAFO ---
    window.abrirComentarios = (idHistoria, indexParrafo) => {
        historiaActivaId = idHistoria;
        parrafoActivoIndex = indexParrafo;
        
        const historia = historiasDb.find(h => h.id === idHistoria);
        const comentarios = historia.comentarios[indexParrafo];

        // Actualizar UI del Sidebar
        tituloOpiniones.innerText = `PÁRRAFO ${indexParrafo + 1} ✨`;
        cajaComentario.classList.remove('hidden-aero');
        panelOpiniones.innerHTML = '';

        if (comentarios.length > 0) {
            comentarios.forEach(comentario => {
                panelOpiniones.innerHTML += `
                    <div class="opinion-aero">
                        <div>
                            <span class="opinion-aero-author">Tú (Lector)</span>
                            <p class="opinion-aero-text">${comentario}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey);">Sé el primero en opinar en este párrafo.</p>';
        }
    };

    // --- ENVIAR NUEVO COMENTARIO ---
    document.getElementById('btn-enviar-comentario').addEventListener('click', () => {
        const inputCmt = document.getElementById('input-nuevo-comentario');
        const textoCmt = inputCmt.value.trim();

        if (textoCmt !== '' && historiaActivaId !== null && parrafoActivoIndex !== null) {
            const historia = historiasDb.find(h => h.id === historiaActivaId);
            historia.comentarios[parrafoActivoIndex].push(textoCmt);
            
            inputCmt.value = '';
            window.abrirComentarios(historiaActivaId, parrafoActivoIndex);
            document.getElementById(`contador-${historiaActivaId}-${parrafoActivoIndex}`).innerText = historia.comentarios[parrafoActivoIndex].length;
        }
    });

    // --- NAVEGACIÓN Y OTROS EVENTOS ---
    document.getElementById('btn-descubre').addEventListener('click', () => {
        seccionDescubrir.classList.remove('hidden-aero');
        seccionLectura.classList.add('hidden-aero');
        seccionEscribir.classList.add('hidden-aero');
        tituloOpiniones.innerText = 'LECTORES OPINAN ✨';
        panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey); font-size:12px; font-style:italic;">Selecciona una historia para ver los comentarios.</p>';
        cajaComentario.classList.add('hidden-aero');
        renderInicio(); 
    });

    document.getElementById('btn-volver').addEventListener('click', () => document.getElementById('btn-descubre').click());

    document.getElementById('btn-crea').addEventListener('click', () => {
        seccionDescubrir.classList.add('hidden-aero');
        seccionLectura.classList.add('hidden-aero');
        seccionEscribir.classList.remove('hidden-aero');
    });

    // --- SUBIDA FOTOS (Responsive Preview) ---
    const inputFotos = document.getElementById('fotos-historia');
    const previewGrid = document.getElementById('preview-fotos');

    inputFotos.addEventListener('change', function(e) {
        previewGrid.innerHTML = '';
        const files = Array.from(e.target.files).slice(0, 5);
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

    // --- PUBLICAR HISTORIA ---
    document.getElementById('formulario-historia').addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = document.getElementById('titulo-historia').value;
        const contenido = document.getElementById('contenido-historia').value;
        const imagenesPreview = document.querySelectorAll('.preview-img');
        const portadaFinal = imagenesPreview.length > 0 ? imagenesPreview[0].src : 'https://via.placeholder.com/200x300?text=Nueva+Historia';

        const nuevaHistoria = {
            id: historiasDb.length + 1,
            titulo: titulo,
            autor: 'Tú (Autor)',
            portada: portadaFinal,
            texto: contenido,
            comentarios: {} // Objeto vacío para que el algoritmo cree los arreglos por índice
        };

        historiasDb.unshift(nuevaHistoria);
        alert('¡Tu historia "' + titulo + '" se ha publicado con éxito!');
        e.target.reset();
        previewGrid.innerHTML = '';
        document.getElementById('btn-descubre').click();
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

    // Iniciar
    renderInicio();
});
