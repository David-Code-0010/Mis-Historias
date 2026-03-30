document.addEventListener('DOMContentLoaded', () => {
    const sDescubrir = document.getElementById('seccion-descubrir');
    const sEscribir = document.getElementById('seccion-escribir');
    const sBot = document.getElementById('seccion-bot');
    const chatWindow = document.getElementById('chat-window');

    // Navegación
    document.getElementById('btn-bot').onclick = () => {
        showSection(sBot);
        document.getElementById('btn-bot').classList.add('active');
    };
    document.getElementById('btn-crea').onclick = () => showSection(sEscribir);
    document.getElementById('btn-descubre').onclick = () => {
        showSection(sDescubrir);
        cargarHistorias();
    };

    function showSection(section) {
        [sDescubrir, sEscribir, sBot].forEach(s => s.classList.add('hidden-aero'));
        section.classList.remove('hidden-aero');
        document.querySelectorAll('.btn-aero-text').forEach(b => b.classList.remove('active'));
    }

    // Chatbot
    document.getElementById('btn-enviar-bot').onclick = async () => {
        const input = document.getElementById('input-bot');
        const msj = input.value;
        if(!msj) return;

        chatWindow.innerHTML += `<div class="msg-user"><p>${msj}</p></div>`;
        input.value = '';

        const res = await fetch('/api/chat-bot', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ mensaje: msj })
        });
        const data = await res.json();
        chatWindow.innerHTML += `<div class="msg-bot"><b>Bot:</b> <p>${data.respuesta}</p></div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    // (Aquí va tu función cargarHistorias y el submit del formulario que ya tenías)
});
