const db = [
    { 
        id: 1, titulo: 'Sombras Aero', autor: 'David_Code',
        texto: "La luz azul se filtraba por las burbujas de cristal del puerto. Todo parecía brillar con una intensidad irreal.",
        comentarios: ["¡Qué buena atmósfera!", "Me encanta el estilo visual", "Esperando el siguiente capítulo"]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid-historias');
    const flowComments = document.getElementById('comentarios-flujo');

    // 1. CARGAR BIBLIOTECA
    function loadLibrary() {
        grid.innerHTML = '';
        db.forEach(h => {
            grid.innerHTML += `
                <div class="glass-panel" style="cursor:pointer" onclick="verHistoria(${h.id})">
                    <div style="height:100px; background:rgba(255,255,255,0.05); margin-bottom:10px;"></div>
                    <h4 style="color:var(--aero-blue)">${h.titulo}</h4>
                    <small>Autor: ${h.autor}</small>
                </div>`;
        });
    }

    // 2. VER HISTORIA Y LLENAR SIDEBAR (COMENTARIOS)
    window.verHistoria = (id) => {
        const h = db.find(x => x.id === id);
        document.getElementById('seccion-descubrir').classList.add('hidden');
        document.getElementById('seccion-lectura').classList.remove('hidden');
        
        document.getElementById('texto-historia').innerHTML = `<h2>${h.titulo}</h2><br><p>${h.texto}</p>`;
        
        // Llenar sidebar con mensajes de esta historia
        flowComments.innerHTML = '';
        h.comentarios.forEach(msg => {
            flowComments.innerHTML += `<div class="comment-bubble"><strong>Lector:</strong> ${msg}</div>`;
        });
    };

    // 3. SUBIDA DE 5 FOTOS
    document.getElementById('post-fotos').addEventListener('change', function() {
        const prev = document.getElementById('previsualizacion');
        prev.innerHTML = '';
        const files = Array.from(this.files).slice(0, 5);
        files.forEach(f => {
            const reader = new FileReader();
            reader.onload = (e) => prev.innerHTML += `<img src="${e.target.result}" class="preview-box">`;
            reader.readAsDataURL(f);
        });
    });

    // 4. NAVEGACIÓN
    document.getElementById('btn-descubre').onclick = () => {
        document.getElementById('seccion-descubrir').classList.remove('hidden');
        document.getElementById('seccion-lectura').classList.add('hidden');
        document.getElementById('seccion-escribir').classList.add('hidden');
        flowComments.innerHTML = '<p class="empty-txt">Selecciona una historia...</p>';
    };

    document.getElementById('btn-crea').onclick = () => {
        document.getElementById('seccion-descubrir').classList.add('hidden');
        document.getElementById('seccion-escribir').classList.remove('hidden');
    };

    document.getElementById('lang-toggle').onclick = () => {
        document.getElementById('lang-list').classList.toggle('hidden');
    };

    loadLibrary();
});
