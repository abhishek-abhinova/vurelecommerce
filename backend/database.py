"""
Database configuration and connection utilities for MySQL
"""
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ecommerce_clothing'),
    'autocommit': True
}

# Connection pool
connection_pool = None

def init_pool():
    """Initialize the connection pool"""
    global connection_pool
    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="ecommerce_pool",
            pool_size=5,
            **DB_CONFIG
        )
        print("✅ Database connection pool created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create connection pool: {e}")
        return False

def get_connection():
    """Get a connection from the pool"""
    global connection_pool
    if connection_pool is None:
        init_pool()
    return connection_pool.get_connection()

def init_database():
    """Initialize database tables"""
    try:
        # First connect without database to create it if needed
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        cursor = conn.cursor()
        
        # Create database if not exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        cursor.execute(f"USE {DB_CONFIG['database']}")
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add is_verified column if not exists
        cursor.execute("""
            SELECT COUNT(*) as cnt FROM information_schema.columns 
            WHERE table_schema = %s AND table_name = 'users' AND column_name = 'is_verified'
        """, (DB_CONFIG['database'],))
        result = cursor.fetchone()
        if result and result[0] == 0:
            cursor.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE")
        
        # Create OTP codes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                purpose ENUM('register', 'login', 'reset') DEFAULT 'register',
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add profile columns if not exists
        for column, definition in [('phone', 'VARCHAR(20)'), ('date_of_birth', 'DATE')]:
            cursor.execute("""
                SELECT COUNT(*) as cnt FROM information_schema.columns 
                WHERE table_schema = %s AND table_name = 'users' AND column_name = %s
            """, (DB_CONFIG['database'], column))
            result = cursor.fetchone()
            if result and result[0] == 0:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column} {definition}")
        
        # Create products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                stock INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Active',
                image_url VARCHAR(500),
                colors JSON,
                sizes JSON,
                gallery_images JSON,
                video_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NULL,
                customer_name VARCHAR(200),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                total DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                items JSON NOT NULL,
                shipping_address TEXT,
                payment_method VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)
        
        # Add customer columns to orders if not exists
        for column, definition in [
            ('customer_name', 'VARCHAR(200)'), 
            ('customer_email', 'VARCHAR(255)'), 
            ('customer_phone', 'VARCHAR(50)'),
            ('payment_id', 'VARCHAR(100)'),  # For Razorpay payment ID
            ('completed_at', 'TIMESTAMP NULL')  # When order was completed/delivered
        ]:
            cursor.execute("""
                SELECT COUNT(*) as cnt FROM information_schema.columns 
                WHERE table_schema = %s AND table_name = 'orders' AND column_name = %s
            """, (DB_CONFIG['database'], column))
            result = cursor.fetchone()
            if result and result[0] == 0:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {column} {definition}")
        
        # Create categories table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create site_settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS site_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Create collections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                cover_image VARCHAR(500),
                format_type ENUM('short', 'long') DEFAULT 'short',
                is_active BOOLEAN DEFAULT TRUE,
                show_on_home BOOLEAN DEFAULT FALSE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create collection_products table (junction table)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collection_products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                collection_id INT NOT NULL,
                product_id INT NOT NULL,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_collection_product (collection_id, product_id)
            )
        """)
        
        # Add is_featured column to products if not exists
        cursor.execute("""
            SELECT COUNT(*) as cnt FROM information_schema.columns 
            WHERE table_schema = %s AND table_name = 'products' AND column_name = 'is_featured'
        """, (DB_CONFIG['database'],))
        result = cursor.fetchone()
        if result and result[0] == 0:
            cursor.execute("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE")
        
        # Add faqs column to products if not exists
        cursor.execute("""
            SELECT COUNT(*) as cnt FROM information_schema.columns 
            WHERE table_schema = %s AND table_name = 'products' AND column_name = 'faqs'
        """, (DB_CONFIG['database'],))
        result = cursor.fetchone()
        if result and result[0] == 0:
            cursor.execute("ALTER TABLE products ADD COLUMN faqs JSON")
        
        # Add related_products column to products if not exists
        cursor.execute("""
            SELECT COUNT(*) as cnt FROM information_schema.columns 
            WHERE table_schema = %s AND table_name = 'products' AND column_name = 'related_products'
        """, (DB_CONFIG['database'],))
        result = cursor.fetchone()
        if result and result[0] == 0:
            cursor.execute("ALTER TABLE products ADD COLUMN related_products JSON")
        
        # Create coupons table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
                discount_value DECIMAL(10, 2) NOT NULL,
                min_order_amount DECIMAL(10, 2) DEFAULT 0,
                max_uses INT DEFAULT NULL,
                used_count INT DEFAULT 0,
                expires_at TIMESTAMP NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create reviews table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                user_id INT NULL,
                reviewer_name VARCHAR(100) NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                is_admin_review BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)
        
        # Create contact_submissions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert default settings
        cursor.execute("""
            INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
            ('sale_banner', '{"enabled": true, "text": "LIMITED TIME OFFER - UP TO 50% OFF", "end_date": "2025-12-31T23:59:59"}')
        """)
        cursor.execute("""
            INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
            ('featured_products', '{"product_ids": []}')
        """)
        cursor.execute("""
            INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
            ('hero_slides', '{"slides": [{"title": "New Season Arrivals", "subtitle": "Spring/Summer 2024", "description": "Discover our latest collection", "image": "/elegant-fashion-model-blue-tones.jpg", "cta": "Shop Now", "href": "/shop"}, {"title": "Exclusive Collection", "subtitle": "Limited Edition", "description": "Handcrafted pieces for the modern wardrobe", "image": "/luxury-fashion-store-sapphire-blue.jpg", "cta": "Explore", "href": "/shop"}, {"title": "Summer Sale", "subtitle": "Up to 50% Off", "description": "Dont miss our biggest sale of the season", "image": "/summer-fashion-collection-navy-blue-aesthetic.jpg", "cta": "Shop Sale", "href": "/shop"}], "recommended_size": "1920x1080"}')
        """)
        cursor.execute("""
            INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
            ('shop_the_look', '{"enabled": true, "title": "Shop The Look", "product_ids": []}')
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Database tables initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        return False

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute a query and optionally fetch results"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.lastrowid
            
        return result
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
