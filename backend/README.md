# Ecommerce Clothing Backend

Python Flask backend with MySQL database for the ecommerce clothing website.

## Requirements

- Python 3.8+
- MySQL Server (XAMPP, WAMP, or standalone)

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database

1. Make sure MySQL is running (via XAMPP or standalone)
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
3. Edit `.env` with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ecommerce_clothing
   JWT_SECRET=your-secret-key
   ```

### 3. Run the Server

```bash
python app.py
```

The server will:
- Automatically create the database if it doesn't exist
- Create all required tables (users, products, orders)
- Start on http://localhost:8000

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/<id>` | Get single product |

### Orders (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/user/orders` | Get user's orders |
| GET | `/api/user/orders/<id>` | Get specific order |

### Admin (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/products` | List products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/<id>` | Update product |
| DELETE | `/api/admin/products/<id>` | Delete product |
| GET | `/api/admin/orders` | List all orders |
| PUT | `/api/admin/orders/<id>` | Update order status |
| GET | `/api/admin/customers` | List customers |

## Creating an Admin User

After starting the server, you can:

1. Register a normal user through the website
2. Then run this SQL to make them admin:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';
   ```

Or insert an admin directly:
```sql
INSERT INTO users (first_name, last_name, email, password_hash, is_admin)
VALUES ('Admin', 'User', 'admin@luxe.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/f.dKQN3xC7kq2.qya', TRUE);
```
(This creates admin@luxe.com with password: admin123)

## File Structure

```
backend/
├── app.py           # Main Flask application with all routes
├── database.py      # MySQL connection and initialization
├── models.py        # Data models and database operations
├── requirements.txt # Python dependencies
├── .env.example     # Environment variables template
└── README.md        # This file
```
