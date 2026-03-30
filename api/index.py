import os
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

def get_db_connection():
    # Crucial: Verifica que en Vercel tengas la variable DATABASE_URL
    return psycopg2.connect(os.environ.get('DATABASE_URL'), cursor_factory=RealDictCursor)

@app.route('/api/historias', methods=['GET'])
def get_historias():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM historias ORDER BY id DESC')
        historias = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(historias)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/publicar', methods=['POST'])
def publicar():
    data = request.json
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO historias (titulo, autor, texto, fotos) VALUES (%s, %s, %s, %s)',
                    (data['titulo'], data['autor'], data['texto'], data.get('fotos', [])))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
