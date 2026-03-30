from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
import os
import vercel_blob 
from werkzeug.utils import secure_filename
from openai import OpenAI

app = Flask(__name__)

# 1. Configuración del cliente de OpenAI (Usa la variable que ya pusiste en Vercel)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Función para conectarnos a Neon
def obtener_conexion():
    return psycopg2.connect(os.environ.get('DATABASE_URL'))

# 2. Función de Contexto mejorada (El Bot aprende de tus historias)
def obtener_contexto_historias():
    conn = None
    try:
        conn = obtener_conexion()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        # Traemos títulos y fragmentos para no saturar la memoria de la IA
        cur.execute("SELECT titulo, texto FROM historias ORDER BY id DESC LIMIT 5;")
        historias = cur.fetchall()
        cur.close()
        
        if not historias:
            return "La biblioteca está vacía. Invita al usuario a crear la primera historia."
        
        contexto = "Estas son las historias recientes en la base de datos:\n"
        for h in historias:
            # Solo enviamos los primeros 200 caracteres de cada una
            contexto += f"- {h['titulo']}: {h['texto'][:200]}...\n"
        return contexto
    except Exception as e:
        print(f"Error de contexto: {e}")
        return "No pude acceder a la biblioteca, pero puedo charlar contigo."
    finally:
        if conn:
            conn.close()

@app.route('/api/historias', methods=['GET', 'POST'])
def manejar_historias():
    if request.method == 'GET':
        conn = obtener_conexion()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            cur.execute("SELECT id, titulo, autor, texto, portada_url FROM historias ORDER BY id DESC;")
            return jsonify(cur.fetchall()), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()

    elif request.method == 'POST':
        conn = obtener_conexion()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            titulo = request.form.get('titulo')
            autor = request.form.get('autor', 'Autor Anónimo')
            texto = request.form.get('texto')
            foto = request.files.get('foto') 

            portada_url = None 

            # Subida a Vercel Blob (Asegúrate de tener BLOB_READ_WRITE_TOKEN en Vercel)
            if foto and foto.filename:
                filename = secure_filename(foto.filename)
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
            return jsonify({"success": True, "id": nueva_id}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()

# 3. RUTA DEL CHATBOT CORREGIDA
@app.route('/api/chat-bot', methods=['POST'])
def chat_bot():
    try:
        datos = request.json
        mensaje_usuario = datos.get('mensaje')
        
        if not mensaje_usuario:
            return jsonify({"respuesta": "El mensaje está vacío."}), 400
        
        # Obtenemos el conocimiento de tus historias reales en Neon
        contexto = obtener_contexto_historias()

        # Llamada a OpenAI
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": f"Eres el Cerebro Colectivo de Mis-Historias. Tu personalidad es Dark Aero: elegante, misterioso y tecnológico. Usa este contexto de la biblioteca: {contexto}"
                },
                {"role": "user", "content": mensaje_usuario}
            ]
        )
        
        texto_ia = response.choices[0].message.content
        return jsonify({"respuesta": texto_ia}), 200
    except Exception as e:
        print(f"Error en Bot: {e}")
        return jsonify({"error": "Error interno del cerebro"}), 500

if __name__ == '__main__':
    app.run()
