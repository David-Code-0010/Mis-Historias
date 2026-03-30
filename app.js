let historiasDb = []; // Empieza vacío y se llena con la base de datos
let historiaActivaId = null;
let parrafoActivoIndex = null;
let carruselIndex = 0; 

document.addEventListener('DOMContentLoaded', () => {
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');
    
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');

    // Función: Trae las historias reales desde Neon
    async function cargarHistorias() {
        try {
            const respuesta = await fetch('/api/historias');
            const historiasBaseDatos = await respuesta.json();
            
            // Adaptamos los datos para que funcionen con tu diseño
            historiasDb = historiasBaseDatos.map(h => ({
                id: h.id,
                titulo: h.titulo,
                autor: h.autor,
                texto: h.texto,
                // 📸 NUEVO: Usamos la 'portada_url' real o una genérica si es null
                portadas: h.portada_url ? [h.portada_url] : ['https://via.placeholder.com/300x450/111/0cf?text=' + encodeURIComponent(h.titulo)],
                comentarios: {} // Comentarios vacíos por ahora
            }));
            
            renderInicio(historiasDb);
        } catch (error) {
            console.error("Error al conectar con la base de datos:", error);
            gridDescubrir.innerHTML = '<p style="color:red; text-align:center; padding:20px;">Error al cargar la base de datos. Verifica tu conexión.</p>';
        }
    }

    function renderInicio(datos = historiasDb) {
        gridDescubrir.innerHTML = '';
        if (datos.length === 0) {
            gridDescubrir.innerHTML = '<p style="color:var(--text-grey); text-align:center; width:100%; padding:20px;">Aún no hay historias guardadas. ¡Sé el primero en escribir una!</p>';
            return;
        }

        datos.forEach(h => {
            const div = document.createElement('div');
            div.className = 'historia-aero-card glassy-box';
            div.onclick = () => abrirLectura(h.id);
            const miniatura = h.portadas.length > 0 ? h.portadas[0] : 'https://via.placeholder.com/200x300?text=No+Cover';
            div.innerHTML = `
                <img src="${miniatura}" class="portada-aero" alt="${h.titulo}">
                <h3 class="card-title">${h.titulo}</h3>
                <p class="card-info">Por ${h.autor}</p>
            `;
            gridDescubrir.appendChild(div);
        });
    }

    // --- Lógica de Búsqueda (Sin cambios) ---
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

    // --- Lógica de Lectura (Sin cambios importantes) ---
    function abrirLectura(id) {
        const historia = historiasDb.find(h => h.id === id);
        historiaActivaId = id;
        parrafoActivoIndex = null; 
        carruselIndex = 0; 

        seccionDescubrir.classList.add('hidden-aero');
        seccionEscribir.classList.add('hidden-aero');
        seccionLectura.classList.remove('hidden-aero');

        panelLectura.innerHTML = '';

        if (historia.portadas && historia.portadas.length > 0) {
            const carouselHtml = `
                <div class="carousel-aero-container">
                    <button class="btn-carousel-aero prev-portada" onclick="cambiarFoto(-1)">◀</button>
                    <img src="${historia.portadas[0]}" id="carousel-img-aero" class="carousel-viewport" alt="Portada de la historia">
                    <button class="btn-carousel-aero next-portada" onclick="cambiarFoto(1)">▶</button>
                </div>
            `;
            panelLectura.innerHTML += carouselHtml;

            if (historia.portadas.length === 1) {
                setTimeout(() => {
                    const btns = document.querySelectorAll('.btn-carousel-aero');
                    btns.forEach(b => b.classList.add('hidden-aero'));
                }, 10);
            }
        }

        panelLectura.innerHTML += `<h1 class="aero-title-glow" style="text-align:center;">${historia.titulo}</h1>`;

        const parrafos = historia.texto.split(/\n+/);
        parrafos.forEach((p, index) => {
            if (p.trim() === '') return; 
            
            if (!historia.comentarios[index]) historia.comentarios[index] = [];
            const numComentarios = historia.comentarios[index].length;
            
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

        tituloOpiniones.innerText = 'LECTORES OPINAN ✨';
        panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey);">Haz clic en el icono 💬 de un párrafo para ver u opinar.</p>';
        cajaComentario.classList.add('hidden-aero');
    }

    // --- Funciones globales (Sin cambios) ---
    window.cambiarFoto = (direccion) => {
        const historia = historiasDb.find(h => h.id === historiaActivaId);
        const imgElement = document.getElementById('carousel-img-aero');
        const numPortadas = historia.portadas.length;

        carruselIndex = (carruselIndex + direccion + numPortadas) % numPortadas;

        imgElement.style.opacity = '0.7'; 
        setTimeout(() => {
            imgElement.src = historia.portadas[carruselIndex];
            imgElement.style.opacity = '1';
        }, 100);
    };

    window.abrirComentarios = (idHistoria, indexParrafo) => {
        historiaActivaId = idHistoria;
        parrafoActivoIndex = indexParrafo;
        
        const historia = historiasDb.find(h => h.id === idHistoria);
        const comentarios = historia.comentarios[indexParrafo];

        tituloOpiniones.innerText = \`PÁRRAFO \${indexParrafo + 1} ✨\`;
        cajaComentario.classList.remove('hidden-aero');
        panelOpiniones.innerHTML = '';

        if (comentarios.length > 0) {
            comentarios.forEach(comentario => {
                panelOpiniones.innerHTML += `
                    <div class="opinion-aero">
                        <div>
                            <span class="opinion-aero-author">Lector anónimo</span>
                            <p class="opinion-aero-text">${comentario}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey);">Sé el primero en opinar en este párrafo.</p>';
        }
    };

    // --- Eventos de Botones (Sin cambios) ---
    document.getElementById('btn-enviar-comentario').addEventListener('click', () => {
        const inputCmt = document.getElementById('input-nuevo-comentario');
        const textoCmt = inputCmt.value.trim();

        if (textoCmt !== '' && historiaActivaId !== null && parrafoActivoIndex !== null) {
            const historia = historiasDb.find(h => h.id === idHistoria);
            historia.comentarios[parrafoActivoIndex].push(textoCmt);
            
            inputCmt.value = '';
            window.abrirComentarios(historiaActivaId, parrafoActivoIndex);
            document.getElementById(`contador-${historiaActivaId}-${parrafoActivoIndex}`).innerText = historia.comentarios[parrafoActivoIndex].length;
        }
    });

    document.getElementById('btn-descubre').addEventListener('click', () => {
        seccionDescubrir.classList.remove('hidden-aero');
        seccionLectura.classList.add('hidden-aero');
        seccionEscribir.classList.add('hidden-aero');
        tituloOpiniones.innerText = 'LECTORES OPINAN ✨';
        panelOpiniones.innerHTML = '<p class="empty-msg" style="color:var(--text-grey); font-size:12px; font-style:italic;">Selecciona una historia para ver los comentarios.</p>';
        cajaComentario.classList.add('hidden-aero');
        searchInput.value = ''; 
        renderInicio(); 
    });

    document.getElementById('btn-volver').addEventListener('click', () => document.getElementById('btn-descubre').click());

    document.getElementById('btn-crea').addEventListener('click', () => {
        seccionDescubrir.classList.add('hidden-aero');
        seccionLectura.classList.add('hidden-aero');
        seccionEscribir.classList.remove('hidden-aero');
    });

    // --- Lógica de Preview de Fotos (Sin cambios) ---
    const inputFotos = document.getElementById('fotos-historia');
    const previewGrid = document.getElementById('preview-fotos');

    inputFotos.addEventListener('change', function(e) {
        previewGrid.innerHTML = '';
        // Para este proyecto básico, solo subiremos LA PRIMERA foto
        const file = e.target.files[0]; 
        if (file && file.type.startsWith('image/')) {
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

    // 🌟 NUEVO EVENTO: Enviar los datos (y la foto) a la NUBE al guardar
    document.getElementById('formulario-historia').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Cambiamos el texto del botón para que el usuario sepa que está cargando
        const btnGuardar = e.target.querySelector('button[type="submit"]');
        const textoOriginalBtn = btnGuardar.innerText;
        btnGuardar.innerText = 'Subiendo historia y foto... (esto puede tardar)';
