from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
import os
import vercel_blob 
from werkzeug.utils import secure_filename
from openai import OpenAI # 🤖 NUEVO: Para el cerebro del Bot

app = Flask(__name__)

# Configuración del cliente de OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Función para conectarnos a Neon
def obtener_conexion():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

# 🤖 NUEVO: Función para que la IA "aprenda" de tus historias actuales
def obtener_contexto_historias():
    conn = obtener_conexion()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute("SELECT titulo, texto FROM historias ORDER BY id DESC LIMIT 5;")
        historias = cur.fetchall()
        if not historias:
            return "Aún no hay historias publicadas."
        
        contexto = "Contexto de la biblioteca actual:\n"
        for h in historias:
            contexto += f"- Título: {h['titulo']}. Fragmento: {h['texto'][:300]}...\n"
        return contexto
    except:
        return "Error al leer la biblioteca."
    finally:
        cur.close()
        conn.close()

@app.route('/api/historias', methods=['GET', 'POST'])
def manejar_historias():
    if request.method == 'GET':
        conn = obtener_conexion()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            cur.execute("SELECT id, titulo, autor, texto, portada_url FROM historias ORDER BY id DESC;")
            historias = cur.fetchall()
            return jsonify(historias), 200
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

            if foto and foto.filename:
                filename = secure_filename(foto.filename)
                blob = vercel_blob.put(
                    pathname=f"portadas/{filename}",
                    body=foto.read(),
                    options={"content_type": foto.content_type}
                )
                portada_url = blob['url'] 

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

# 🤖 NUEVO: Ruta para hablar con el Bot
@app.route('/api/chat-bot', methods=['POST'])
def chat_bot():
    try:
        datos = request.json
        mensaje_usuario = datos.get('mensaje')
        
        # La IA obtiene el contexto de lo que han escrito los usuarios
        contexto_biblioteca = obtener_contexto_historias()

        respuesta_ia = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": f"Eres el Bot guardián de 'Mis Historias'. Tu conocimiento se basa en las historias que los usuarios publican. Aquí tienes un resumen de lo último publicado: {contexto_biblioteca}. Responde de forma creativa, skeuomórfica y dark."
                },
                {"role": "user", "content": mensaje_usuario}
            ]
        )
        
        return jsonify({"respuesta": respuesta_ia.choices[0].message.content}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run()
