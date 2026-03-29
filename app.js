// Base de datos de prueba de Mis-Historias (2012 Skeuo)
let historiasDb = [
    { 
        id: 1, 
        titulo: 'Oscuridad Neón', 
        autor: 'Cyber_Anna',
        portadas: [
            'https://via.placeholder.com/300x450/111/0cf?text=Neon+Cover+1',
            'https://via.placeholder.com/300x450/222/0cf?text=Neon+Scene+2',
            'https://via.placeholder.com/300x450/111/3f3?text=Neon+Alien+3'
        ],
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
        portadas: ['https://via.placeholder.com/300x450/111/f90?text=Rules+Cover'],
        texto: "Regla número 1: No confíes en nadie con un perfil sin foto.\n\nRegla número 2: Nunca reveles tu verdadera identidad en la red.",
        comentarios: {
            0: ["Totalmente cierto jaja", "Qué intenso inicio"],
            1: []
        }
    }
];

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

    function renderInicio(datos = historiasDb) {
        gridDescubrir.innerHTML = '';
        if (datos.length === 0) {
            gridDescubrir.innerHTML = '<p style="color:var(--text-grey);">No se encontraron historias con ese nombre.</p>';
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

        tituloOpiniones.innerText = `PÁRRAFO ${indexParrafo + 1} ✨`;
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

    document.getElementById('formulario-historia').addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = document.getElementById('titulo-historia').value;
        const contenido = document.getElementById('contenido-historia').value;
        
        const imagenesPreview = document.querySelectorAll('.preview-img');
        let portadasFinales = [];
        
        if (imagenesPreview.length > 0) {
            portadasFinales = Array.from(imagenesPreview).map(img => img.src);
        } else {
            portadasFinales = ['https://via.placeholder.com/300x450/111/f90?text=Mis+Historias'];
        }

        const nuevaHistoria = {
            id: historiasDb.length + 1,
            titulo: titulo,
            autor: 'Tú (Autor)',
            portadas: portadasFinales, 
            texto: contenido,
            comentarios: {} 
        };

        historiasDb.unshift(nuevaHistoria);
        alert('¡Tu historia "' + titulo + '" se ha publicado con éxito en Mis-Historias!');
        e.target.reset();
        previewGrid.innerHTML = '';
        document.getElementById('btn-descubre').click();
    });

    renderInicio();
});
