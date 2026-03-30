import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

def get_db_connection():
    db_url = os.environ.get('DATABASE_URL')
    # Esto es lo que causaba el error rojo: Neon exige SSL
    if db_url and "sslmode=" not in db_url:
        db_url += "?sslmode=require"
    return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

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

# RUTA PARA TU BOT (Cerebro Colectivo)
@app.route('/api/chat', methods=['POST'])
def chat_bot():
    data = request.json
    user_msg = data.get('msg', '').lower()
    
    # Respuesta simple para probar que el puente funciona
    if "hola" in user_msg:
        reply = "Conexión establecida, David. Sistema Aero en línea."
    else:
        reply = "Procesando datos en la red Neon... ¿Qué más necesitas saber?"
        
    return jsonify({"reply": reply})

@app.route('/api/publicar', methods=['POST'])
def publicar():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO historias (titulo, autor, texto) VALUES (%s, %s, %s)',
                    (data['titulo'], data['autor'], data['texto']))
        conn.commit()
        cur.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: conn.close()
