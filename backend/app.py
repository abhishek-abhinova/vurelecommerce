"""
Flask Backend API for Ecommerce Clothing Website
Provides all endpoints needed by the Next.js frontend
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader

# Load environment variables
load_dotenv()

# Configure Cloudinary with optimized settings
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

# Initialize Razorpay client
import razorpay
razorpay_client = razorpay.Client(auth=(os.getenv('RAZORPAY_KEY_ID'), os.getenv('RAZORPAY_KEY_SECRET')))


# Import database and models
from database import init_database, init_pool
from models import (
    # User operations
    create_user, find_user_by_email, find_user_by_id, verify_password, get_all_customers,
    # Product operations
    create_product, get_all_products, get_product_by_id, update_product, delete_product,
    # Order operations
    create_order, get_all_orders, get_user_orders, get_order_by_id, update_order_status,
    # Dashboard
    get_dashboard_stats,
    # Categories
    create_category, get_all_categories, get_active_categories, update_category, delete_category, get_categories_with_subcategories,
    # Settings
    get_sale_banner, update_sale_banner, get_hero_slides, update_hero_slides, get_scrolling_text, update_scrolling_text,
    # Homepage Sections
    get_our_story, update_our_story, get_testimonials, update_testimonials, get_shop_the_look, update_shop_the_look,
    # Featured Products
    get_featured_products, set_product_featured,
    # Collections
    create_collection, get_all_collections, get_home_collections, get_collection_by_id,
    update_collection, delete_collection, get_collection_products, set_collection_products,
    # OTP
    create_otp, verify_otp, set_user_verified, create_user_unverified,
    # Coupons
    create_coupon, get_all_coupons, get_coupon_by_code, validate_coupon, use_coupon, update_coupon, delete_coupon,
    # Reviews
    create_review, get_product_reviews, get_all_reviews, verify_review, delete_review, get_product_rating,
    # Contact Submissions
    create_contact, get_all_contacts, get_contact_by_id, update_contact_status, delete_contact
)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
JWT_EXPIRY_HOURS = 24
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size for video uploads

# ==================== AUTHENTICATION MIDDLEWARE ====================

def token_required(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'detail': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'detail': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = find_user_by_id(data['user_id'])
            if not current_user:
                return jsonify({'detail': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'detail': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'detail': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.get('is_admin'):
            return jsonify({'detail': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user_id):
    """Generate JWT token for a user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'detail': f'{field} is required'}), 400
        
        # Check if email already exists
        existing_user = find_user_by_email(data['email'])
        if existing_user:
            return jsonify({'detail': 'Email already registered'}), 400
        
        # Create user
        user_id = create_user(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=data['password']
        )
        
        # Get the created user
        user = find_user_by_id(user_id)
        token = generate_token(user_id)
        
        return jsonify({
            'access_token': token,
            'token_type': 'bearer',
            'user': {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email'],
                'is_admin': user['is_admin']
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'detail': 'Email and password are required'}), 400
        
        # Find user
        user = find_user_by_email(data['email'])
        if not user:
            return jsonify({'detail': 'Invalid email or password'}), 401
        
        # Verify password
        if not verify_password(user['password_hash'], data['password']):
            return jsonify({'detail': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user['id'])
        
        return jsonify({
            'access_token': token,
            'token_type': 'bearer',
            'user': {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email'],
                'is_admin': user['is_admin']
            }
        })
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current authenticated user"""
    return jsonify({
        'id': current_user['id'],
        'first_name': current_user['first_name'],
        'last_name': current_user['last_name'],
        'email': current_user['email'],
        'is_admin': current_user['is_admin'],
        'phone': current_user.get('phone', ''),
        'date_of_birth': str(current_user.get('date_of_birth', '')) if current_user.get('date_of_birth') else '',
        'created_at': str(current_user.get('created_at', ''))
    })

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_user_profile(current_user):
    """Get user profile"""
    return jsonify({
        'id': current_user['id'],
        'first_name': current_user['first_name'],
        'last_name': current_user['last_name'],
        'email': current_user['email'],
        'phone': current_user.get('phone', ''),
        'date_of_birth': str(current_user.get('date_of_birth', '')) if current_user.get('date_of_birth') else '',
        'created_at': str(current_user.get('created_at', ''))
    })

@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_user_profile(current_user):
    """Update user profile"""
    try:
        data = request.get_json()
        from database import execute_query
        
        # Update user profile
        query = """
            UPDATE users SET first_name = %s, last_name = %s, phone = %s, date_of_birth = %s
            WHERE id = %s
        """
        date_of_birth = data.get('date_of_birth') if data.get('date_of_birth') else None
        execute_query(query, (
            data.get('first_name', current_user['first_name']),
            data.get('last_name', current_user['last_name']),
            data.get('phone', ''),
            date_of_birth,
            current_user['id']
        ))
        
        return jsonify({'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== OTP ROUTES ====================

@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to email for registration or login"""
    try:
        data = request.get_json()
        email = data.get('email')
        purpose = data.get('purpose', 'register')
        
        if not email:
            return jsonify({'detail': 'Email is required'}), 400
        
        # For registration, check if email already exists
        if purpose == 'register':
            existing = find_user_by_email(email)
            if existing and existing.get('is_verified'):
                return jsonify({'detail': 'Email already registered'}), 400
        
        # For login, check if user exists
        if purpose == 'login':
            existing = find_user_by_email(email)
            if not existing:
                return jsonify({'detail': 'Email not found'}), 404
        
        # Generate and store OTP
        otp_code = create_otp(email, purpose)
        
        # Send OTP via email
        email_sent = send_email_otp(email, otp_code, purpose)
        
        # Log OTP for development/debugging
        print(f"📧 OTP Code for {email}: {otp_code}")
        
        return jsonify({
            'message': 'OTP sent successfully',
            'email': email,
            'email_sent': email_sent,
            # Only include OTP in development for testing
            'otp_code_dev_only': otp_code  # REMOVE IN PRODUCTION
        })
        
    except Exception as e:
        print(f"Send OTP error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp_route():
    """Verify OTP code"""
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')
        purpose = data.get('purpose', 'register')
        
        if not email or not code:
            return jsonify({'detail': 'Email and OTP code are required'}), 400
        
        if not verify_otp(email, code, purpose):
            return jsonify({'detail': 'Invalid or expired OTP'}), 400
        
        # For registration completion
        if purpose == 'register':
            set_user_verified(email)
            user = find_user_by_email(email)
            if user:
                token = generate_token(user['id'])
                return jsonify({
                    'message': 'Email verified successfully',
                    'access_token': token,
                    'token_type': 'bearer',
                    'user': {
                        'id': user['id'],
                        'first_name': user['first_name'],
                        'last_name': user['last_name'],
                        'email': user['email'],
                        'is_admin': user['is_admin']
                    }
                })
        
        # For OTP login
        if purpose == 'login':
            user = find_user_by_email(email)
            if user:
                token = generate_token(user['id'])
                return jsonify({
                    'message': 'Login successful',
                    'access_token': token,
                    'token_type': 'bearer',
                    'user': {
                        'id': user['id'],
                        'first_name': user['first_name'],
                        'last_name': user['last_name'],
                        'email': user['email'],
                        'is_admin': user['is_admin']
                    }
                })
        
        return jsonify({'message': 'OTP verified successfully'})
        
    except Exception as e:
        print(f"Verify OTP error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/auth/register-with-otp', methods=['POST'])
def register_with_otp():
    """Register user and send OTP for verification"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['first_name', 'last_name', 'email', 'password']
        for field in required:
            if not data.get(field):
                return jsonify({'detail': f'{field} is required'}), 400
        
        # Check if email already exists with verified account
        existing = find_user_by_email(data['email'])
        if existing and existing.get('is_verified'):
            return jsonify({'detail': 'Email already registered'}), 400
        
        # Create unverified user (or update if exists but not verified)
        if existing and not existing.get('is_verified'):
            # Delete old unverified account
            from database import execute_query
            execute_query("DELETE FROM users WHERE email = %s AND is_verified = FALSE", (data['email'],))
        
        # Create new unverified user
        user_id = create_user_unverified(
            data['first_name'],
            data['last_name'],
            data['email'],
            data['password']
        )
        
        # Generate and send OTP
        otp_code = create_otp(data['email'], 'register')
        print(f"📧 Registration OTP for {data['email']}: {otp_code}")
        
        return jsonify({
            'message': 'Account created. Please verify your email.',
            'user_id': user_id,
            'email': data['email'],
            'otp_code_dev_only': otp_code  # REMOVE IN PRODUCTION
        }), 201
        
    except Exception as e:
        print(f"Register with OTP error: {e}")
        return jsonify({'detail': str(e)}), 500

# Email sending utility
def send_email_otp(to_email, otp_code, purpose='login'):
    """Send OTP via email using SMTP"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    from_name = os.getenv('SMTP_FROM_NAME', 'Vurel Store')
    
    if not smtp_user or not smtp_password or smtp_password == 'your-app-password':
        print(f"📧 Email not configured. OTP for {to_email}: {otp_code}")
        return False
    
    subject_map = {
        'login': 'Your Vurel Login OTP',
        'register': 'Verify Your Vurel Account',
        'password_reset': 'Reset Your Vurel Password'
    }
    
    subject = subject_map.get(purpose, 'Your Vurel OTP')
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0D2440; text-align: center;">Vurel</h2>
        <p>Your OTP code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2E5E99; letter-spacing: 8px; margin: 0;">{otp_code}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
    """
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{from_name} <{smtp_user}>"
        msg['To'] = to_email
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
        
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email send error: {e}")
        return False

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Send OTP for password reset"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'detail': 'Email is required'}), 400
        
        user = find_user_by_email(email)
        if not user:
            return jsonify({'detail': 'Email not found'}), 404
        
        otp_code = create_otp(email, 'reset')
        send_email_otp(email, otp_code, 'password_reset')
        
        return jsonify({
            'message': 'Password reset OTP sent to your email',
            'email': email,
            'otp_code_dev_only': otp_code  # REMOVE IN PRODUCTION
        })
        
    except Exception as e:
        print(f"Forgot password error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password after OTP verification"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp_code = data.get('code')
        new_password = data.get('new_password')
        
        if not email or not otp_code or not new_password:
            return jsonify({'detail': 'Email, OTP code, and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'detail': 'Password must be at least 6 characters'}), 400
        
        if not verify_otp(email, otp_code, 'reset'):
            return jsonify({'detail': 'Invalid or expired OTP'}), 400
        
        # Update password
        from database import execute_query
        import bcrypt
        hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        execute_query("UPDATE users SET password_hash = %s WHERE email = %s", (hashed, email))
        
        return jsonify({'message': 'Password reset successfully'})
        
    except Exception as e:
        print(f"Reset password error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== PUBLIC PRODUCT ROUTES ====================

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products (public)"""
    try:
        products = get_all_products()
        return jsonify(products)
    except Exception as e:
        print(f"Get products error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product (public)"""
    try:
        product = get_product_by_id(product_id)
        if not product:
            return jsonify({'detail': 'Product not found'}), 404
        return jsonify(product)
    except Exception as e:
        print(f"Get product error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== PUBLIC COLLECTIONS ROUTES ====================

@app.route('/api/collections/home', methods=['GET'])
def get_collections_for_home():
    """Get collections to display on homepage"""
    try:
        collections = get_home_collections()
        return jsonify(collections)
    except Exception as e:
        print(f"Get home collections error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/collections', methods=['GET'])
def get_public_collections():
    """Get all active collections"""
    try:
        collections = get_all_collections()
        # Filter to only active collections
        active_collections = [c for c in collections if c.get('is_active', True)]
        return jsonify(active_collections)
    except Exception as e:
        print(f"Get collections error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/collections/<int:collection_id>', methods=['GET'])
def get_public_collection(collection_id):
    """Get a single collection by ID"""
    try:
        collection = get_collection_by_id(collection_id)
        if not collection:
            return jsonify({'detail': 'Collection not found'}), 404
        return jsonify(collection)
    except Exception as e:
        print(f"Get collection error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/collections/<int:collection_id>/products', methods=['GET'])
def get_public_collection_products(collection_id):
    """Get all products in a collection"""
    try:
        products = get_collection_products(collection_id)
        return jsonify(products)
    except Exception as e:
        print(f"Get collection products error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== USER ORDER ROUTES ====================

@app.route('/api/orders', methods=['POST'])
def create_new_order():
    """Create a new order - supports both guests and logged-in users"""
    try:
        data = request.get_json()
        
        if not data.get('items') or not data.get('total'):
            return jsonify({'detail': 'Items and total are required'}), 400
        
        customer_id = None
        user = None
        access_token = None
        
        # Check if user is authenticated
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                user = find_user_by_id(payload['user_id'])
                if user:
                    customer_id = user['id']
            except:
                pass
        
        # If no authenticated user, create account from order data
        if not customer_id:
            email = data.get('customer_email')
            name = data.get('customer_name', 'Guest').split(' ', 1)
            first_name = name[0] if len(name) > 0 else 'Guest'
            last_name = name[1] if len(name) > 1 else ''
            phone = data.get('customer_phone', '')
            
            if email:
                # Check if user exists
                existing_user = find_user_by_email(email)
                if existing_user:
                    customer_id = existing_user['id']
                    user = existing_user
                else:
                    # Create new user account with random password
                    import secrets
                    temp_password = secrets.token_urlsafe(12)
                    
                    from database import execute_query
                    import bcrypt
                    password_hash = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    
                    query = """
                        INSERT INTO users (first_name, last_name, email, password_hash, phone, is_verified)
                        VALUES (%s, %s, %s, %s, %s, TRUE)
                    """
                    customer_id = execute_query(query, (first_name, last_name, email, password_hash, phone))
                    user = find_user_by_id(customer_id)
                
                # Generate token for auto-login
                if user:
                    access_token = generate_token(user['id'])
        
        # Create the order
        order_id = create_order(
            customer_id=customer_id,
            items=data['items'],
            total=data['total'],
            shipping_address=data.get('shipping_address'),
            payment_method=data.get('payment_method', 'COD'),
            customer_name=data.get('customer_name'),
            customer_email=data.get('customer_email'),
            customer_phone=data.get('customer_phone'),
            payment_id=data.get('payment_id')
        )
        
        # Use coupon if provided
        if data.get('coupon_id'):
            use_coupon(data['coupon_id'])
        
        order = get_order_by_id(order_id)
        
        response_data = {
            'id': order['id'],
            'status': order.get('status', 'Pending'),
            'total': float(order['total']),
            'message': 'Order placed successfully!'
        }
        
        # Include auth data if new account created or user found
        if access_token and user:
            response_data['access_token'] = access_token
            response_data['token_type'] = 'bearer'
            response_data['user'] = {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email'],
                'is_admin': user.get('is_admin', False)
            }
            response_data['account_created'] = True
        
        return jsonify(response_data), 201
        
    except Exception as e:
        print(f"Create order error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'detail': str(e)}), 500

@app.route('/api/user/orders', methods=['GET'])
@token_required
def get_my_orders(current_user):
    """Get all orders for the current user"""
    try:
        orders = get_user_orders(current_user['id'])
        return jsonify(orders)
    except Exception as e:
        print(f"Get user orders error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/user/orders/<int:order_id>', methods=['GET'])
def get_my_order(order_id):
    """Get a specific order - works for logged in users and recently placed orders"""
    try:
        # Try to get user from token if provided
        user_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                user_id = payload.get('user_id')
            except:
                pass
        
        # Get order (public access for order confirmation)
        order = get_order_by_id(order_id)
        if not order:
            return jsonify({'detail': 'Order not found'}), 404
        return jsonify(order)
    except Exception as e:
        print(f"Get user order error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== RAZORPAY PAYMENT ====================

@app.route('/api/payment/create-order', methods=['POST'])
def create_razorpay_order():
    """Create a Razorpay order for online payment"""
    try:
        data = request.get_json()
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to paise
        
        if amount < 100:  # Minimum INR 1
            return jsonify({'detail': 'Amount must be at least INR 1'}), 400
        
        razorpay_order = razorpay_client.order.create({
            'amount': amount,
            'currency': 'INR',
            'payment_capture': 1
        })
        
        return jsonify({
            'order_id': razorpay_order['id'],
            'amount': amount,
            'currency': 'INR',
            'key_id': os.getenv('RAZORPAY_KEY_ID')
        })
    except Exception as e:
        print(f"Razorpay order creation error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/payment/verify', methods=['POST'])
def verify_razorpay_payment():
    """Verify Razorpay payment signature"""
    try:
        data = request.get_json()
        
        params_dict = {
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature')
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        return jsonify({
            'verified': True,
            'payment_id': data.get('razorpay_payment_id')
        })
    except razorpay.errors.SignatureVerificationError:
        return jsonify({'verified': False, 'detail': 'Invalid signature'}), 400
    except Exception as e:
        print(f"Payment verification error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/transactions', methods=['GET'])
@token_required
@admin_required
def get_all_transactions(current_user):
    """Get all transactions for admin panel"""
    try:
        from database import execute_query
        
        query = """
            SELECT 
                o.id as order_id,
                COALESCE(o.customer_name, CONCAT(u.first_name, ' ', u.last_name)) as customer_name,
                COALESCE(o.customer_email, u.email) as customer_email,
                COALESCE(o.customer_phone, u.phone) as customer_phone,
                o.total as amount,
                o.payment_method,
                o.payment_id,
                o.status,
                o.created_at
            FROM orders o
            LEFT JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
        """
        
        results = execute_query(query, fetch_all=True)
        transactions = []
        for row in results:
            transactions.append({
                'order_id': row.get('order_id'),
                'customer_name': row.get('customer_name') or 'Guest',
                'customer_email': row.get('customer_email') or '',
                'customer_phone': row.get('customer_phone') or '',
                'amount': float(row.get('amount')) if row.get('amount') else 0,
                'payment_method': row.get('payment_method') or 'cod',
                'payment_id': row.get('payment_id') or '',
                'status': row.get('status'),
                'created_at': str(row.get('created_at')) if row.get('created_at') else ''
            })
        
        return jsonify(transactions)
    except Exception as e:
        print(f"Get transactions error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== ADMIN DASHBOARD ====================


@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
@admin_required
def admin_dashboard(current_user):
    """Get dashboard statistics"""
    try:
        stats = get_dashboard_stats()
        return jsonify(stats)
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== ADMIN CUSTOMERS ROUTES ====================

@app.route('/api/admin/customers', methods=['GET'])
@token_required
@admin_required
def admin_get_customers(current_user):
    """Get all customers (non-admin users)"""
    try:
        customers = get_all_customers()
        return jsonify(customers)
    except Exception as e:
        print(f"Get customers error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>', methods=['GET'])
@token_required
@admin_required
def admin_get_customer(current_user, customer_id):
    """Get a single customer by ID"""
    try:
        customer = find_user_by_id(customer_id)
        if not customer:
            return jsonify({'detail': 'Customer not found'}), 404
        return jsonify(customer)
    except Exception as e:
        print(f"Get customer error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>/orders', methods=['GET'])
@token_required
@admin_required
def admin_get_customer_orders(current_user, customer_id):
    """Get all orders for a specific customer"""
    try:
        orders = get_user_orders(customer_id)
        return jsonify(orders)
    except Exception as e:
        print(f"Get customer orders error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/customers/<int:customer_id>/addresses', methods=['GET'])
@token_required
@admin_required
def admin_get_customer_addresses(current_user, customer_id):
    """Get all unique shipping addresses for a customer from their orders"""
    try:
        from database import execute_query
        query = """
            SELECT DISTINCT shipping_address 
            FROM orders 
            WHERE customer_id = %s AND shipping_address IS NOT NULL AND shipping_address != ''
            ORDER BY created_at DESC
        """
        result = execute_query(query, (customer_id,), fetch_all=True)
        addresses = [r['shipping_address'] for r in result if r.get('shipping_address')]
        return jsonify(addresses)
    except Exception as e:
        print(f"Get customer addresses error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== ADMIN PRODUCT ROUTES ====================

@app.route('/api/admin/products', methods=['GET'])
@token_required
@admin_required
def admin_get_products(current_user):
    """Get all products (admin)"""
    try:
        products = get_all_products()
        return jsonify(products)
    except Exception as e:
        print(f"Admin get products error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/products', methods=['POST'])
@token_required
@admin_required
def admin_create_product(current_user):
    """Create a new product"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('category') or data.get('price') is None:
            return jsonify({'detail': 'Name, category, and price are required'}), 400
        
        product_id = create_product(
            name=data['name'],
            category=data['category'],
            price=data['price'],
            stock=data.get('stock', 0),
            description=data.get('description'),
            image_url=data.get('image_url'),
            colors=data.get('colors'),
            sizes=data.get('sizes'),
            gallery_images=data.get('gallery_images'),
            video_url=data.get('video_url'),
            faqs=data.get('faqs'),
            related_products=data.get('related_products'),
            original_price=data.get('original_price')
        )
        
        product = get_product_by_id(product_id)
        return jsonify(product), 201
        
    except Exception as e:
        print(f"Create product error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_product(current_user, product_id):
    """Update a product"""
    try:
        data = request.get_json()
        
        # Check if product exists
        existing = get_product_by_id(product_id)
        if not existing:
            return jsonify({'detail': 'Product not found'}), 404
        
        update_product(
            product_id,
            name=data.get('name'),
            description=data.get('description'),
            category=data.get('category'),
            price=data.get('price'),
            stock=data.get('stock'),
            image_url=data.get('image_url'),
            colors=data.get('colors'),
            sizes=data.get('sizes'),
            gallery_images=data.get('gallery_images'),
            video_url=data.get('video_url'),
            faqs=data.get('faqs'),
            related_products=data.get('related_products')
        )
        
        product = get_product_by_id(product_id)
        return jsonify(product)
        
    except Exception as e:
        print(f"Update product error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_product(current_user, product_id):
    """Delete a product"""
    try:
        # Check if product exists
        existing = get_product_by_id(product_id)
        if not existing:
            return jsonify({'detail': 'Product not found'}), 404
        
        delete_product(product_id)
        return jsonify({'message': 'Product deleted successfully'})
        
    except Exception as e:
        print(f"Delete product error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== ADMIN ORDER ROUTES ====================

@app.route('/api/admin/orders', methods=['GET'])
@token_required
@admin_required
def admin_get_orders(current_user):
    """Get all orders (admin)"""
    try:
        orders = get_all_orders()
        return jsonify(orders)
    except Exception as e:
        print(f"Admin get orders error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/orders/<int:order_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_order(current_user, order_id):
    """Update order status"""
    try:
        data = request.get_json()
        
        if not data.get('status'):
            return jsonify({'detail': 'Status is required'}), 400
        
        # Check if order exists
        existing = get_order_by_id(order_id)
        if not existing:
            return jsonify({'detail': 'Order not found'}), 404
        
        update_order_status(order_id, data['status'])
        order = get_order_by_id(order_id)
        return jsonify(order)
        
    except Exception as e:
        print(f"Update order error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== FILE UPLOAD (CLOUDINARY) ====================

@app.route('/api/upload/image', methods=['POST'])
@token_required
@admin_required
def upload_image(current_user):
    """Upload an image to Cloudinary with optimized compression"""
    try:
        if 'file' not in request.files:
            return jsonify({'detail': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'detail': 'No file selected'}), 400
        
        # Upload to Cloudinary with optimization
        # quality: 90 for crystal clear images, auto format for best compression
        result = cloudinary.uploader.upload(
            file,
            folder="ecommerce/products",
            quality="auto:best",  # Best quality with smart compression
            fetch_format="auto",  # Auto-select best format (webp, jpg, etc)
            transformation=[
                {"quality": 90, "fetch_format": "auto"},
                {"flags": "preserve_transparency"}
            ]
        )
        
        return jsonify({
            'url': result['secure_url'],
            'public_id': result['public_id'],
            'width': result.get('width'),
            'height': result.get('height')
        }), 201
        
    except Exception as e:
        print(f"Image upload error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/upload/gallery', methods=['POST'])
@token_required
@admin_required
def upload_gallery_images(current_user):
    """Upload multiple images for product gallery"""
    try:
        if 'files' not in request.files:
            return jsonify({'detail': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        if not files or all(f.filename == '' for f in files):
            return jsonify({'detail': 'No files selected'}), 400
        
        uploaded_urls = []
        for file in files:
            if file.filename:
                result = cloudinary.uploader.upload(
                    file,
                    folder="ecommerce/gallery",
                    quality="auto:best",
                    fetch_format="auto",
                    transformation=[
                        {"quality": 90, "fetch_format": "auto"},
                        {"flags": "preserve_transparency"}
                    ]
                )
                uploaded_urls.append({
                    'url': result['secure_url'],
                    'public_id': result['public_id']
                })
        
        return jsonify({'images': uploaded_urls}), 201
        
    except Exception as e:
        print(f"Gallery upload error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/upload/video', methods=['POST'])
@token_required
@admin_required
def upload_video(current_user):
    """Upload a video to Cloudinary"""
    try:
        if 'file' not in request.files:
            return jsonify({'detail': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'detail': 'No file selected'}), 400
        
        print(f"Video upload started: {file.filename}")
        
        # Simple video upload without complex transformations
        result = cloudinary.uploader.upload(
            file,
            folder="ecommerce/videos",
            resource_type="video"
        )
        
        print(f"Video upload success: {result.get('secure_url')}")
        
        return jsonify({
            'url': result['secure_url'],
            'public_id': result['public_id'],
            'duration': result.get('duration'),
            'format': result.get('format')
        }), 201
        
    except Exception as e:
        import traceback
        print(f"Video upload error: {e}")
        print(traceback.format_exc())
        return jsonify({'detail': str(e)}), 500

# ==================== CATEGORIES ROUTES ====================

@app.route('/api/categories', methods=['GET'])
def public_get_categories():
    """Get active categories (public)"""
    try:
        categories = get_active_categories()
        return jsonify(categories)
    except Exception as e:
        print(f"Get categories error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/categories/grouped', methods=['GET'])
def public_get_categories_grouped():
    """Get categories with their subcategories grouped (public)"""
    try:
        categories = get_categories_with_subcategories()
        return jsonify(categories)
    except Exception as e:
        print(f"Get grouped categories error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/categories', methods=['GET'])
@token_required
@admin_required
def admin_get_categories(current_user):
    """Get all categories (admin)"""
    try:
        categories = get_all_categories()
        return jsonify(categories)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/categories', methods=['POST'])
@token_required
@admin_required
def admin_create_category(current_user):
    """Create a new category or subcategory"""
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'detail': 'Category name is required'}), 400
        
        parent_id = data.get('parent_id')
        category_id = create_category(data['name'], data.get('description'), parent_id if parent_id else None)
        return jsonify({'id': category_id, 'name': data['name'], 'message': 'Category created'}), 201
    except Exception as e:
        if 'Duplicate entry' in str(e):
            return jsonify({'detail': 'Category already exists'}), 400
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/categories/<int:category_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_category(current_user, category_id):
    """Update a category"""
    try:
        data = request.get_json()
        update_category(category_id, data.get('name'), data.get('description'), data.get('is_active'), data.get('parent_id'))
        return jsonify({'message': 'Category updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/categories/<int:category_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_category(current_user, category_id):
    """Delete a category"""
    try:
        delete_category(category_id)
        return jsonify({'message': 'Category deleted'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== SALE BANNER SETTINGS ====================

@app.route('/api/settings/sale-banner', methods=['GET'])
def public_get_sale_banner():
    """Get sale banner settings (public)"""
    try:
        settings = get_sale_banner()
        return jsonify(settings)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/sale-banner', methods=['GET'])
@token_required
@admin_required
def admin_get_sale_banner(current_user):
    """Get sale banner settings (admin)"""
    try:
        settings = get_sale_banner()
        return jsonify(settings)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/sale-banner', methods=['PUT'])
@token_required
@admin_required
def admin_update_sale_banner(current_user):
    """Update sale banner settings"""
    try:
        data = request.get_json()
        update_sale_banner(
            enabled=data.get('enabled', True),
            text=data.get('text', 'LIMITED TIME OFFER'),
            end_date=data.get('end_date', '2025-12-31T23:59:59')
        )
        return jsonify({'message': 'Sale banner settings updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== HERO SETTINGS ====================

@app.route('/api/settings/hero', methods=['GET'])
def public_get_hero():
    """Get hero slider settings (public)"""
    try:
        return jsonify(get_hero_slides())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/settings/scrolling-text', methods=['GET'])
def public_get_scrolling_text():
    """Get scrolling text settings (public)"""
    try:
        return jsonify(get_scrolling_text())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/hero', methods=['GET'])
@token_required
@admin_required
def admin_get_hero(current_user):
    """Get hero slider settings (admin)"""
    try:
        return jsonify(get_hero_slides())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/hero', methods=['PUT'])
@token_required
@admin_required
def admin_update_hero(current_user):
    """Update hero slider settings"""
    try:
        data = request.get_json()
        update_hero_slides(data.get('slides', []), data.get('recommended_size', '1920x1080'))
        return jsonify({'message': 'Hero settings updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/scrolling-text', methods=['GET'])
@token_required
@admin_required
def admin_get_scrolling_text(current_user):
    """Get scrolling text settings (admin)"""
    try:
        return jsonify(get_scrolling_text())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/scrolling-text', methods=['PUT'])
@token_required
@admin_required
def admin_update_scrolling_text(current_user):
    """Update scrolling text settings"""
    try:
        data = request.get_json()
        update_scrolling_text(data.get('enabled', True), data.get('text', ''))
        return jsonify({'message': 'Scrolling text updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== HOMEPAGE SECTIONS ====================

# Our Story
@app.route('/api/settings/our-story', methods=['GET'])
def public_get_our_story():
    try:
        return jsonify(get_our_story())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/our-story', methods=['PUT'])
@token_required
@admin_required
def admin_update_our_story(current_user):
    try:
        data = request.get_json()
        update_our_story(data.get('enabled', True), data.get('title', ''), data.get('description', ''), data.get('video_url', ''))
        return jsonify({'message': 'Our Story updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# Testimonials
@app.route('/api/settings/testimonials', methods=['GET'])
def public_get_testimonials():
    try:
        return jsonify(get_testimonials())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/testimonials', methods=['PUT'])
@token_required
@admin_required
def admin_update_testimonials(current_user):
    try:
        data = request.get_json()
        update_testimonials(data.get('enabled', True), data.get('title', ''), data.get('videos', []))
        return jsonify({'message': 'Testimonials updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# Shop The Look
@app.route('/api/settings/shop-the-look', methods=['GET'])
def public_get_shop_the_look():
    try:
        return jsonify(get_shop_the_look())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/settings/shop-the-look', methods=['PUT'])
@token_required
@admin_required
def admin_update_shop_the_look(current_user):
    try:
        data = request.get_json()
        update_shop_the_look(data.get('enabled', True), data.get('title', ''), data.get('product_ids', []))
        return jsonify({'message': 'Shop The Look updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/featured-products', methods=['GET'])
def public_get_featured():
    """Get featured products (public)"""
    try:
        products = get_featured_products()
        return jsonify(products)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/products/<int:product_id>/featured', methods=['PUT'])
@token_required
@admin_required
def admin_toggle_featured(current_user, product_id):
    """Toggle product featured status"""
    try:
        data = request.get_json()
        set_product_featured(product_id, data.get('is_featured', False))
        return jsonify({'message': 'Product featured status updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== COLLECTIONS ====================

@app.route('/api/collections', methods=['GET'])
def public_get_collections():
    """Get collections for home page (public)"""
    try:
        collections = get_home_collections()
        return jsonify(collections)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/collections/<int:collection_id>', methods=['GET'])
def public_get_collection(collection_id):
    """Get a single collection with products"""
    try:
        collection = get_collection_by_id(collection_id)
        if not collection:
            return jsonify({'detail': 'Collection not found'}), 404
        collection['products'] = get_collection_products(collection_id)
        return jsonify(collection)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/collections', methods=['GET'])
@token_required
@admin_required
def admin_get_collections(current_user):
    """Get all collections (admin)"""
    try:
        collections = get_all_collections()
        return jsonify(collections)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/collections', methods=['POST'])
@token_required
@admin_required
def admin_create_collection(current_user):
    """Create a new collection"""
    try:
        data = request.get_json()
        if not data.get('title'):
            return jsonify({'detail': 'Title is required'}), 400
        
        collection_id = create_collection(
            title=data['title'],
            description=data.get('description'),
            cover_image=data.get('cover_image'),
            format_type=data.get('format_type', 'short')
        )
        return jsonify({'id': collection_id, 'message': 'Collection created'}), 201
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/collections/<int:collection_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_collection(current_user, collection_id):
    """Update a collection"""
    try:
        data = request.get_json()
        update_collection(collection_id, **data)
        return jsonify({'message': 'Collection updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/collections/<int:collection_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_collection(current_user, collection_id):
    """Delete a collection"""
    try:
        delete_collection(collection_id)
        return jsonify({'message': 'Collection deleted'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/collections/<int:collection_id>/products', methods=['GET'])
@token_required
@admin_required
def admin_get_collection_products(current_user, collection_id):
    """Get products in a collection"""
    try:
        products = get_collection_products(collection_id)
        return jsonify(products)
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/collections/<int:collection_id>/products', methods=['PUT'])
@token_required
@admin_required
def admin_set_collection_products(current_user, collection_id):
    """Set products for a collection"""
    try:
        data = request.get_json()
        product_ids = data.get('product_ids', [])
        set_collection_products(collection_id, product_ids)
        return jsonify({'message': 'Collection products updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== COUPONS ====================

@app.route('/api/admin/coupons', methods=['GET'])
@token_required
@admin_required
def admin_get_coupons(current_user):
    """Get all coupons"""
    try:
        return jsonify(get_all_coupons())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/coupons', methods=['POST'])
@token_required
@admin_required
def admin_create_coupon(current_user):
    """Create a new coupon"""
    try:
        data = request.get_json()
        coupon_id = create_coupon(
            data['code'],
            data.get('discount_type', 'percentage'),
            data['discount_value'],
            data.get('min_order_amount', 0),
            data.get('max_uses'),
            data.get('expires_at')
        )
        return jsonify({'message': 'Coupon created', 'id': coupon_id}), 201
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/coupons/<int:coupon_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_coupon(current_user, coupon_id):
    """Update a coupon"""
    try:
        data = request.get_json()
        update_coupon(coupon_id, **data)
        return jsonify({'message': 'Coupon updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/coupons/<int:coupon_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_coupon(current_user, coupon_id):
    """Delete a coupon"""
    try:
        delete_coupon(coupon_id)
        return jsonify({'message': 'Coupon deleted'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/coupons/validate', methods=['POST'])
def public_validate_coupon():
    """Validate a coupon code"""
    try:
        data = request.get_json()
        code = data.get('code')
        order_total = float(data.get('order_total', 0))
        
        discount, result = validate_coupon(code, order_total)
        
        if discount is None:
            return jsonify({'valid': False, 'message': result}), 400
        
        return jsonify({
            'valid': True,
            'discount': discount,
            'discount_type': result['discount_type'],
            'discount_value': result['discount_value'],
            'coupon_id': result['id']
        })
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== REVIEWS ====================

@app.route('/api/products/<int:product_id>/reviews', methods=['GET'])
def public_get_product_reviews(product_id):
    """Get verified reviews for a product"""
    try:
        reviews = get_product_reviews(product_id, verified_only=True)
        rating = get_product_rating(product_id)
        return jsonify({'reviews': reviews, 'rating': rating})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/products/<int:product_id>/reviews', methods=['POST'])
def public_create_review(product_id):
    """Submit a review (requires verification)"""
    try:
        data = request.get_json()
        review_id = create_review(
            product_id,
            data.get('reviewer_name', 'Anonymous'),
            data['rating'],
            data.get('review_text', ''),
            user_id=None,
            is_admin_review=False,
            is_verified=False  # Needs admin approval
        )
        return jsonify({'message': 'Review submitted for approval', 'id': review_id}), 201
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/reviews', methods=['GET'])
@token_required
@admin_required
def admin_get_all_reviews(current_user):
    """Get all reviews for admin"""
    try:
        return jsonify(get_all_reviews())
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/reviews', methods=['POST'])
@token_required
@admin_required
def admin_create_review(current_user):
    """Admin creates a verified review"""
    try:
        data = request.get_json()
        review_id = create_review(
            data['product_id'],
            data.get('reviewer_name', 'Admin'),
            data['rating'],
            data.get('review_text', ''),
            user_id=current_user['id'],
            is_admin_review=True,
            is_verified=True  # Admin reviews are auto-verified
        )
        return jsonify({'message': 'Review created', 'id': review_id}), 201
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/reviews/<int:review_id>/verify', methods=['PUT'])
@token_required
@admin_required
def admin_verify_review(current_user, review_id):
    """Verify or unverify a review"""
    try:
        data = request.get_json()
        verify_review(review_id, data.get('verified', True))
        return jsonify({'message': 'Review updated'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/reviews/<int:review_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_review(current_user, review_id):
    """Delete a review"""
    try:
        delete_review(review_id)
        return jsonify({'message': 'Review deleted'})
    except Exception as e:
        return jsonify({'detail': str(e)}), 500

# ==================== PAYMENT SETTINGS ====================

@app.route('/api/settings/payment', methods=['GET'])
def get_payment_settings():
    """Get payment method settings (public)"""
    try:
        from database import execute_query
        result = execute_query("SELECT * FROM site_settings WHERE setting_key = 'payment_methods'", fetch_one=True)
        if result:
            import json
            return jsonify(json.loads(result.get('setting_value', '{}')))
        return jsonify({'cod_enabled': True, 'online_enabled': True})
    except Exception as e:
        return jsonify({'cod_enabled': True, 'online_enabled': True})

@app.route('/api/admin/settings/payment', methods=['PUT'])
@token_required
@admin_required
def update_payment_settings(current_user):
    """Update payment method settings"""
    try:
        from database import execute_query
        import json
        data = request.get_json()
        settings_json = json.dumps({
            'cod_enabled': data.get('cod_enabled', True),
            'online_enabled': data.get('online_enabled', True)
        })
        
        # Check if setting exists
        existing = execute_query("SELECT id FROM site_settings WHERE setting_key = 'payment_methods'", fetch_one=True)
        if existing:
            execute_query("UPDATE site_settings SET setting_value = %s WHERE setting_key = 'payment_methods'", (settings_json,))
        else:
            execute_query("INSERT INTO site_settings (setting_key, setting_value) VALUES ('payment_methods', %s)", (settings_json,))
        
        return jsonify({'message': 'Payment settings updated'})
    except Exception as e:
        print(f"Update payment settings error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== SHIPPING SETTINGS ====================

@app.route('/api/settings/shipping', methods=['GET'])
def get_shipping_settings():
    """Get shipping settings (public)"""
    try:
        from database import execute_query
        result = execute_query("SELECT * FROM site_settings WHERE setting_key = 'shipping_settings'", fetch_one=True)
        if result:
            import json
            return jsonify(json.loads(result.get('setting_value', '{}')))
        # Default values: Free delivery for orders >= 800, else 85 charge
        return jsonify({'free_delivery_minimum': 800, 'delivery_charge': 85})
    except Exception as e:
        return jsonify({'free_delivery_minimum': 800, 'delivery_charge': 85})

@app.route('/api/admin/settings/shipping', methods=['PUT'])
@token_required
@admin_required
def update_shipping_settings(current_user):
    """Update shipping settings"""
    try:
        from database import execute_query
        import json
        data = request.get_json()
        settings_json = json.dumps({
            'free_delivery_minimum': data.get('free_delivery_minimum', 800),
            'delivery_charge': data.get('delivery_charge', 85)
        })
        
        # Check if setting exists
        existing = execute_query("SELECT id FROM site_settings WHERE setting_key = 'shipping_settings'", fetch_one=True)
        if existing:
            execute_query("UPDATE site_settings SET setting_value = %s WHERE setting_key = 'shipping_settings'", (settings_json,))
        else:
            execute_query("INSERT INTO site_settings (setting_key, setting_value) VALUES ('shipping_settings', %s)", (settings_json,))
        
        return jsonify({'message': 'Shipping settings updated'})
    except Exception as e:
        print(f"Update shipping settings error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== WHATSAPP SETTINGS ====================

@app.route('/api/settings/whatsapp', methods=['GET'])
def get_whatsapp_settings():
    """Get WhatsApp settings (public)"""
    try:
        from database import execute_query
        result = execute_query("SELECT * FROM site_settings WHERE setting_key = 'whatsapp_settings'", fetch_one=True)
        if result:
            import json
            return jsonify(json.loads(result.get('setting_value', '{}')))
        return jsonify({'whatsapp_number': '', 'whatsapp_message': 'Hi! I am interested in your products.'})
    except Exception as e:
        return jsonify({'whatsapp_number': '', 'whatsapp_message': 'Hi! I am interested in your products.'})

@app.route('/api/admin/settings/whatsapp', methods=['PUT'])
@token_required
@admin_required
def update_whatsapp_settings(current_user):
    """Update WhatsApp settings"""
    try:
        from database import execute_query
        import json
        data = request.get_json()
        settings_json = json.dumps({
            'whatsapp_number': data.get('whatsapp_number', ''),
            'whatsapp_message': data.get('whatsapp_message', 'Hi! I am interested in your products.')
        })
        
        # Check if setting exists
        existing = execute_query("SELECT id FROM site_settings WHERE setting_key = 'whatsapp_settings'", fetch_one=True)
        if existing:
            execute_query("UPDATE site_settings SET setting_value = %s WHERE setting_key = 'whatsapp_settings'", (settings_json,))
        else:
            execute_query("INSERT INTO site_settings (setting_key, setting_value) VALUES ('whatsapp_settings', %s)", (settings_json,))
        
        return jsonify({'message': 'WhatsApp settings updated'})
    except Exception as e:
        print(f"Update WhatsApp settings error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== HEALTH CHECK ====================

@app.route('/', methods=['GET'])
def home():
    """Root endpoint - API info"""
    return jsonify({
        'name': 'Vurel Ecommerce API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'auth': ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
            'products': ['/api/products', '/api/products/<id>'],
            'orders': ['/api/orders', '/api/user/orders'],
            'categories': ['/api/categories', '/api/admin/categories'],
            'settings': ['/api/settings/sale-banner', '/api/admin/settings/sale-banner'],
            'admin': ['/api/admin/dashboard', '/api/admin/products', '/api/admin/orders', '/api/admin/customers'],
            'upload': ['/api/upload/image', '/api/upload/gallery', '/api/upload/video']
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'API is running'})

# ==================== CONTACT SUBMISSIONS ====================

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Submit a contact form (public)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['first_name', 'last_name', 'email', 'subject', 'message']
        for field in required:
            if not data.get(field):
                return jsonify({'detail': f'{field} is required'}), 400
        
        contact_id = create_contact(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message']
        )
        
        return jsonify({'message': 'Contact form submitted successfully', 'id': contact_id}), 201
        
    except Exception as e:
        print(f"Contact submit error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/contacts', methods=['GET'])
@token_required
@admin_required
def admin_get_contacts(current_user):
    """Get all contact submissions (admin)"""
    try:
        contacts = get_all_contacts()
        return jsonify(contacts)
    except Exception as e:
        print(f"Get contacts error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/contacts/<int:contact_id>', methods=['PUT'])
@token_required
@admin_required
def admin_update_contact(current_user, contact_id):
    """Update contact submission status (admin)"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['new', 'read', 'replied', 'closed']:
            return jsonify({'detail': 'Invalid status'}), 400
        
        update_contact_status(contact_id, status)
        contact = get_contact_by_id(contact_id)
        return jsonify(contact)
        
    except Exception as e:
        print(f"Update contact error: {e}")
        return jsonify({'detail': str(e)}), 500

@app.route('/api/admin/contacts/<int:contact_id>', methods=['DELETE'])
@token_required
@admin_required
def admin_delete_contact(current_user, contact_id):
    """Delete a contact submission (admin)"""
    try:
        delete_contact(contact_id)
        return jsonify({'message': 'Contact deleted successfully'})
    except Exception as e:
        print(f"Delete contact error: {e}")
        return jsonify({'detail': str(e)}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    print("🚀 Starting Ecommerce Backend API...")
    
    # Initialize database
    if init_database():
        print("✅ Database initialized")
    else:
        print("⚠️  Database initialization failed - make sure MySQL is running")
    
    # Initialize connection pool
    if init_pool():
        print("✅ Connection pool ready")
    else:
        print("⚠️  Connection pool failed - API may not work correctly")
    
    print(f"🌐 Server running at http://localhost:8000")
    print("📄 API endpoints available:")
    print("   - POST /api/auth/register")
    print("   - POST /api/auth/login")
    print("   - GET  /api/auth/me")
    print("   - GET  /api/products")
    print("   - GET  /api/products/<id>")
    print("   - POST /api/orders")
    print("   - GET  /api/user/orders")
    print("   - GET  /api/admin/dashboard")
    print("   - GET/POST /api/admin/products")
    print("   - GET/PUT /api/admin/orders")
    print("   - GET  /api/admin/customers")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
