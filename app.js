// ==========================================
// ESTADO GLOBAL
// ==========================================
let historiasDb = [];
let historiaActivaId = null;
let parrafoActivoIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const panelLectura = document.getElementById('contenido-lectura-dinamico');
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');
    const btnEnviar = document.querySelector('#caja-escribir-comentario button');
    const inputComentario = document.getElementById('nuevo-comentario') || document.querySelector('#caja-escribir-comentario input');

    // ==========================================
    // CARGAR DATOS DESDE LA BASE DE DATOS (NEON)
    // ==========================================
    async function cargarHistorias() {
        try {
            const res = await fetch('/api/historias');
            if (res.ok) {
                historiasDb = await res.json();
                render();
            }
        } catch (e) {
            console.error("Error cargando la base de datos:", e);
        }
    }

    // ==========================================
    // LÓGICA DE COMENTARIOS (EL MOTOR)
    // ==========================================
    window.abrirComentarios = function(id, index) {
        historiaActivaId = id;
        parrafoActivoIndex = index;
        const historia = historiasDb.find(h => h.id === id);
        
        tituloOpiniones.innerText = `PÁRRAFO ${index + 1} ✨`;
        cajaComentario.style.display = 'block';
        actualizarListaComentarios(historia, index);
    };

    function actualizarListaComentarios(historia, index) {
        panelOpiniones.innerHTML = '';
        const comentarios = (historia.comentarios && historia.comentarios[index]) ? historia.comentarios[index] : [];

        if (comentarios.length === 0) {
            panelOpiniones.innerHTML = '<p class="empty-msg" style="color:#aaa; text-align:center;">Sin opiniones aún en este párrafo.</p>';
        } else {
            comentarios.forEach(texto => {
                const div = document.createElement('div');
                // DISEÑO RECUPERADO (Cuadros Dark Aero)
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
        // Auto-scroll hacia abajo
        panelOpiniones.scrollTop = panelOpiniones.scrollHeight;
    }

    // FUNCIÓN PARA ENVIAR Y GUARDAR EN NEON.TECH
    window.enviarComentario = async function() {
        const texto = inputComentario.value.trim();
        if (!texto || historiaActivaId === null || parrafoActivoIndex === null) return;

        const datosComentario = {
            historia_id: historiaActivaId,
            parrafo_idx: parrafoActivoIndex,
            contenido: texto
        };

        try {
            // Enviar al backend de Python
            const res = await fetch('/api/comentar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosComentario)
            });

            if (res.ok) {
                // Actualizar la memoria local para respuesta inmediata sin recargar la página
                const historia = historiasDb.find(h => h.id === historiaActivaId);
                
                if (!historia.comentarios) historia.comentarios = {};
                if (!historia.comentarios[parrafoActivoIndex]) historia.comentarios[parrafoActivoIndex] = [];
                
                historia.comentarios[parrafoActivoIndex].push(texto);
                
                // Limpiar el input y refrescar la lista
                inputComentario.value = '';
                actualizarListaComentarios(historia, parrafoActivoIndex);
                
                // Actualizar el contador visual en el globo de diálogo del párrafo
                const contador = document.getElementById(`contador-${historiaActivaId}-${parrafoActivoIndex}`);
                if (contador) {
                    contador.innerText = historia.comentarios[parrafoActivoIndex].length;
                }
            } else {
                alert("Hubo un problema al guardar el comentario.");
            }
        } catch (e) {
            console.error("Error de conexión:", e);
        }
    };

    // Asignar el clic al botón de enviar
    if (btnEnviar) {
        btnEnviar.onclick = window.enviarComentario;
    }

    // ==========================================
    // NAVEGACIÓN Y LECTURA
    // ==========================================
    window.abrirLectura = function(id) {
        const historia = historiasDb.find(h => h.id === id);
        if (!historia) return;

        document.getElementById('seccion-descubrir').style.display = 'none';
        document.getElementById('seccion-lectura').style.display = 'flex';
        
        // Manejar fotos (si es un array de DB o texto de Vercel Blob)
        let fotoUrl = 'https://via.placeholder.com/600x300/111/0cf?text=Sin+Portada';
        if (historia.fotos) {
            if (Array.isArray(historia.fotos) && historia.fotos.length > 0) fotoUrl = historia.fotos[0];
            else if (typeof historia.fotos === 'string' && historia.fotos.length > 5) fotoUrl = historia.fotos;
        }

        panelLectura.innerHTML = `
            <div style="height:250px; background:url('${fotoUrl}') center/cover; border-radius:12px; margin-bottom:20px;"></div>
            <h1 class="aero-title-glow" style="text-align:center; color:white;">${historia.titulo}</h1>
        `;

        // Generar párrafos con sus botones de comentarios
        const parrafos = historia.texto.split('\n\n');
        parrafos.forEach((p, idx) => {
            if (!p.trim()) return;
            
            const numCom = (historia.comentarios && historia.comentarios[idx]) ? historia.comentarios[idx].length : 0;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.marginBottom = '20px';
            div.style.color = 'white';
            
            div.innerHTML = `
                <p style="flex:1; line-height:1.6; margin:0;">${p}</p>
                <button class="btn-comentario" onclick="window.abrirComentarios(${id}, ${idx})" style="background:rgba(255,255,255,0.1); border:1px solid #333; color:white; padding:8px 12px; border-radius:8px; cursor:pointer; margin-left:15px; display:flex; align-items:center; gap:5px; height:fit-content; transition:0.3s;">
                    💬 <span id="contador-${id}-${idx}">${numCom}</span>
                </button>
            `;
            panelLectura.appendChild(div);
        });
    };

    // Render inicial de la biblioteca
    function render() {
        gridDescubrir.innerHTML = '';
        if (historiasDb.length === 0) {
            gridDescubrir.innerHTML = '<p style="color:#aaa;">No hay historias todavía. ¡Escribe la primera!</p>';
            return;
        }

        historiasDb.forEach(h => {
            const art = document.createElement('article');
            art.className = 'glassy-box';
            art.style.cursor = 'pointer';
            art.onclick = () => window.abrirLectura(h.id);
            art.innerHTML = `
                <h3 style="color:white; margin-bottom:5px;">${h.titulo}</h3>
                <p style="color:#00CCFF; font-size:0.9rem;">Por: ${h.autor || 'Anónimo'}</p>
            `;
            gridDescubrir.appendChild(art);
        });
    }

    // Botón de Volver/Descubrir
    document.getElementById('btn-descubre').onclick = () => {
        document.getElementById('seccion-descubrir').style.display = 'block';
        document.getElementById('seccion-lectura').style.display = 'none';
        cargarHistorias(); // Refrescar base de datos al volver
    };

    // Carga inicial
    cargarHistorias();
});
