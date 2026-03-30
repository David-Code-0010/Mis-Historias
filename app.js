window.abrirComentarios = function(id, index) {
    // 1. Encontrar la historia actual
    const historia = historiasDb.find(h => h.id === id);
    if (!historia) return;

    // 2. Referencias a los elementos del panel derecho
    const panelOpiniones = document.getElementById('opiniones-contenedor');
    const tituloOpiniones = document.getElementById('titulo-opiniones');
    const cajaComentario = document.getElementById('caja-escribir-comentario');

    // 3. Actualizar el título
    tituloOpiniones.innerText = `PÁRRAFO ${index + 1} ✨`;
    
    // 4. Limpiar el panel antes de poner los nuevos
    panelOpiniones.innerHTML = '';

    // 5. Obtener comentarios (manejar si no existen)
    const comentarios = (historia.comentarios && historia.comentarios[index]) ? historia.comentarios[index] : [];

    if (comentarios.length === 0) {
        panelOpiniones.innerHTML = '<p class="empty-msg">Sin opiniones aún en este párrafo.</p>';
    } else {
        comentarios.forEach(texto => {
            const div = document.createElement('div');
            div.className = 'comentario-item'; // Asegúrate de tener este estilo en CSS
            div.style.background = 'rgba(255,255,255,0.05)';
            div.style.padding = '12px';
            div.style.borderRadius = '8px';
            div.style.marginBottom = '10px';
            div.style.borderLeft = '3px solid var(--aqua-aqua-glow, #00CCFF)';
            
            div.innerHTML = `
                <strong style="color:var(--aqua-aqua-base, #00CCFF); display:block; font-size:0.8rem; margin-bottom:4px;">Lector Anónimo</strong>
                <p style="color:white; margin:0; font-size:0.95rem;">${texto}</p>
            `;
            panelOpiniones.appendChild(div);
        });
    }

    // 6. ¡IMPORTANTE! Mostrar la caja para escribir
    if (cajaComentario) {
        cajaComentario.style.display = 'block';
    }
};
