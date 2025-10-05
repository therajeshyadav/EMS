# Production URL Fix Guide

## Current Issue
- Frontend deployed: `https://ems-dsnx.vercel.app` ✅
- Backend URL: Still using placeholder `https://your-backend-url.onrender.com` ❌

## Step-by-Step Fix

### 1. Get Your Actual Backend URL
आपका backend कहाँ deploy है? 
- **Render**: `https://your-app-name.onrender.com`
- **Railway**: `https://your-app-name.railway.app`  
- **Heroku**: `https://your-app-name.herokuapp.com`

### 2. Update Vercel Environment Variables
Vercel dashboard में जाकर ये environment variables update करें:

```
VITE_API_BASE_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api
VITE_SOCKET_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

### 3. Update Backend Environment Variables
Backend platform (Render/Railway) में ये variables add करें:

```
NODE_ENV=production
FRONTEND_URL=https://ems-dsnx.vercel.app
```

### 4. Redeploy Both
1. Backend redeploy करें
2. Frontend redeploy करें (या Vercel automatically करेगा)

## Quick Commands

### Check if backend is running:
```bash
curl https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/health
```

### Test CORS:
```bash
curl -H "Origin: https://ems-dsnx.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/auth/login
```

## Common Issues

### If still getting CORS error:
1. Check backend logs for CORS configuration
2. Ensure `NODE_ENV=production` is set
3. Verify frontend URL is correct in backend env

### If WebSocket fails:
1. Check if backend supports WebSocket (Render free tier has limitations)
2. Verify socket.io is properly configured
3. Check firewall/proxy settings

## Environment Variables Checklist

### Frontend (Vercel):
- [ ] `VITE_API_BASE_URL` - Real backend URL with `/api`
- [ ] `VITE_SOCKET_URL` - Real backend URL without `/api`

### Backend (Render/Railway):
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL=https://ems-dsnx.vercel.app`
- [ ] `PORT` (usually auto-set)
- [ ] `MONGO_URI` (your database)
- [ ] `JWT_SECRET`