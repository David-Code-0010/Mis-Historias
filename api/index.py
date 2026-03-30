import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from openai import OpenAI
import vercel_blob

app = Flask(__name__)
CORS(app) # Vital para que el navegador no bloquee la conexión

# Configuración de OpenAI (Asegúrate de tener OPENAI_API_KEY en Vercel)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def get_db_connection():
    # Buscamos primero la nueva llave generada por la integración de Neon
    db_url = os.environ.get('DATABASE_URL_UNPOOLED') or os.environ.get('DATABASE_URL')
    
    if not db_url:
        raise Exception("Falta la variable de entorno de la base de datos en Vercel.")
        
    # Nos aseguramos de que el escudo SSL esté activo
    if "sslmode=" not in db_url:
        if "?" in db_url:
            db_url += "&sslmode=require"
        else:
            db_url += "?sslmode=require"
            
    return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

# --- RUTAS DE LA BIBLIOTECA ---

@app.route('/api/historias', methods=['GET'])
def get_historias():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM historias ORDER BY id DESC')
        historias = cur.fetchall()
        cur.close()
        return jsonify(historias)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

@app.route('/api/publicar', methods=['POST'])
def publicar():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Insertamos título, autor y texto. Las fotos se guardan como array/texto.
        cur.execute('INSERT INTO historias (titulo, autor, texto, fotos) VALUES (%s, %s, %s, %s)',
                    (data['titulo'], data['autor'], data['texto'], data.get('fotos', [])))
        conn.commit()
        cur.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()

# --- RUTA DEL BOT (CEREBRO COLECTIVO) ---

@app.route('/api/chat', methods=['POST'])
def chat_bot():
    data = request.json
    user_message = data.get('msg', '')

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres el Cerebro Colectivo de mis-historias, un asistente con estética Dark Aero. Eres creativo y ayudas a David con sus relatos."},
                {"role": "user", "content": user_message}
            ]
        )
        reply = response.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": "Error en la red neuronal: " + str(e)}), 500

# --- RUTA PARA SUBIR IMÁGENES (VERCEL BLOB) ---

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    
    try:
        # Sube la imagen a Vercel Blob y devuelve la URL
        blob = vercel_blob.put(file.filename, file.read())
        return jsonify({"url": blob['url']})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
