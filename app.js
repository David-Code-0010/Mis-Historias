// ==========================================
// ESTADO GLOBAL
// ==========================================
let historiasDb = [];
let historiaActivaId = null;
let parrafoActivoIndex = null;
let carruselIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales del DOM
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');
    
    // Secciones de pantalla
    const seccionDescubrir = document.getElementById('seccion-descubrir');
    const seccionLectura = document.getElementById('seccion-lectura');
    const seccionEscribir = document.getElementById('seccion-escribir');
    const seccionBot = document.getElementById('seccion-bot');

    // ==========================================
    // SISTEMA DE NAVEGACIÓN
    // ==========================================
    function cambiarPantalla(pantalla) {
        // Apagamos todas las pantallas
        if(seccionDescubrir) seccionDescubrir.style.display = 'none';
        if(seccionLectura) seccionLectura.style.display = 'none';
        if(seccionEscribir) seccionEscribir.style.display = 'none';
        if(seccionBot) seccionBot.style.display = 'none';

        // Encendemos la que toca
        if (pantalla === 'descubrir') {
            seccionDescubrir.style.display = 'block';
            cargarHistorias(); // Recargar desde Neon siempre que volvamos al inicio
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

    // Botones del menú
    const btnDescubre = document.getElementById('btn-descubre');
    const btnCrea = document.getElementById('btn-crea');
    const btnBot = document.getElementById('btn-bot');
    const btnVolver = document.getElementById('btn-volver');

    function actualizarNav(botonActivo) {
        document.querySelectorAll('.aero-nav button').forEach(b => b.classList.remove('active'));
        if(botonActivo) botonActivo.classList.add('active');
    }

    if(btnDescubre) btnDescubre.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('descubrir'); });
    if(btnCrea) btnCrea.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('escribir'); });
    if(btnBot) btnBot.addEventListener('click', (e) => { actualizarNav(e.target); cambiarPantalla('bot'); });
    if(btnVolver) btnVolver.addEventListener('click', () => { if(btnDescubre) btnDescubre.click(); });

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
            gridDescubrir.innerHTML = '<p style="color:#aaa;">No hay historias todavía. ¡Ve a Escribir y crea la primera!</p>';
            return;
        }

        historiasDb.forEach(h => {
            const art = document.createElement('article');
            art.className = 'glassy-box';
            art.style.cursor = 'pointer';
            art.onclick = () => window.abrirLectura(h.id);
            
            // Extraer miniatura si existe
            let miniatura = 'https://via.placeholder.com/600x300/111/0cf?text=Neon';
            if (h.fotos && h.fotos.length > 0) miniatura = h.fotos[0];
            else if (typeof h.fotos === 'string') miniatura = h.fotos;

            art.innerHTML = `
                <div style="background-image: url('${miniatura}'); height: 150px; background-size: cover; background-position: center; border-radius: 8px; margin-bottom: 10px;"></div>
                <h3 style="color:white; margin-bottom:5px; font-size:1.1rem;">${h.titulo}</h3>
                <p style="color:#00CCFF; font-size:0.85rem;">Por: ${h.autor || 'Anónimo'}</p>
            `;
            gridDescubrir.appendChild(art);
        });
    }

    // ==========================================
    // LECTURA DE HISTORIAS
    // ==========================================
    window.abrirLectura = function(id) {
        const historia = historiasDb.find(h => h.id === id);
        if (!historia || !panelLectura) return;

        historiaActivaId = id;
        parrafoActivoIndex = null;
        carruselIndex = 0;

        cambiarPantalla('lectura');
        panelLectura.innerHTML = '';

        let miniatura = 'https://via.placeholder.com/600x300/111/0cf?text=Neon';
        if (historia.fotos && historia.fotos.length > 0) miniatura = historia.fotos[0];
        else if (typeof historia.fotos === 'string') miniatura = historia.fotos;

        panelLectura.innerHTML += `
            <div style="position: relative; width: 100%; height: 250px; margin-bottom: 20px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                <img src="${miniatura}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h1 class="aero-title-glow" style="text-align:center; color:white; margin-bottom:30px;">${historia.titulo}</h1>
        `;

        const parrafos = historia.texto.split(/\n+/);
        parrafos.forEach((p, idx) => {
            if (!p.trim()) return;
            
            // Buscar cuántos comentarios tiene este párrafo en la DB
            const numCom = (historia.comentarios && historia.comentarios[idx]) ? historia.comentarios[idx].length : 0;
            
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.marginBottom = '20px';
            
            div.innerHTML = `
                <p style="flex:1; color:white; line-height:1.6; font-size:1.05rem; margin:0; padding-right:15px;">${p}</p>
                <button onclick="window.abrirComentarios(${id}, ${idx})" style="background:rgba(255,255,255,0.05); border:1px solid #00CCFF; color:white; padding:8px 15px; border-radius:8px; cursor:pointer; height:fit-content; transition:0.3s;">
                    💬 <span id="contador-${id}-${idx}" style="color:#00CCFF; font-weight:bold;">${numCom}</span>
                </button>
            `;
            panelLectura.appendChild(div);
        });

        // Resetear panel lateral al abrir una historia nueva
        if(tituloOpiniones) tituloOpiniones.innerText = 'OPINIONES ✨';
        if(panelOpiniones) panelOpiniones.innerHTML = '<p class="empty-msg" style="color:#aaa; text-align:center;">Haz clic en el icono 💬 de un párrafo para opinar.</p>';
        if(cajaComentario) cajaComentario.style.display = 'none';
    };

    // ==========================================
    // COMENTARIOS (LEER Y ENVIAR A NEON)
    // ==========================================
    window.abrirComentarios = function(id, index) {
        historiaActivaId = id;
        parrafoActivoIndex = index;
        const historia = historiasDb.find(h => h.id === id);
        
        if(tituloOpiniones) tituloOpiniones.innerText = `PÁRRAFO ${index + 1} ✨`;
        if(cajaComentario) cajaComentario.style.display = 'block';
        
        actualizarListaComentarios(historia, index);
    };

    function actualizarListaComentarios(historia, index) {
        if(!panelOpiniones) return;
        panelOpiniones.innerHTML = '';
        const comentarios = (historia.comentarios && historia.comentarios[index]) ? historia.comentarios[index] : [];

        if (comentarios.length === 0) {
            panelOpiniones.innerHTML = '<p style="color:#aaa; text-align:center; font-style:italic;">Sin opiniones aún. ¡Sé el primero!</p>';
        } else {
            comentarios.forEach(texto => {
                const div = document.createElement('div');
                div.style.background = 'rgba(255,255,255,0.05)';
                div.style.padding = '12px';
                div.style.borderRadius = '8px';
                div.style.marginBottom = '10px';
                div.style.borderLeft = '3px solid #00CCFF';
                div.innerHTML = `
                    <strong style="color:#00CCFF; display:block; font-size:0.8rem; margin-bottom:4px;">Lector anónimo</strong>
                    <p style="color:white; margin:0; font-size:0.95rem;">${texto}</p>
                `;
                panelOpiniones.appendChild(div);
            });
        }
        panelOpiniones.scrollTop = panelOpiniones.scrollHeight;
    }

    window.enviarComentario = async function() {
        const inputComentario = document.getElementById('nuevo-comentario');
        if(!inputComentario) return;

        const texto = inputComentario.value.trim();
        if (!texto || historiaActivaId === null || parrafoActivoIndex === null) return;

        const datosComentario = { historia_id: historiaActivaId, parrafo_idx: parrafoActivoIndex, contenido: texto };

        try {
            const res = await fetch('/api/comentar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosComentario)
            });

            if (res.ok) {
                const historia = historiasDb.find(h => h.id === historiaActivaId);
                if (!historia.comentarios) historia.comentarios = {};
                if (!historia.comentarios[parrafoActivoIndex]) historia.comentarios[parrafoActivoIndex] = [];
                
                historia.comentarios[parrafoActivoIndex].push(texto);
                inputComentario.value = '';
                actualizarListaComentarios(historia, parrafoActivoIndex);
                
                const contador = document.getElementById(`contador-${historiaActivaId}-${parrafoActivoIndex}`);
                if (contador) contador.innerText = historia.comentarios[parrafoActivoIndex].length;
            } else {
                alert("Error al guardar en la base de datos.");
            }
        } catch (e) {
            console.error("Error:", e);
        }
    };

    // Enganchar botón de enviar comentario
    const btnEnviarComentario = document.querySelector('#caja-escribir-comentario button');
    if (btnEnviarComentario) btnEnviarComentario.addEventListener('click', window.enviarComentario);

    // ==========================================
    // PUBLICAR NUEVA HISTORIA
    // ==========================================
    const formHistoria = document.getElementById('formulario-historia');
    if (formHistoria) {
        formHistoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('titulo-historia').value;
            const autor = document.getElementById('autor-historia').value || 'Anónimo';
            const texto = document.getElementById('contenido-historia').value;
            
            // (Si usas carga de imágenes por Vercel Blob luego lo conectas, por ahora usamos placeholder o las previas)
            const fotos = ['https://via.placeholder.com/600x300/222/0cf?text=Nueva+Historia'];

            try {
                const res = await fetch('/api/publicar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, autor, texto, fotos })
                });

                if (res.ok) {
                    alert('¡Historia publicada con éxito!');
                    formHistoria.reset();
                    if(btnDescubre) btnDescubre.click(); // Te regresa al menú principal
                } else {
                    alert('Error al publicar la historia.');
                }
            } catch (error) {
                console.error("Error publicando:", error);
            }
        });
    }

    // ==========================================
    // INICIO DE LA APLICACIÓN
    // ==========================================
    cambiarPantalla('descubrir'); // Arrancamos en el menú principal
});
