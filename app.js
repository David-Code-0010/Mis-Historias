// ==========================================
// ESTADO GLOBAL Y CONFIGURACIÓN
// ==========================================
let historiasDb = []; // Se llenará con la API o datos de prueba
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
    
    // Secciones para Navegación
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');
    const seccionBot = document.getElementById('seccion-bot');
    const searchInput = document.getElementById('search-input');

    // ==========================================
    // SISTEMA DE NAVEGACIÓN MAESTRO
    // ==========================================
    function cambiarPantalla(pantalla) {
        seccionDescubrir.style.display = 'none';
        seccionLectura.style.display = 'none';
        seccionEscribir.style.display = 'none';
        seccionBot.style.display = 'none';

        if (pantalla === 'descubrir') {
            seccionDescubrir.style.display = 'block';
            renderInicio(); 
        } 
        else if (pantalla === 'lectura') {
            seccionLectura.style.display = 'flex'; 
        } 
        else if (pantalla === 'escribir') {
            seccionEscribir.style.display = 'block';
        } 
        else if (pantalla === 'bot') {
            seccionBot.style.display = 'block';
        }
    }

    // Eventos de Botones Menú
    document.getElementById('btn-descubre').onclick = (e) => {
        actualizarNav(e.target);
        cambiarPantalla('descubrir');
    };

    document.getElementById('btn-crea').onclick = (e) => {
        actualizarNav(e.target);
        cambiarPantalla('escribir');
    };

    document.getElementById('btn-bot').onclick = (e) => {
        actualizarNav(e.target);
        cambiarPantalla('bot');
    };

    document.getElementById('btn-volver').onclick = () => {
        document.getElementById('btn-descubre').click();
    };

    function actualizarNav(boton) {
        document.querySelectorAll('.aero-nav button').forEach(b => b.classList.remove('active'));
        boton.classList.add('active');
    }

    // ==========================================
    // FUNCIONES DE LECTURA Y COMENTARIOS (GLOBALES)
    // ==========================================
    window.abrirLectura = function(id) {
        const historia = historiasDb.find(h => h.id === id);
        if (!historia) return;

        historiaActivaId = id;
        parrafoActivoIndex = null;
        carruselIndex = 0;

        cambiarPantalla('lectura');
        panelLectura.innerHTML = '';

        // Render Portada/Carrusel
        if (historia.portadas && historia.portadas.length > 0) {
            panelLectura.innerHTML += `
                <div class="carousel-container" style="position:relative; height:250px; margin-bottom:20px; border-radius:12px; overflow:hidden;">
                    <button onclick="window.cambiarFoto(-1)" style="position:absolute; left:10px; top:50%; z-index:10;">◀</button>
                    <img src="${historia.portadas[0]}" id="carousel-img-aero" style="width:100%; height:100%; object-fit:cover;">
                    <button onclick="window.cambiarFoto(1)" style="position:absolute; right:10px; top:50%; z-index:10;">▶</button>
                </div>`;
        }

        panelLectura.innerHTML += `<h1 class="aero-title-glow">${historia.titulo}</h1>`;

        // Render Texto por párrafos
        const parrafos = historia.texto.split(/\n+/);
        parrafos.forEach((p, idx) => {
            if (!p.trim()) return;
            const div = document.createElement('div');
            div.className = 'parrafo-contenedor';
            div.style.display = 'flex';
            div.style.marginBottom = '15px';
            
            const numCom = (historia.comentarios && historia.comentarios[idx]) ? historia.comentarios[idx].length : 0;

            div.innerHTML = `
                <p style="flex:1;">${p}</p>
                <button class="btn-comentario" onclick="window.abrirComentarios(${id}, ${idx})">
                    💬 <span>${numCom}</span>
                </button>`;
            panelLectura.appendChild(div);
        });
    };

    window.cambiarFoto = function(dir) {
        const h = historiasDb.find(x => x.id === historiaActivaId);
        carruselIndex = (carruselIndex + dir + h.portadas.length) % h.portadas.length;
        document.getElementById('carousel-img-aero').src = h.portadas[carruselIndex];
    };

    window.abrirComentarios = function(id, idx) {
        const h = historiasDb.find(x => x.id === id);
        parrafoActivoIndex = idx;
        tituloOpiniones.innerText = `PÁRRAFO ${idx + 1} ✨`;
        panelOpiniones.innerHTML = '';
        cajaComentario.style.display = 'block';

        const lista = (h.comentarios && h.comentarios[idx]) ? h.comentarios[idx] : [];
        if (lista.length === 0) {
            panelOpiniones.innerHTML = '<p>Sin comentarios aún.</p>';
        } else {
            lista.forEach(txt => {
                panelOpiniones.innerHTML += `<div class="comentario-item"><p>${txt}</p></div>`;
            });
        }
    };

    // ==========================================
    // LÓGICA DE PUBLICACIÓN (ESCRIBIR)
    // ==========================================
    const form = document.getElementById('formulario-historia');
    const previewGrid = document.getElementById('preview-fotos');

    // Previsualización de imágenes
    document.getElementById('fotos-historia').onchange = function(e) {
        previewGrid.innerHTML = '';
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                previewGrid.innerHTML += `<img src="${ev.target.result}" style="width:80px; height:80px; object-fit:cover; border-radius:5px;">`;
            };
            reader.readAsDataURL(file);
        });
    };

    form.onsubmit = function(e) {
        e.preventDefault();
        const titulo = document.getElementById('titulo-historia').value;
        const texto = document.getElementById('contenido-historia').value;
        const autor = document.getElementById('autor-historia').value || "Anónimo";
        
        const fotos = Array.from(document.querySelectorAll('#preview-fotos img')).map(img => img.src);

        const nueva = {
            id: Date.now(), // ID Temporal
            titulo,
            autor,
            texto,
            portadas: fotos.length ? fotos : ['https://via.placeholder.com/600x300?text=Sin+Portada'],
            comentarios: {}
        };

        historiasDb.unshift(nueva);
        alert("¡Historia publicada!");
        form.reset();
        previewGrid.innerHTML = '';
        document.getElementById('btn-descubre').click();
    };

    // ==========================================
    // INICIO
    // ==========================================
    function renderInicio() {
        gridDescubrir.innerHTML = '';
        historiasDb.forEach(h => {
            const art = document.createElement('article');
            art.className = 'glassy-box';
            art.onclick = () => window.abrirLectura(h.id);
            art.innerHTML = `
                <div style="background-image:url('${h.portadas[0]}'); height:150px; background-size:cover;"></div>
                <h3>${h.titulo}</h3>
                <p>Por: ${h.autor}</p>`;
            gridDescubrir.appendChild(art);
        });
    }

    // Datos iniciales de prueba
    historiasDb = [
        { id: 1, titulo: "Oscuridad Neón", autor: "Cyber_Anna", texto: "Párrafo 1...\n\nPárrafo 2...", portadas: ["https://via.placeholder.com/600x300/111/0cf"], comentarios: {0: ["Genial"]} }
    ];

    cambiarPantalla('descubrir');
});
