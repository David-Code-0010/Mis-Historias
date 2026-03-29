// app.js
const stories = [
    { 
        id: 1, title: 'Ángel y Demonio', author: 'Anna Todd',
        content: [
            { text: "Él era el caos personificado, una tormenta negra...", comments: ["Amo este inicio!", "Increíble"] },
            { text: "Sus ojos brillaban con ese verde neón...", comments: ["Ese verde es muy Aero"] }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const mainSection = document.getElementById('seccion-descubrir');
    const readSection = document.getElementById('seccion-lectura');
    const writeSection = document.getElementById('seccion-escribir');
    const opinionsContainer = document.getElementById('opiniones-contenedor');

    // Manejo de subida de 5 fotos (Preview)
    document.getElementById('fotos-historia').addEventListener('change', function(e) {
        const preview = document.getElementById('preview-fotos');
        preview.innerHTML = '';
        const files = Array.from(e.target.files).slice(0, 5); // Máximo 5
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.innerHTML += `<img src="${event.target.result}" class="preview-img">`;
            };
            reader.readAsDataURL(file);
        });
    });

    // Función para abrir historia y cargar comentarios al sidebar
    window.openStory = (id) => {
        const story = stories.find(s => s.id === id);
        mainSection.classList.add('hidden-aero');
        readSection.classList.remove('hidden-aero');
        writeSection.classList.add('hidden-aero');

        const container = document.getElementById('contenido-lectura-dinamico');
        container.innerHTML = `<h2>${story.title}</h2>`;
        
        // Limpiar y llenar sidebar con todos los comentarios
        opinionsContainer.innerHTML = '';
        story.content.forEach((p, i) => {
            container.innerHTML += `
                <div class="paragraph-block">
                    <p>${p.text}</p>
                    <button class="btn-comment" onclick="alert('Función para comentar párrafo ${i+1}')">💬</button>
                </div>`;
            
            p.comments.forEach(c => {
                opinionsContainer.innerHTML += `
                    <div class="opinion-item">
                        <strong>Lector:</strong> ${c}
                    </div>`;
            });
        });
    };

    // Navegación Básica
    document.getElementById('btn-descubre').onclick = () => {
        mainSection.classList.remove('hidden-aero');
        readSection.classList.add('hidden-aero');
        writeSection.classList.add('hidden-aero');
        opinionsContainer.innerHTML = '<p class="empty-msg">Selecciona una historia...</p>';
    };

    document.getElementById('btn-crea').onclick = () => {
        mainSection.classList.add('hidden-aero');
        readSection.classList.add('hidden-aero');
        writeSection.classList.remove('hidden-aero');
    };

    // Render Inicial
    const grid = document.getElementById('lista-historias-descubrir');
    stories.forEach(s => {
        grid.innerHTML += `
            <div class="glassy-box card-historia" onclick="openStory(${s.id})">
                <div style="height:150px; background:#222;"></div>
                <h4>${s.title}</h4>
                <small>${s.author}</small>
            </div>`;
    });

    // Selector de Idiomas
    document.getElementById('lang-selector-aero').onclick = () => {
        document.getElementById('lang-dropdown').classList.toggle('hidden-aero');
    };
});
