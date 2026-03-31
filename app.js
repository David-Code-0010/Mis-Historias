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

    // ==========================================
    // SISTEMA DE NAVEGACIÓN
    // ==========================================
    function cambiarPantalla(pantalla) {
        if(seccionDescubrir) seccionDescubrir.style.display = 'none';
        if(seccionLectura) seccionLectura.style.display = 'none';
        if(seccionEscribir) seccionEscribir.style.display = 'none';
        if(seccionBot) seccionBot.style.display = 'none';

        if (pantalla === 'descubrir') {
            seccionDescubrir.style.display = 'block';
            cargarHistorias();
        } else if (pantalla === 'lectura') {
            seccionLectura.style.display = 'flex'; 
        } else if (pantalla === 'escribir') {
            seccionEscribir.style.display = 'block';
        } else if (pantalla === 'bot') {
            seccionBot.style.display = 'block';
        }
    }

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
        if (carruselIndex < 0) carruselIndex = fotosActuales.length - 1;
        if (carruselIndex >= fotosActuales.length) carruselIndex = 0;
        const img = document.getElementById('img-carrusel');
        if (img) img.src = fotosActuales[carruselIndex];
    };

    window.abrirLectura = function(id) {
        const historia = historiasDb.find(h => h.id === id);
        if (!historia || !panelLectura) return;

        historiaActivaId = id;
        parrafoActivoIndex = null;
        carruselIndex = 0;

        cambiarPantalla('lectura');
        panelLectura.innerHTML = '';

        // Preparar arreglo de fotos
        fotosActuales = ['https://placehold.co/600x300/111/0cf?text=Sin+Portada'];
        if (historia.fotos) {
            if (Array.isArray(historia.fotos) && historia.fotos.length > 0) {
                fotosActuales = historia.fotos.map(u => typeof u === 'string' ? u.replace(/['"]/g, '') : u);
            } else if (typeof historia.fotos === 'string' && historia.fotos.length > 5) {
                let urls = historia.fotos.replace(/[{}]/g, '').split(',');
                let cleanUrls = urls.map(u => u.trim().replace(/['"]/g, ''));
                if (cleanUrls[0].includes('http')) fotosActuales = cleanUrls;
            }
        }

        // Crear flechas del carrusel si hay más de 1 foto
        let flechas = '';
        if (fotosActuales.length > 1) {
             flechas = `
                <button onclick="window.cambiarFoto(-1)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:white; border:1px solid #00CCFF; padding:8px 12px; cursor:pointer; border-radius:50%; z-index:10; font-size:1.2rem;">◀</button>
                <button onclick="window.cambiarFoto(1)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.6); color:white; border:1px solid #00CCFF; padding:8px 12px; cursor:pointer; border-radius:50%; z-index:10; font-size:1.2rem;">▶</button>
             `;
        }

        panelLectura.innerHTML += `
            <div style="position: relative; width: 100%; height: 250px; margin-bottom: 20px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0, 204, 255, 0.2); background: #050505;">
                <img id="img-carrusel" src="${fotosActuales[0]}" style="width: 100%; height: 100%; object-fit: contain;">
                ${flechas}
            </div>
            <h1 class="aero-title-glow" style="text-align:center; color:white; margin-bottom:30px;">${historia.titulo}</h1>
        `;

        const parrafos = historia.texto.split(/\n+/);
        parrafos.forEach((p, idx) => {
            if (!p.trim()) return;
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

        if(tituloOpiniones) tituloOpiniones.innerText = 'OPINIONES ✨';
        if(panelOpiniones) panelOpiniones.innerHTML = '<p class="empty-msg" style="color:#aaa; text-align:center;">Haz clic en el icono 💬 de un párrafo para opinar.</p>';
        if(cajaComentario) cajaComentario.style.display = 'none';
    };

    // ==========================================
    // COMENTARIOS
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
        const inputComentario = document.querySelector('#caja-escribir-comentario input') || document.getElementById('input-nuevo-comentario');
        
        if(!inputComentario) return;

        const texto = inputComentario.value.trim();
        if (!texto) return;
        if (historiaActivaId === null || parrafoActivoIndex === null) return;

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

    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-enviar-comentario')) {
            window.enviarComentario();
        }
    });

    // Permitir enviar comentario con la tecla Enter
    const inputNuevoComentario = document.getElementById('input-nuevo-comentario');
    if (inputNuevoComentario) {
        inputNuevoComentario.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.enviarComentario();
            }
        });
    }

    // ==========================================
    // PUBLICAR NUEVA HISTORIA (SOPORTE MULTIPLE VERCEL BLOB)
    // ==========================================
    const formHistoria = document.getElementById('formulario-historia');
    
    if (formHistoria) {
        formHistoria.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const titulo = document.getElementById('titulo-historia').value;
            const autor = document.getElementById('autor-historia').value || 'Anónimo';
            const texto = document.getElementById('contenido-historia').value;
            const inputFotos = document.getElementById('fotos-historia'); 
            
            let fotos = []; 
            const btnSubmit = formHistoria.querySelector('button[type="submit"]');
            const textoOriginalBoton = btnSubmit.innerText;

            try {
                // 1. SUBIMOS TODAS LAS IMÁGENES A VERCEL BLOB PRIMERO
                if (inputFotos && inputFotos.files.length > 0) {
                    btnSubmit.innerText = 'Subiendo imágenes a Vercel Blob... ⏳'; 
                    btnSubmit.disabled = true;

                    const promesasSubida = Array.from(inputFotos.files).map(async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);

                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                        });

                        if (!uploadRes.ok) throw new Error(`Error al subir ${file.name}`);
                        
                        const uploadData = await uploadRes.json();
                        return uploadData.url; 
                    });

                    fotos = await Promise.all(promesasSubida);
                } else {
                    // Si no hay foto, enviamos un placeholder
                    fotos.push('https://placehold.co/600x300/111/0cf?text=Sin+Portada');
                }

                // 2. GUARDAMOS TODO EN NEON
                btnSubmit.innerText = 'Guardando en la Red Neon... 💾';
                
                const res = await fetch('/api/publicar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, autor, texto, fotos })
                });

                if (res.ok) {
                    formHistoria.reset();
                    
                    const previewFotos = document.getElementById('preview-fotos');
                    if (previewFotos) previewFotos.innerHTML = '';

                    const btnDescubre = document.getElementById('btn-descubre');
                    if(btnDescubre) btnDescubre.click(); 
                } else {
                    alert('Error al publicar la historia en la base de datos Neon.');
                }
            } catch (error) {
                console.error("Error publicando:", error);
                alert("Hubo un problema al subir las imágenes o publicar la historia.");
            } finally {
                btnSubmit.innerText = textoOriginalBoton;
                btnSubmit.disabled = false;
            }
        });
    }

    // ==========================================
    // CEREBRO COLECTIVO (BOT DE OPENAI)
    // ==========================================
    const btnEnviarBot = document.getElementById('btn-enviar-bot');
    const inputBot = document.getElementById('input-bot');
    const chatWindow = document.getElementById('chat-window');

    if (btnEnviarBot && inputBot && chatWindow) {
        async function enviarMensajeBot() {
            const msg = inputBot.value.trim();
            if (!msg) return;

            // Burbuja del usuario
            chatWindow.innerHTML += `
                <div style="text-align: right; margin-bottom: 15px;">
                    <span style="background: rgba(0, 204, 255, 0.2); border: 1px solid rgba(0, 204, 255, 0.4); padding: 10px 15px; border-radius: 12px; color: white; display: inline-block; max-width: 80%;">
                        ${msg}
                    </span>
                </div>`;
            inputBot.value = '';
            chatWindow.scrollTop = chatWindow.scrollHeight;

            // Burbuja de "Cargando..."
            const typingId = 'typing-' + Date.now();
            chatWindow.innerHTML += `
                <div id="${typingId}" style="text-align: left; margin-bottom: 15px;">
                    <span style="background: rgba(255, 255, 255, 0.05); border-left: 3px solid #00CCFF; padding: 10px 15px; border-radius: 8px; color: #00CCFF; display: inline-block;">
                        Conectando con la red neuronal... ⏳
                    </span>
                </div>`;
            chatWindow.scrollTop = chatWindow.scrollHeight;

            try {
                // Llamamos a la API de Flask que conecta con OpenAI
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ msg })
                });

                const data = await res.json();
                document.getElementById(typingId).remove(); // Quitamos el "Cargando..."

                if (res.ok) {
                    // Respuesta del bot
                    chatWindow.innerHTML += `
                        <div style="text-align: left; margin-bottom: 15px;">
                            <span style="background: rgba(255, 255, 255, 0.05); border-left: 3px solid #00CCFF; padding: 10px 15px; border-radius: 8px; color: #ddd; display: inline-block; max-width: 80%; line-height: 1.5;">
                                ${data.reply}
                            </span>
                        </div>`;
                } else {
                    chatWindow.innerHTML += `<div style="text-align: left; margin-bottom: 15px;"><span style="color: #ff4444;">Error: ${data.reply}</span></div>`;
                }
            } catch (error) {
                document.getElementById(typingId).remove();
                chatWindow.innerHTML += `<div style="text-align: left; margin-bottom: 15px;"><span style="color: #ff4444;">Fallo de conexión en el servidor del bot.</span></div>`;
            }
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        // Enviar con botón
        btnEnviarBot.addEventListener('click', enviarMensajeBot);

        // Enviar con tecla Enter
        inputBot.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                enviarMensajeBot();
            }
        });
    }
    // ==========================================
// LÓGICA DE LOGIN / REGISTRO
// ==========================================
let isLoginMode = true; // Empezamos en modo Iniciar Sesión

const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const authForm = document.getElementById('auth-form');

// Cambiar entre Login y Registro
toggleAuthBtn.addEventListener('click', () => {
  isLoginMode = !isLoginMode; // Invertimos el modo
  
  if (isLoginMode) {
    authTitle.textContent = "Iniciar Sesión";
    authSubmitBtn.textContent = "Entrar";
    authSwitchText.textContent = "¿No tienes cuenta?";
    toggleAuthBtn.textContent = "Regístrate aquí";
  } else {
    authTitle.textContent = "Crear Cuenta";
    authSubmitBtn.textContent = "Forjar mi destino (Registrar)";
    authSwitchText.textContent = "¿Ya tienes una llave?";
    toggleAuthBtn.textContent = "Inicia sesión";
  }
});

// Capturar los datos cuando el usuario le da a "Entrar" o "Registrar"
authForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Evitamos que la página se recargue
  
  const username = document.getElementById('username-input').value.trim();
  const password = document.getElementById('password-input').value.trim();
  
  if (!username || !password) {
    alert("Ey, no dejes campos vacíos xd");
    return;
  }

  console.log(`Preparando para enviar al servidor en modo: ${isLoginMode ? 'LOGIN' : 'REGISTRO'}`);
  console.log("Usuario:", username);
  console.log("Contraseña:", password); // Shh, es un secreto

  // ¡AQUÍ ES DONDE CONECTAREMOS CON EL BACKEND EN EL SIGUIENTE PASO!
  alert(`¡Atrapamos los datos del Frontend!\nModo: ${isLoginMode ? 'Login' : 'Registro'}\nUsuario: ${username}\n\nListos para mandar al servidor.`);
});

    // ==========================================
    // INICIO DE LA APLICACIÓN
    // ==========================================
    cambiarPantalla('descubrir'); 
});
