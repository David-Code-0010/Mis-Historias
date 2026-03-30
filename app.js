// --- VARIABLES GLOBALES ---
let historiasDb = []; 
let historiaActivaId = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Elementos de Navegación y Secciones
    const sDescubrir = document.getElementById('seccion-descubrir');
    const sEscribir = document.getElementById('seccion-escribir');
    const sLectura = document.getElementById('seccion-lectura'); // Asegúrate de tener este ID en tu HTML
    const sBot = document.getElementById('seccion-bot');
    
    const gridDescubrir = document.getElementById('lista-historias-descubrir');
    const chatWindow = document.getElementById('chat-window');

    // 2. Lógica de Navegación
    function showSection(section) {
        [sDescubrir, sEscribir, sLectura, sBot].forEach(s => {
            if(s) s.classList.add('hidden-aero');
        });
        section.classList.remove('hidden-aero');
        document.querySelectorAll('.btn-aero-text').forEach(b => b.classList.remove('active'));
    }

    // Configurar botones del Nav (IDs según tu captura image_77fdfd.png)
    document.getElementById('btn-bot').onclick = () => {
        showSection(sBot);
        document.getElementById('btn-bot').classList.add('active');
    };

    document.getElementById('btn-crea').onclick = () => {
        showSection(sEscribir);
        document.getElementById('btn-crea').classList.add('active');
    };

    document.getElementById('btn-descubre').onclick = () => {
        showSection(sDescubrir);
        document.getElementById('btn-descubre').classList.add('active');
        cargarHistorias();
    };

    // 3. Función: Traer historias de la API (Python)
    async function cargarHistorias() {
        try {
            const respuesta = await fetch('/api/historias');
            historiasDb = await respuesta.json();
            
            gridDescubrir.innerHTML = '';
            historiasDb.forEach(h => {
                const div = document.createElement('div');
                div.className = 'historia-aero-card glassy-box';
                // Usar la portada real o el placeholder
                const img = h.portada_url ? h.portada_url : 'https://via.placeholder.com/180x260?text=Sin+Portada';
                
                div.innerHTML = `
                    <img src="${img}" class="portada-aero">
                    <h3 class="card-title">${h.titulo}</h3>
                    <p class="card-info">Por ${h.autor}</p>
                `;
                gridDescubrir.appendChild(div);
            });
        } catch (error) {
            console.error("Error al cargar historias:", error);
        }
    }

    // 4. Lógica del Chatbot
    const btnEnviarBot = document.getElementById('btn-enviar-bot');
    if (btnEnviarBot) {
        btnEnviarBot.onclick = async () => {
            const input = document.getElementById('input-bot');
            const msj = input.value.trim();
            if(!msj) return;

            // Mensaje usuario
            chatWindow.innerHTML += `<div class="msg-user"><p>${msj}</p></div>`;
            input.value = '';

            try {
                const res = await fetch('/api/chat-bot', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ mensaje: msj })
                });
                const data = await res.json();
                
                // Mensaje Bot
                chatWindow.innerHTML += `
                    <div class="msg-bot">
                        <span class="opinion-aero-author">Bot:</span>
                        <p>${data.respuesta}</p>
                    </div>`;
                chatWindow.scrollTop = chatWindow.scrollHeight;
            } catch (e) {
                console.error("Error en el bot:", e);
            }
        };
    }

    // Carga inicial
    cargarHistorias();
});
