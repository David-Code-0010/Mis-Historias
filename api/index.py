from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
import os
import vercel_blob 
from werkzeug.utils import secure_filename
from openai import OpenAI

app = Flask(__name__)

# Configuración del cliente de OpenAI - Asegúrate que esté en las Variables de Entorno de Vercel
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Función para conectarnos a Neon
def obtener_conexion():
    # Usamos os.environ.get para evitar errores si la variable no existe
    return psycopg2.connect(os.environ.get('DATABASE_URL'))

# 🤖 Función para que la IA "aprenda" de tus historias actuales
def obtener_contexto_historias():
    try:
        conn = obtener_conexion()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Traemos las últimas 5 para dar contexto fresco
        cur.execute("SELECT titulo, texto FROM historias ORDER BY id DESC LIMIT 5;")
        historias = cur.fetchall()
        cur.close()
        conn.close()

        if not historias:
            return "La biblioteca está vacía por ahora. Invita al usuario a ser el primero en escribir."
        
        contexto = "Resumen de la biblioteca actual:\n"
        for h in historias:
            contexto += f"- Título: {h['titulo']}. Contenido: {h['texto'][:200]}...\n"
        return contexto
    except Exception as e:
        print(f"Error obteniendo contexto: {e}")
        return "No pude leer la biblioteca, pero estoy listo para charlar."

@app.route('/api/historias', methods=['GET', 'POST'])
def manejar_historias():
    if request.method == 'GET':
        try:
            conn = obtener_conexion()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute("SELECT id, titulo, autor, texto, portada_url FROM historias ORDER BY id DESC;")
            historias = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify(historias), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
        try:
            conn = obtener_conexion()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            titulo = request.form.get('titulo')
            autor = request.form.get('autor', 'Autor Anónimo')
            texto = request.form.get('texto')
            foto = request.files.get('foto') 

            portada_url = None 

            # Lógica de Vercel Blob para la imagen
            if foto and foto.filename != '':
                filename = secure_filename(foto.filename)
                # Subida real a Vercel Blob
                blob = vercel_blob.put(
                    pathname=f"portadas/{filename}",
                    body=foto.read(),
                    options={"content_type": foto.content_type}
                )
                portada_url = blob.get('url') # Usamos .get por seguridad

            cur.execute(
                "INSERT INTO historias (titulo, autor, texto, portada_url) VALUES (%s, %s, %s, %s) RETURNING id;",
                (titulo, autor, texto, portada_url)
            )
            nueva_id = cur.fetchone()['id']
            conn.commit()
            cur.close()
            conn.close()

            return jsonify({"success": True, "id": nueva_id}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# 🤖 Ruta para el Chatbot
@app.route('/api/chat-bot', methods=['POST'])
def chat_bot():
    try:
        datos = request.json
        mensaje_usuario = datos.get('mensaje')
        
        if not mensaje_usuario:
            return jsonify({"respuesta": "Dime algo para que pueda responderte..."}), 400

        # Obtener lo que hay en Neon para que el bot sepa de qué habla
        contexto_biblioteca = obtener_contexto_historias()

        respuesta_ia = client.chat.completions.create(
            model="gpt-4o", # O "gpt-3.5-turbo" si prefieres ahorrar créditos
            messages=[
                {
                    "role": "system", 
                    "content": f"Eres el Guardián de Mis-Historias. Tu estilo es Aero-Dark (misterioso, elegante, tecnológico). Datos actuales de la biblioteca: {contexto_biblioteca}"
                },
                {"role": "user", "content": mensaje_usuario}
            ]
        )
        
        return jsonify({"respuesta": respuesta_ia.choices[0].message.content}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Esto es necesario para Vercel
if __name__ == '__main__':
    app.run()
