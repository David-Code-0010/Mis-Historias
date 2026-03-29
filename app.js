// Base de datos de ejemplo
const historias = [
    { 
        id: 1, 
        titulo: 'Ángel y Demonio', 
        autor: 'Anna Todd',
        capitulos: [
            { texto: "Él era el caos personificado, una tormenta en mi mundo...", comentarios: ["Amo a Hardin!", "Esa frase es icónica"] },
            { texto: "Sus ojos brillaban con una intensidad peligrosa.", comentarios: ["Dato curioso: el color verde es mi favorito"] }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Manejo de Fotos (5 máximo)
    const inputFotos = document.getElementById('fotos-historia');
    inputFotos.addEventListener('change', function() {
        const preview = document.getElementById('preview-fotos');
        preview.innerHTML = '';
        const files = Array.from(this.files).slice(0, 5);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML += `<img src="${e.target.result}" class="preview-img">`;
            }
            reader.readAsDataURL(file);
        });
    });

    // Función para leer y mostrar comentarios en el Sidebar
    window.leerHistoria = (id) => {
        const h = historias.find(item => item.id === id);
        document.getElementById('seccion-descubrir').classList.add('hidden-aero');
        document.getElementById('seccion-lectura').classList.remove('hidden-aero');
        
        const content = document.getElementById('contenido-lectura-dinamico');
        const side = document.getElementById('opiniones-contenedor');
        
        content.innerHTML = `<h2>${h.titulo}</h2><br>`;
        side.innerHTML = ''; // Limpiar sidebar para nuevos comentarios

        h.capitulos.forEach(cap => {
            // Inyectar texto
            content.innerHTML += `<p style="margin-bottom:20px; font-size:18px;">${cap.texto}</p>`;
            
            // Inyectar comentarios al sidebar derecho de forma colectiva
            cap.comentarios.forEach(c => {
                side.innerHTML += `
                    <div class="opinion-item">
                        <strong>Lector anónimo:</strong><br>${c}
                    </div>`;
            });
        });
    };

    // Navegación
    document.getElementById('btn-descubre').onclick = () => {
        document.getElementById('seccion-descubrir').classList.remove('hidden-aero');
        document.getElementById('seccion-lectura').classList.add('hidden-aero');
        document.getElementById('seccion-escribir').classList.add('hidden-aero');
        document.getElementById('opiniones-contenedor').innerHTML = '<p class="empty-msg">Entra en una historia para leer comentarios.</p>';
    };

    document.getElementById('btn-crea').onclick = () => {
        document.getElementById('seccion-descubrir').classList.add('hidden-aero');
        document.getElementById('seccion-escribir').classList.remove('hidden-aero');
    };

    // Cargar Biblioteca Inicial
    const grid = document.getElementById('lista-historias-descubrir');
    historias.forEach(h => {
        grid.innerHTML += `
            <div class="reading-glass-container" style="cursor:pointer; padding:10px;" onclick="leerHistoria(${h.id})">
                <div style="height:120px; background:#222; margin-bottom:10px; border:1px solid #444;"></div>
                <h4 class="orange-glow">${h.titulo}</h4>
                <small>Por ${h.autor}</small>
            </div>`;
    });

    // Toggle Idiomas
    document.getElementById('lang-selector-aero').onclick = (e) => {
        e.stopPropagation();
        document.getElementById('lang-dropdown').classList.toggle('hidden-aero');
    };
    document.onclick = () => document.getElementById('lang-dropdown').classList.add('hidden-aero');
});
