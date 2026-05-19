# Deploying Mr. Littles Frontend to mrlittles.in

## 🎯 Overview

This guide will help you deploy your Angular frontend to your GoDaddy domain `mrlittles.in` using Vercel (recommended) or other hosting options.

---

## ✅ Option 1: Vercel (Recommended - FREE)

### Why Vercel?
- ✅ **Free** for personal/commercial projects
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificate (HTTPS)
- ✅ Global CDN for fast loading
- ✅ Easy custom domain setup
- ✅ Perfect for Angular apps

### Step 1: Prepare Your Project

1. **Ensure your project is on GitHub**
   ```bash
   cd /Users/francisxavier/Desktop/PROJECT/MR\ LITTLE/mr-littles
   git status
   # If not initialized, run:
   # git init
   # git add .
   # git commit -m "Initial commit"
   # git push origin main
   ```

2. **Create vercel.json configuration**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/mr-littles/browser"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **Add build script to package.json**
   ```json
   {
     "scripts": {
       "build": "ng build --configuration production",
       "vercel-build": "ng build --configuration production"
     }
   }
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Sign Up" and use GitHub to sign in

2. **Import Your Project**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose your `mr-littles` repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: **Angular**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist/mr-littles/browser` (auto-detected)
   - Click "Deploy"

4. **Wait for Deployment**
   - First deployment takes 2-3 minutes
   - You'll get a URL like: `mr-littles.vercel.app`

### Step 3: Connect Your GoDaddy Domain

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add domain: `mrlittles.in`
   - Add domain: `www.mrlittles.in`

2. **Get DNS Records from Vercel**
   Vercel will show you DNS records like:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Update DNS in GoDaddy**
   - Login to GoDaddy: https://dcc.godaddy.com/
   - Go to "My Products" → "Domains"
   - Click on `mrlittles.in`
   - Click "DNS" or "Manage DNS"
   
   **Add/Update these records:**
   
   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | @ | 76.76.21.21 | 600 |
   | CNAME | www | cname.vercel-dns.com | 600 |
   
   **Delete these if they exist:**
   - Any existing A records for @
   - Any existing CNAME for www pointing elsewhere

4. **Verify Domain in Vercel**
   - Back in Vercel, click "Verify"
   - DNS propagation takes 5-60 minutes
   - Once verified, SSL certificate is automatically issued

5. **Done!**
   - Your site will be live at: `https://mrlittles.in`
   - And also at: `https://www.mrlittles.in`

---

## 🔄 Option 2: Netlify (Alternative - FREE)

### Why Netlify?
- ✅ Free hosting
- ✅ Automatic deployments
- ✅ Free SSL
- ✅ Easy to use

### Steps:

1. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist/mr-littles/browser"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy to Netlify**
   - Visit: https://netlify.com
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings are auto-detected
   - Click "Deploy"

3. **Connect Domain**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter: `mrlittles.in`
   - Follow DNS instructions (similar to Vercel)

---

## 🏢 Option 3: GoDaddy Hosting (Paid)

### If you have GoDaddy hosting plan:

1. **Build Your Project**
   ```bash
   cd /Users/francisxavier/Desktop/PROJECT/MR\ LITTLE/mr-littles
   npm run build
   ```

2. **Upload Files**
   - Build creates files in: `dist/mr-littles/browser/`
   - Use FTP/SFTP to upload to GoDaddy
   - Upload to: `public_html` or `www` folder

3. **Configure .htaccess**
   Create `.htaccess` in root:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## 🚀 Option 4: Firebase Hosting (FREE)

### Why Firebase?
- ✅ Free hosting
- ✅ Google's infrastructure
- ✅ Free SSL
- ✅ Easy CLI deployment

### Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   cd /Users/francisxavier/Desktop/PROJECT/MR\ LITTLE/mr-littles
   firebase init hosting
   ```
   
   - Select "Create a new project" or use existing
   - Public directory: `dist/mr-littles/browser`
   - Single-page app: **Yes**
   - Automatic builds: **No** (for now)

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

5. **Connect Custom Domain**
   - Go to Firebase Console
   - Select your project
   - Go to "Hosting" → "Add custom domain"
   - Enter: `mrlittles.in`
   - Follow DNS instructions

---

## 📋 Comparison Table

| Feature | Vercel | Netlify | Firebase | GoDaddy |
|---------|--------|---------|----------|---------|
| **Cost** | Free | Free | Free | Paid |
| **SSL** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Manual |
| **CDN** | ✅ Global | ✅ Global | ✅ Global | ❌ Limited |
| **Auto Deploy** | ✅ Yes | ✅ Yes | ❌ Manual | ❌ Manual |
| **Setup Time** | 5 min | 5 min | 10 min | 30 min |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Recommendation:** Use **Vercel** - it's the easiest and best for Angular apps.

---

## 🔧 Environment Configuration

### Update API URL for Production

1. **Update environment.prod.ts**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-api.railway.app/api'
   };
   ```

2. **Ensure your backend allows CORS from your domain**
   In your backend `index.js`:
   ```javascript
   const allowed = [
     'http://localhost:4200',
     'https://mrlittles.in',
     'https://www.mrlittles.in',
     process.env.CLIENT_URL
   ].filter(Boolean);
   ```

---

## ✅ Pre-Deployment Checklist

- [ ] Project builds successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] CORS configured in backend
- [ ] All routes work (test locally)
- [ ] Images and assets load correctly
- [ ] Project pushed to GitHub

---

## 🚀 Quick Start (Vercel - Recommended)

```bash
# 1. Ensure project is on GitHub
cd /Users/francisxavier/Desktop/PROJECT/MR\ LITTLE/mr-littles
git status

# 2. Create vercel.json (see above)

# 3. Go to vercel.com and import your project

# 4. Configure domain in Vercel dashboard

# 5. Update DNS in GoDaddy

# Done! Your site will be live at https://mrlittles.in
```

---

## 🆘 Troubleshooting

### Issue: 404 on page refresh
**Solution:** Ensure routing configuration is set up (vercel.json or .htaccess)

### Issue: API calls failing
**Solution:** 
- Check CORS configuration in backend
- Verify API URL in environment.prod.ts
- Check browser console for errors

### Issue: Domain not connecting
**Solution:**
- Wait 30-60 minutes for DNS propagation
- Verify DNS records in GoDaddy
- Use https://dnschecker.org to check propagation

### Issue: SSL certificate not working
**Solution:**
- Wait for automatic SSL provisioning (5-10 minutes)
- Ensure DNS is properly configured
- Contact hosting support if issue persists

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Firebase Docs:** https://firebase.google.com/docs/hosting
- **GoDaddy Support:** https://www.godaddy.com/help

---

## 🎉 After Deployment

Once deployed, your site will be:
- ✅ Live at `https://mrlittles.in`
- ✅ Secured with SSL (HTTPS)
- ✅ Fast with global CDN
- ✅ Automatically deployed on git push (Vercel/Netlify)

---

**Need Help?** Follow the Vercel option above - it's the easiest and most reliable!

**Estimated Time:** 15-30 minutes for complete setup
