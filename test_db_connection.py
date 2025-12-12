import mysql.connector
import os

# Test database connection
try:
    conn = mysql.connector.connect(
        host='localhost',  # or your hostinger host
        user='u327799122_vurel',
        password='your_password_here',
        database='u327799122_vurel_database'
    )
    print("✅ Database connection successful!")
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"📋 Found {len(tables)} tables")
    conn.close()
except Exception as e:
    print(f"❌ Connection failed: {e}")