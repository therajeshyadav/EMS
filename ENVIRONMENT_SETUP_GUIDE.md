# 🌍 Environment Variables Setup Guide

## ✅ **All URLs are now in Environment Variables!**

No more hardcoded URLs! Everything is configurable through environment variables.

## 📋 **Required Environment Variables**

### **Frontend (.env files)**

#### **Development (`Frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:5003/api
VITE_SOCKET_URL=http://localhost:5003
VITE_APP_NAME=Employee Management System
VITE_APP_VERSION=1.0.0
```

#### **Production (`Frontend/.env.production`)**
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Employee Management System
VITE_APP_VERSION=1.0.0
```

### **Backend (.env files)**

#### **Development (`Backend/.env`)**
```env
PORT=5003
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL_1=http://localhost:3000
FRONTEND_URL_2=http://localhost:5173
```

#### **Production (`Backend/.env.production`)**
```env
PORT=10000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL_1=https://your-frontend-url.vercel.app
FRONTEND_URL_2=https://your-frontend-url.netlify.app
FRONTEND_URL_3=https://your-custom-domain.com
```

## 🚀 **Deployment Platform Setup**

### **Vercel (Frontend)**
1. Go to your Vercel project → Settings → Environment Variables
2. Add these variables:
```
VITE_API_BASE_URL = https://your-backend-url.onrender.com/api
VITE_SOCKET_URL = https://your-backend-url.onrender.com
VITE_APP_NAME = Employee Management System
VITE_APP_VERSION = 1.0.0
```

### **Render (Backend)**
1. Go to your Render service → Environment
2. Add these variables:
```
PORT = 10000
NODE_ENV = production
MONGO_URI = your_mongodb_connection_string
JWT_SECRET = your_production_jwt_secret
FRONTEND_URL_1 = https://your-frontend-url.vercel.app
FRONTEND_URL_2 = https://your-frontend-url.netlify.app
```

## 🔧 **How to Update URLs**

### **Step 1: Get Your Deployment URLs**
- **Backend URL**: From your Render dashboard (e.g., `https://ems-abc123.onrender.com`)
- **Frontend URL**: From your Vercel dashboard (e.g., `https://your-app.vercel.app`)

### **Step 2: Update Environment Files**
1. **Update `Frontend/.env.production`**:
   ```env
   VITE_API_BASE_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api
   VITE_SOCKET_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
   ```

2. **Update `Backend/.env.production`**:
   ```env
   FRONTEND_URL_1=https://YOUR-ACTUAL-FRONTEND-URL.vercel.app
   ```

### **Step 3: Update Deployment Platform**
- Set the same variables in your Vercel/Render dashboard

### **Step 4: Rebuild and Deploy**
```bash
# Frontend
cd Frontend
npm run build
# Deploy the dist/ folder

# Backend
# Push to GitHub (if using auto-deploy) or redeploy manually
```

## 🧪 **Testing Your Setup**

### **Verify Environment Variables**
```bash
# Frontend - check if variables are loaded
cd Frontend
npm run verify-deployment

# Backend - check server logs for CORS origins
```

### **Check Built Files**
```bash
# After building frontend, check if correct URLs are used
cd Frontend/dist
grep -r "your-backend-url" .  # Should find your backend URL
grep -r "localhost" .          # Should only find localhost in dev mode
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Environment variable not set" error**
   - Check if `.env.production` file exists
   - Verify variable names start with `VITE_` for frontend
   - Check deployment platform environment variables

2. **CORS errors**
   - Verify `FRONTEND_URL_*` variables in backend
   - Check backend logs for "Allowed CORS origins"
   - Ensure frontend URL matches exactly (no trailing slash)

3. **API connection fails**
   - Verify `VITE_API_BASE_URL` is correct
   - Test backend health endpoint: `https://your-backend-url.onrender.com/api/health`
   - Check browser network tab for actual request URLs

### **Debug Commands:**
```bash
# Check what environment variables Vite sees
cd Frontend
npm run dev
# Look for "🔧 EMS Configuration" in browser console

# Check backend CORS configuration
# Look for "🔗 Allowed CORS origins" in backend logs
```

## ✅ **Benefits of This Setup**

- ✅ **No hardcoded URLs** - Everything configurable
- ✅ **Environment-specific** - Different URLs for dev/prod
- ✅ **Easy deployment** - Just update environment variables
- ✅ **Better security** - Sensitive data in environment variables
- ✅ **Team-friendly** - Each developer can have their own URLs

---

**🎉 Your app is now fully configurable through environment variables!**