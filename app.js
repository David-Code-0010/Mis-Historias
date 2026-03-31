// ==========================================
// ESTADO GLOBAL
// ==========================================
let historiasDb = [];
let historiaActivaId = null;
let parrafoActivoIndex = null;
let fotosActuales = []; // Para el carrusel
let carruselIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales del DOM
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');
    
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');
    const seccionBot = document.getElementById('seccion-bot');
    const seccionAuth = document.getElementById('seccion-auth'); // ¡NUEVO! Referencia al Login

    // ==========================================
    // SISTEMA DE NAVEGACIÓN
    // ==========================================
    function cambiarPantalla(pantalla) {
        // Ocultamos todas las pantallas primero
        if(seccionDescubrir) seccionDescubrir.style.display = 'none';
        if(seccionLectura) seccionLectura.style.display = 'none';
        if(seccionEscribir) seccionEscribir.style.display = 'none';
        if(seccionBot) seccionBot.style.display = 'none';
        if(seccionAuth) seccionAuth.style.display = 'none'; // ¡NUEVO! Ocultar Login

        // Mostramos solo la que necesitamos
        if (pantalla === 'descubrir') {
            seccionDescubrir.style.display = 'block';
            cargarHistorias();
        } else if (pantalla === 'lectura') {
            seccionLectura.style.display = 'flex'; 
        } else if (pantalla === 'escribir') {
            seccionEscribir.style.display = 'block';
        } else if (pantalla === 'bot') {
            seccionBot.style.display = 'block';
        } else if (pantalla === 'auth') {
            seccionAuth.style.display = 'block'; // ¡NUEVO! Mostrar Login
        }
    }

    const btnDescubre = document.getElementById('btn-descubre');
    const btnCrea = document.getElementById('btn-crea');
    const btnBot = document.getElementById('btn-bot');
    const btnVolver = document.getElementById('btn-volver');
    const btnAuthNav = document.getElementById('btn-auth-nav'); // ¡NUEVO! Botón del menú

    function actualizarNav(botonActivo) {
        document.querySelectorAll('.aero-nav button').forEach(b => b.classList.remove('active'));
        if(botonActivo) botonActivo.classList.add('active');
    }

    // Eventos de los botones del menú superior
    if(btnDescubre) btnDescubre.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('descubrir'); });
    if(btnCrea) btnCrea.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('escribir'); });
    if(btnBot) btnBot.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('bot'); });
    if(btnVolver) btnVolver.addEventListener('click', () => { if(btnDescubre) btnDescubre.click(); });
    // ¡NUEVO! Evento para abrir el Login
    if(btnAuthNav) btnAuthNav.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('auth'); });

    // ==========================================
    // BASE DE DATOS: CARGAR HISTORIAS (NEON)
    // ==========================================
    async function cargarHistorias() {
        try {
            const res = await fetch('/api/historias');
            if (res.ok) {
                historiasDb = await res.json();
                renderInicio();
            }
        } catch (e) {
            console.error("Error cargando DB:", e);
        }
    }

    function renderInicio() {
        if(!gridDescubrir) return;
        gridDescubrir.innerHTML = '';
        
        if (historiasDb.length === 0) {
            gridDescubrir.innerHTML = '<p style="color:#aaa; text-align:center; width:100%;">No hay historias todavía. ¡Ve a Escribir y crea la primera!</p>';
            return;
        }

        historiasDb.forEach(h => {
            const art = document.createElement('article');
            art.className = 'glassy-box';
            art.style.cursor = 'pointer';
            art.onclick = () => window.abrirLectura(h.id);
            
            // Imagen por defecto funcional
            let miniatura = 'https://placehold.co/600x300/111/0cf?text=Sin+Portada';
            
            // Filtro para limpiar comillas o caracteres raros de la base de datos
            if (h.fotos) {
                if (Array.isArray(h.fotos) && h.fotos.length > 0) {
                    miniatura = h.fotos[0].replace(/['"]/g, '');
                } else if (typeof h.fotos === 'string' && h.fotos.length > 5) {
                    let urls = h.fotos.replace(/[{}]/g, '').split(',');
                    let cleanUrl = urls[0].trim().replace(/['"]/g, '');
                    if (cleanUrl.includes('http')) miniatura = cleanUrl;
                }
            }

            art.innerHTML = `
                <div style="background-image: url('${miniatura}'); height: 150px; background-size: cover; background-position: center; border-radius: 8px; margin-bottom: 10px;"></div>
                <h3 style="color:white; margin-bottom:5px; font-size:1.1rem;">${h.titulo}</h3>
                <p style="color:#00CCFF; font-size:0.85rem;">Por: ${h.autor || 'Anónimo'}</p>
            `;
            gridDescubrir.appendChild(art);
        });
    }

    // ==========================================
    // LECTURA DE HISTORIAS Y CARRUSEL
    // ==========================================
    window.cambiarFoto = function(direccion) {
        carruselIndex += direccion;
        if (carruselIndex < 0) carruselIndex = fotosActuales.length -
