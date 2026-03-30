from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
import os
import vercel_blob # 🌟 NUEVO: Importamos Vercel Blob
from werkzeug.utils import secure_filename # Para limpiar nombres de archivo

app = Flask(__name__)

# Función para conectarnos a Neon
def obtener_conexion():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

@app.route('/api/historias', methods=['GET', 'POST'])
def manejar_historias():
    if request.method == 'GET':
        conn = obtener_conexion()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            # 🌟 NUEVO: Ahora también traemos 'portada_url'
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
            # 🌟 NUEVO: Ahora recibimos datos como 'form-data', no como JSON
            titulo = request.form.get('titulo')
            autor = request.form.get('autor', 'Autor Anónimo')
            texto = request.form.get('texto')
            foto = request.files.get('foto') # 📸 NUEVO: Capturamos la foto

            portada_url = None # Por defecto, sin foto

            # 📸 NUEVO: Lógica para subir la foto a Vercel Blob
            if foto and foto.filename:
                # Limpiamos el nombre del archivo
                filename = secure_filename(foto.filename)
                
                # Subimos la foto a Vercel Blob y obtenemos la URL
                # Esta librería usa BLOB_READ_WRITE_TOKEN automáticamente
                blob = vercel_blob.put(
                    pathname=f"portadas/{filename}", # Ruta dentro de Blob
                    body=foto.read(), # El contenido del archivo
                    options={"content_type": foto.content_type}
                )
                portada_url = blob['url'] # ¡Aquí está el enlace público!

            # 🌟 NUEVO: Insertamos la nueva historia incluyendo 'portada_url'
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

if __name__ == '__main__':
    app.run()
