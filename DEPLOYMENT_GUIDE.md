# Deployment Guide: Vurel Ecommerce

This guide covers deploying the frontend to **Vercel** and the backend to **Render**.

## Project Structure
```
ecommerce-clothing/
├── app/                    # Next.js frontend
├── backend/               # Flask backend
├── components/           # React components
├── lib/                  # Utilities
├── public/              # Static assets
└── DEPLOYMENT_GUIDE.md  # This file
```

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- MySQL database (we'll use PlanetScale or Railway)

---

## Part 1: Database Setup (PlanetScale - Recommended)

### 1.1 Create PlanetScale Database

1. Go to [PlanetScale](https://planetscale.com) and sign up
2. Create a new database named `vurel-ecommerce`
3. Create a branch called `main`
4. Get connection details from the dashboard

### 1.2 Update Backend Environment Variables

Update `backend/.env` with PlanetScale credentials:
```env
# Database Configuration (PlanetScale)
DB_HOST=your-planetscale-host
DB_USER=your-planetscale-username
DB_PASSWORD=your-planetscale-password
DB_NAME=vurel-ecommerce
DB_PORT=3306

# JWT Secret Key
JWT_SECRET=luxe-ecommerce-secret-key-2024

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dypekxmhf
CLOUDINARY_API_KEY=391935419174879
CLOUDINARY_API_SECRET=mTALzmcaYGIs5iSS-5sjXYzYYOU

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_RhdrqGkpAJ8AcU
RAZORPAY_KEY_SECRET=g427sw4TTrnnZ94B1GBEMNbx

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=partha@technowebs.in
SMTP_PASSWORD=alyxwqfkxlrjnwjr
SMTP_FROM_NAME=Vurel Store
```

---

## Part 2: Backend Deployment (Render)

### 2.1 Prepare Backend for Deployment

Create `backend/render.yaml`:
```yaml
services:
  - type: web
    name: vurel-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

### 2.2 Add Gunicorn to Requirements

Update `backend/requirements.txt`:
```txt
flask==3.0.0
flask-cors==4.0.0
PyJWT==2.8.0
mysql-connector-python==8.2.0
python-dotenv==1.0.0
bcrypt==4.1.1
cloudinary==1.36.0
razorpay==1.4.1
gunicorn==21.2.0
```

### 2.3 Deploy to Render

1. Go to [Render](https://render.com) and sign up
2. Connect your GitHub repository
3. Create a new **Web Service**
4. Configure:
   - **Name**: `vurel-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty (we'll use cd commands)

### 2.4 Set Environment Variables in Render

In Render dashboard, add these environment variables:
```
DB_HOST=your-planetscale-host
DB_USER=your-planetscale-username
DB_PASSWORD=your-planetscale-password
DB_NAME=vurel-ecommerce
JWT_SECRET=luxe-ecommerce-secret-key-2024
CLOUDINARY_CLOUD_NAME=dypekxmhf
CLOUDINARY_API_KEY=391935419174879
CLOUDINARY_API_SECRET=mTALzmcaYGIs5iSS-5sjXYzYYOU
RAZORPAY_KEY_ID=rzp_test_RhdrqGkpAJ8AcU
RAZORPAY_KEY_SECRET=g427sw4TTrnnZ94B1GBEMNbx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=partha@technowebs.in
SMTP_PASSWORD=alyxwqfkxlrjnwjr
SMTP_FROM_NAME=Vurel Store
```

### 2.5 Deploy Backend

1. Click **Create Web Service**
2. Wait for deployment to complete
3. Note your backend URL: `https://vurel-backend.onrender.com`

---

## Part 3: Frontend Deployment (Vercel)

### 3.1 Update API Configuration

Create/update `lib/api.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vurel-backend.onrender.com/api'
  : 'http://localhost:8000/api';

export { API_BASE_URL };
```

### 3.2 Create Vercel Configuration

Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_API_URL": "https://vurel-backend.onrender.com/api"
  }
}
```

### 3.3 Update Next.js Configuration

Update `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`
      }
    ];
  }
};

export default nextConfig;
```

### 3.4 Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Import the project
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: Leave empty (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.5 Set Environment Variables in Vercel

In Vercel dashboard, add:
```
NEXT_PUBLIC_API_URL=https://vurel-backend.onrender.com/api
```

### 3.6 Deploy Frontend

1. Click **Deploy**
2. Wait for deployment to complete
3. Your site will be available at: `https://your-project.vercel.app`

---

## Part 4: Post-Deployment Setup

### 4.1 Update CORS Settings

Update backend `app.py` CORS configuration:
```python
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://your-project.vercel.app",
            "http://localhost:3000"
        ]
    }
})
```

### 4.2 Test the Deployment

1. Visit your Vercel URL
2. Test user registration/login
3. Test product browsing
4. Test order placement
5. Test admin panel access

### 4.3 Set Up Custom Domain (Optional)

#### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

#### For Render (Backend):
1. Go to Service Settings → Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update frontend API URL accordingly

---

## Part 5: Environment-Specific Configurations

### 5.1 Production Environment Variables

**Backend (.env for local, Render dashboard for production):**
```env
# Production Database
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=vurel_ecommerce_prod

# Security
JWT_SECRET=your-super-secure-jwt-secret-for-production

# Email (Production SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@domain.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Vurel Store

# Payment (Production Keys)
RAZORPAY_KEY_ID=rzp_live_your_live_key
RAZORPAY_KEY_SECRET=your_live_secret

# File Storage (Production)
CLOUDINARY_CLOUD_NAME=your-production-cloud
CLOUDINARY_API_KEY=your-production-key
CLOUDINARY_API_SECRET=your-production-secret
```

**Frontend (Vercel Environment Variables):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key
```

---

## Part 6: Monitoring & Maintenance

### 6.1 Set Up Monitoring

**Render:**
- Enable health checks
- Set up log monitoring
- Configure alerts for downtime

**Vercel:**
- Monitor function execution
- Set up analytics
- Configure error tracking

### 6.2 Database Maintenance

**PlanetScale:**
- Monitor connection usage
- Set up automated backups
- Monitor query performance

### 6.3 Regular Updates

1. **Dependencies**: Update packages monthly
2. **Security**: Monitor for security vulnerabilities
3. **Performance**: Optimize based on usage patterns
4. **Backups**: Regular database backups

---

## Part 7: Troubleshooting

### 7.1 Common Issues

**CORS Errors:**
- Ensure backend CORS includes your Vercel domain
- Check API URL configuration

**Database Connection:**
- Verify PlanetScale connection strings
- Check firewall settings

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are listed

**API Timeouts:**
- Render free tier has cold starts
- Consider upgrading for better performance

### 7.2 Debugging Steps

1. Check Render logs for backend errors
2. Check Vercel function logs for frontend issues
3. Test API endpoints directly
4. Verify environment variables are set correctly

---

## Part 8: Performance Optimization

### 8.1 Frontend Optimization

- Enable Vercel Analytics
- Optimize images with Next.js Image component
- Implement proper caching strategies
- Use CDN for static assets

### 8.2 Backend Optimization

- Implement database connection pooling
- Add Redis for caching (optional)
- Optimize database queries
- Enable gzip compression

---

## Part 9: Security Checklist

### 9.1 Backend Security

- [ ] Use HTTPS only
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use secure JWT secrets
- [ ] Enable CORS properly
- [ ] Sanitize database queries

### 9.2 Frontend Security

- [ ] Sanitize user inputs
- [ ] Implement CSP headers
- [ ] Use HTTPS only
- [ ] Secure API keys
- [ ] Implement proper authentication

---

## Part 10: Scaling Considerations

### 10.1 Database Scaling

- Monitor PlanetScale usage
- Consider read replicas for high traffic
- Implement proper indexing

### 10.2 Application Scaling

- Render auto-scales based on traffic
- Vercel handles frontend scaling automatically
- Consider CDN for global performance

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Render Documentation**: https://render.com/docs
- **PlanetScale Documentation**: https://planetscale.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Flask Documentation**: https://flask.palletsprojects.com/

---

## Quick Deployment Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# 2. Vercel will auto-deploy frontend
# 3. Render will auto-deploy backend

# 4. Test deployment
curl https://your-backend.onrender.com/api/health
```

---

**🎉 Your Vurel Ecommerce application is now live!**

- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Admin Panel**: https://your-project.vercel.app/admin

Remember to update DNS records if using custom domains and monitor your applications for optimal performance.