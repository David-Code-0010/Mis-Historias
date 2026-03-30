// Base de datos de prueba de Mis-Historias
let historiasDb = [
    { 
        id: 1, 
        titulo: 'Oscuridad Neón', 
        autor: 'Cyber_Anna',
        portadas: [
            'https://via.placeholder.com/600x300/111/0cf?text=Neon+Cover+1',
            'https://via.placeholder.com/600x300/222/0cf?text=Neon+Scene+2',
            'https://via.placeholder.com/600x300/111/3f3?text=Neon+Alien+3'
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
        portadas: ['https://via.placeholder.com/600x300/111/f90?text=Rules+Cover'],
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
    // Referencias del DOM
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');
    
    // Secciones
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');
    const seccionBot = document.getElementById('seccion-bot');
    const searchInput = document.getElementById('search-input');

    // Función para renderizar la biblioteca (Diseño Mata Nero)
    function renderInicio(datos = historiasDb) {
        gridDescubrir.innerHTML = '';
        if (datos.length === 0) {
            gridDescubrir.innerHTML = '<p class="empty-msg">No se encontraron historias con ese nombre.</p>';
            return;
        }

        datos.forEach(h => {
            const article = document.createElement('article');
            article.className = 'glassy-box';
            article.style.cursor = 'pointer';
            article.onclick = () => abrirLectura(h.id);
            
            const miniatura = h.portadas.length > 0 ? h.portadas[0] : 'https://via.placeholder.com/300x200?text=No+Cover';
            
            article.innerHTML = `
                <div class="card-image-edge" style="background-image: url('${miniatura}'); background-size: cover; background-position: center;"></div>
                <h3 class="aero-title-glow" style="font-size:1.1rem; margin-top:40px;">${h.titulo}</h3>
                <p style="color:var(--text-dim); font-size:0.85rem;">Por: ${h.autor}</p>
            `;
            gridDescubrir.appendChild(article);
        });
    }

    // Buscador
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const busqueda = searchInput.value.toLowerCase();
            const filtradas = historiasDb.filter(h => h.titulo.toLowerCase().includes(busqueda) || h.autor.toLowerCase().includes(busqueda));
            document.getElementById('btn-descubre').click();
            renderInicio(filtradas);
        }
    });

    // ==========================================
    // SISTEMA DE NAVEGACIÓN MAESTRO (A PRUEBA DE FALLOS)
    // ==========================================
    function cambiarPantalla(pantalla) {
        // 1. Apagamos TODAS las pantallas a la fuerza
        seccionDescubrir.style.display = 'none';
        seccionLectura.style.display = 'none';
        seccionEscribir.style.display = 'none';
        seccionBot.style.display = 'none';

        // 2. Encendemos SOLO la que pedimos
        if (pantalla === 'descubrir') {
            seccionDescubrir.style.display = 'block';
            renderInicio(); // Refrescamos la biblioteca
        } 
        else if (pantalla === 'lectura') {
            seccionLectura.style.display = 'flex'; // Usamos flex para la barra lateral
        } 
        else if (pantalla === 'escribir') {
            seccionEscribir.style.display = 'block';
        } 
        else if (pantalla === 'bot') {
            seccionBot.style.display = 'block';
        }
    }

    // --- EVENTOS DE LOS BOTONES ---
    document.getElementById('btn-descubre').addEventListener('click', (e) => {
        document.querySelectorAll('.aero-nav button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        searchInput.value = ''; 
        cambiarPantalla('descubrir');
    });

    document.getElementById('btn-volver').addEventListener('click', () => {
        document.getElementById('btn-descubre').click();
    });

    document.getElementById('btn-crea').addEventListener('click', (e) => {
        document.querySelectorAll('.aero-nav button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        cambiarPantalla('escribir');
    });

    document.getElementById('btn-bot').addEventListener('click', (e) => {
        document.querySelectorAll('.aero-nav button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        cambiarPantalla('bot');
    });

    // --- ABRIR UNA HISTORIA ---
    function abrirLectura(id) {
        const historia = historiasDb.find(h => h.id === id);
        historiaActivaId = id;
        parrafoActivoIndex = null; 
        carruselIndex = 0; 

        // Usamos nuestro nuevo sistema para mostrar la lectura
        cambiarPantalla('lectura');

        panelLectura.innerHTML = '';

        if (historia.portadas && historia.portadas.length > 0) {
            const carouselHtml = `
                <div style="position: relative; width: 100%; height: 250px; margin-bottom: 20px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    <button class="btn-carousel-aero prev-portada" onclick="cambiarFoto(-1)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.6); border: 1px solid var(--aqua); color: white; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">◀</button>
                    <img src="${historia.portadas[0]}" id="carousel-img-aero" alt="Portada" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s ease;">
                    <button class="btn-carousel-aero next-portada" onclick="cambiarFoto(1)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.6); border: 1px solid var(--aqua); color: white; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">▶</button>
                </div>
            `;
            panelLectura.innerHTML += carouselHtml;

            if (historia.portadas.length === 1) {
                setTimeout(() => {
                    document.querySelectorAll('.btn-carousel-aero').forEach(b => b.style.display = 'none');
                }, 10);
            }
        }

        panelLectura.innerHTML += `<h1 class="aero-title-glow" style="text-align:center; font-size: 2rem; margin-bottom: 30px;">${historia.titulo}</h1>`;

        const parrafos = historia.texto.split(/\n+/);
        parrafos.forEach((p, index) => {
            if (p.trim() === '') return; 
            
            if (!historia.comentarios[index]) historia.comentarios[index] = [];
            const numComentarios = historia.comentarios[index].length;
            
            const div = document.createElement('div');
            div.className = 'msg-bot'; 
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'flex-start';
            div.style.marginBottom = '15px';
            
            div.innerHTML = `
                <p style="flex: 1; color: var(--text); line-height: 1.6; font-size: 1.05rem; padding-right: 15px;">${p}</p>
                <button class="btn-aero-text" onclick="abrirComentarios(${id}, ${index})" style="padding: 5px 10px;">
                    💬 <span id="contador-${id}-${index}" style="color: var(--aqua);">${numComentarios}</span>
                </button>
            `;
            panelLectura.appendChild(div);
        });

        tituloOpiniones.innerText = 'LECTORES OPINAN ✨';
        panelOpiniones.innerHTML = '<p class="empty-msg">Haz clic en el icono 💬 de un párrafo para ver u opinar.</p>';
        cajaComentario.style.display = 'none'; // Usamos display nativo
    }

    // Lógica de subir fotos (Previsualización)
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
                    img.style.width = '100%';
                    img.style.height = '80px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '8px';
                    img.style.border = '1px solid rgba(255,255,255,0.1)';
                    previewGrid.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Crear y publicar nueva historia
    document.getElementById('formulario-historia').addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = document.getElementById('titulo-historia').value;
        const autor = document.getElementById('autor-historia').value || 'Autor Anónimo';
        const contenido = document.getElementById('contenido-historia').value;
        
        const imagenesPreview = document.querySelectorAll('#preview-fotos img');
        let portadasFinales = [];
        
        if (imagenesPreview.length > 0) {
            portadasFinales = Array.from(imagenesPreview).map(img => img.src);
        } else {
            // Portada genérica si no sube ninguna
            portadasFinales = ['https://via.placeholder.com/600x300/111/f90?text=Mis+Historias'];
        }

        const nuevaHistoria = {
            id: historiasDb.length + 1,
            titulo: titulo,
            autor: autor,
            portadas: portadasFinales, 
            texto: contenido,
            comentarios: {} 
        };

        historiasDb.unshift(nuevaHistoria);
        alert('¡Tu historia "' + titulo + '" se ha publicado con éxito en la Red Neon!');
        
        e.target.reset();
        previewGrid.innerHTML = '';
        document.getElementById('btn-descubre').click();
    });

    // Renderizar la biblioteca al cargar la página usando el sistema maestro
    cambiarPantalla('descubrir');
});
