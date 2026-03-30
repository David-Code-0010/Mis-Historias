import os
from flask import Flask, request, jsonify
from flask_cors import CORS # Añadimos esto para evitar bloqueos del navegador
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app) # Esto permite que tu HTML hable con tu Python sin problemas

def get_db_connection():
    # El truco maestro: añadir sslmode=require para que Neon no te rechace
    db_url = os.environ.get('DATABASE_URL')
    if db_url and "sslmode=" not in db_url:
        # Forzamos el modo seguro si no viene en la URL
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
        print(f"Error en Neon: {e}") # Esto aparecerá en los logs de Vercel
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/publicar', methods=['POST'])
def publicar():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        # Aseguramos que 'fotos' sea un string o array manejable por Neon
        cur.execute('INSERT INTO historias (titulo, autor, texto, fotos) VALUES (%s, %s, %s, %s)',
                    (data['titulo'], data['autor'], data['texto'], data.get('fotos', [])))
        conn.commit()
        cur.close()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)
