from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)

# Función para conectarnos a Neon
def obtener_conexion():
    # Vercel leerá la URL de tu variable de entorno secreta
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    return conn

@app.route('/api/historias', methods=['GET', 'POST'])
def manejar_historias():
    conn = obtener_conexion()
    # Usamos RealDictCursor para que los resultados salgan como diccionarios (JSON)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if request.method == 'GET':
        try:
            # Consultamos las historias ordenadas de la más nueva a la más vieja
            cur.execute("SELECT id, titulo, autor, texto FROM historias ORDER BY id DESC;")
            historias = cur.fetchall()
            
            # En un proyecto completo, aquí también pediríamos las fotos y comentarios
            # Pero empecemos por traer los textos básicos primero.
            
            return jsonify(historias), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()

    elif request.method == 'POST':
        try:
            datos = request.json
            titulo = datos.get('titulo')
            autor = datos.get('autor', 'Tú (Autor)')
            texto = datos.get('texto')

            # Insertamos la nueva historia
            cur.execute(
                "INSERT INTO historias (titulo, autor, texto) VALUES (%s, %s, %s) RETURNING id;",
                (titulo, autor, texto)
            )
            nueva_id = cur.fetchone()['id']
            conn.commit() # Guardamos los cambios

            return jsonify({"success": True, "id": nueva_id}), 201
        except Exception as e:
            conn.rollback() # Si hay error, cancelamos la operación
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()

# Esto es necesario para que Vercel ejecute Flask correctamente
if __name__ == '__main__':
    app.run()
