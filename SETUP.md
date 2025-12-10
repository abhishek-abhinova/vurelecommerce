# E-commerce Website Setup Guide

This guide will help you set up the complete e-commerce website with Python backend and Next.js frontend.

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- MySQL Server
- npm or pnpm

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create MySQL database:**
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

6. **Configure environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and update with your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=ecommerce_db
     DB_PORT=3306
     SECRET_KEY=your-secret-key-change-in-production
     ```

7. **Run the backend server:**
   ```bash
   python app.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. **Navigate to the project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables:**
   - Create `.env.local` file in the root directory:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## Default Admin Credentials

After starting the backend, a default admin user is automatically created:

- **Email:** `admin@luxe.com`
- **Password:** `admin123`

**Important:** Change the default admin password after first login in production!

## Database Schema

The backend automatically creates the following tables on startup:

- **users** - User accounts (customers and admins)
- **products** - Product catalog
- **orders** - Customer orders

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Admin (Requires Admin Token)
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{id}` - Update order status
- `GET /api/admin/dashboard` - Get dashboard statistics

### Public
- `GET /api/products` - Get all active products
- `GET /api/products/{id}` - Get product by ID

## Authentication

All admin endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained from `/api/auth/login` or `/api/auth/register` and stored in localStorage.

## Troubleshooting

### Backend Issues

1. **Database connection error:**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database `ecommerce_db` exists

2. **Port already in use:**
   - Change the port in `app.py` or use: `uvicorn app:app --reload --port 8001`

### Frontend Issues

1. **API connection error:**
   - Verify backend is running on `http://localhost:8000`
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`

2. **CORS errors:**
   - Ensure backend CORS settings include your frontend URL
   - Check `allow_origins` in `backend/app.py`

## Project Structure

```
e-commerce-ui-design/
├── backend/
│   ├── app.py              # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
├── lib/
│   └── api.ts             # API client functions
└── SETUP.md               # This file
```

## Next Steps

1. Create your first admin account or use the default one
2. Add products through the admin panel
3. Test the authentication flow
4. Customize the design and add more features as needed

