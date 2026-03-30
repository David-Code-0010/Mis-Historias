// ==========================================
// ESTADO GLOBAL
// ==========================================
let historiasDb = [
    { 
        id: 1, 
        titulo: 'Oscuridad Neón', 
        autor: 'Cyber_Anna',
        portadas: ['https://via.placeholder.com/600x300/111/0cf?text=Neon+Cover+1'],
        texto: "La luz de la ciudad se reflejaba en el asfalto mojado. Todo era azul y naranja.\n\nÉl me miró con esos ojos que parecían circuitos integrados.",
        comentarios: { 0: ["¡Amo esa descripción!"], 1: [] }
    },
    { 
        id: 2, 
        titulo: 'Reglas del Juego', 
        autor: 'AeroWriter',
        portadas: ['https://via.placeholder.com/600x300/111/f90?text=Rules+Cover'],
        texto: "Regla número 1: No confíes en nadie.\n\nRegla número 2: Nunca reveles tu identidad.",
        comentarios: { 0: ["Totalmente cierto jaja", "Qué intenso inicio"], 1: [] }
    }
];

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
            panelOpiniones.innerHTML = '<p class="empty-msg">Sin opiniones aún.</p>';
        } else {
            comentarios.forEach(texto => {
                const div = document.createElement('div');
                // DISEÑO RECUPERADO (Imagen 2)
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

    // FUNCIÓN PARA ENVIAR Y GUARDAR
    window.enviarComentario = function() {
        const texto = inputComentario.value.trim();
        if (!texto || historiaActivaId === null || parrafoActivoIndex === null) return;

        const historia = historiasDb.find(h => h.id === historiaActivaId);
        
        // Inicializar si no existe el array de ese párrafo
        if (!historia.comentarios[parrafoActivoIndex]) {
            historia.comentarios[parrafoActivoIndex] = [];
        }

        // GUARDAR en el array
        historia.comentarios[parrafoActivoIndex].push(texto);
        
        // Limpiar y refrescar
        inputComentario.value = '';
        actualizarListaComentarios(historia, parrafoActivoIndex);
        
        // Actualizar el contador visual en el párrafo
        const contador = document.getElementById(`contador-${historiaActivaId}-${parrafoActivoIndex}`);
        if (contador) {
            contador.innerText = historia.comentarios[parrafoActivoIndex].length;
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
        document.getElementById('seccion-descubrir').style.display = 'none';
        document.getElementById('seccion-lectura').style.display = 'flex';
        
        panelLectura.innerHTML = `
            <div style="height:250px; background:url('${historia.portadas[0]}') center/cover; border-radius:12px; margin-bottom:20px;"></div>
            <h1 class="aero-title-glow" style="text-align:center;">${historia.titulo}</h1>
        `;

        const parrafos = historia.texto.split('\n\n');
        parrafos.forEach((p, idx) => {
            const numCom = (historia.comentarios[idx]) ? historia.comentarios[idx].length : 0;
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.marginBottom = '20px';
            div.innerHTML = `
                <p style="flex:1; line-height:1.6;">${p}</p>
                <button class="btn-comentario" onclick="window.abrirComentarios(${id}, ${idx})" style="background:none; border:1px solid #333; color:white; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:10px;">
                    💬 <span id="contador-${id}-${idx}">${numCom}</span>
                </button>
            `;
            panelLectura.appendChild(div);
        });
    };

    // Render inicial de la biblioteca
    function render() {
        gridDescubrir.innerHTML = '';
        historiasDb.forEach(h => {
            const art = document.createElement('article');
            art.className = 'glassy-box';
            art.onclick = () => window.abrirLectura(h.id);
            art.innerHTML = `<h3>${h.titulo}</h3><p>Por: ${h.autor}</p>`;
            gridDescubrir.appendChild(art);
        });
    }

    document.getElementById('btn-descubre').onclick = () => {
        document.getElementById('seccion-descubrir').style.display = 'block';
        document.getElementById('seccion-lectura').style.display = 'none';
        render();
    };

    render();
});
