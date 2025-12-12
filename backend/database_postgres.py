"""
PostgreSQL database configuration for Render deployment
"""
import psycopg2
from psycopg2 import pool
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration for PostgreSQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'vurel_ecommerce'),
    'port': os.getenv('DB_PORT', '5432')
}

# Connection pool
connection_pool = None

def init_pool():
    """Initialize PostgreSQL connection pool"""
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 20,
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            port=DB_CONFIG['port']
        )
        print("✅ PostgreSQL connection pool created")
        return True
    except Exception as e:
        print(f"❌ Failed to create PostgreSQL pool: {e}")
        return False

def get_connection():
    """Get connection from pool"""
    global connection_pool
    if connection_pool is None:
        init_pool()
    return connection_pool.getconn()

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute PostgreSQL query"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.lastrowid if hasattr(cursor, 'lastrowid') else None
            
        return result
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            connection_pool.putconn(conn)