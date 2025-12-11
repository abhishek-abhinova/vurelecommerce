# 🚀 Hostinger Deployment Guide

## Step 1: Build Static Files
```bash
npm run build
```

## Step 2: Upload to Hostinger

### Method 1: File Manager (Recommended)
1. Login to Hostinger hPanel
2. Go to **File Manager**
3. Navigate to `public_html` folder
4. Upload all files from `dist` folder
5. Extract if uploaded as ZIP

### Method 2: FTP Upload
1. Get FTP credentials from Hostinger
2. Use FileZilla or similar FTP client
3. Upload `dist` folder contents to `public_html`

## Step 3: Configure Domain
1. Point your domain to Hostinger nameservers
2. Add domain in Hostinger panel
3. Wait for DNS propagation (24-48 hours)

## Step 4: Setup Backend
Since Hostinger doesn't support Python/Flask:

### Option A: Use Render for Backend
- Deploy backend to Render (free)
- Update API URL in frontend

### Option B: Use Hostinger VPS
- Upgrade to VPS plan
- Install Python/Flask
- Deploy backend manually

## Important Notes
- Static export removes server-side features
- Dynamic routes need client-side routing
- API calls work from browser only
- No server-side authentication

## Files to Upload
Upload everything from `dist` folder:
- `index.html`
- `_next/` folder
- All static assets

Your site will be live at: `https://yourdomain.com`