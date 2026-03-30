def get_db_connection():
    db_url = os.environ.get('DATABASE_URL')
    # Si la URL no tiene el modo SSL, se lo pegamos a la fuerza
    if db_url and "sslmode=" not in db_url:
        db_url += "?sslmode=require"
    return psycopg2.connect(db_url, cursor_factory=RealDictCursor)
    
