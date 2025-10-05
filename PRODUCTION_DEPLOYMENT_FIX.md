# Production Deployment Fix - Complete Guide

## Current Status ✅
- **Frontend**: `https://ems-dsnx.vercel.app` - Working
- **Backend**: `https://ems-48ug.onrender.com` - Database timeout issue

## Issues Fixed:

### 1. Database Connection Missing ❌➡️✅
**Problem**: Server.js में MongoDB connection call नहीं हो रहा था
**Solution**: Added `connectDB()` call in server.js

### 2. Production Timeout Settings ❌➡️✅
**Problem**: Development timeouts production में fail हो रहे थे
**Solution**: Increased timeouts for production environment

### 3. Environment Variables ❌➡️✅
**Problem**: Placeholder URLs still being used
**Solution**: Updated with real URLs

## Updated Environment Variables:

### Vercel (Frontend):
```
VITE_API_BASE_URL=https://ems-48ug.onrender.com/api
VITE_SOCKET_URL=https://ems-48ug.onrender.com
VITE_APP_NAME=Employee Management System
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
```

### Render (Backend):
```
NODE_ENV=production
PORT=5003
MONGO_URI=mongodb+srv://ry8036739:Yadav2003@cluster0.rrdverk.mongodb.net/EmployeeDatabase?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=somethingsecret
FRONTEND_URL=https://ems-dsnx.vercel.app
```

## Next Steps:

### 1. Redeploy Backend
```bash
git add .
git commit -m "Fix: Add database connection and production timeouts"
git push origin main
```

### 2. Update Vercel Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Update the variables above
5. Redeploy

### 3. Test After Deployment
```bash
# Test backend health
curl https://ems-48ug.onrender.com/api/health

# Test CORS
curl -H "Origin: https://ems-dsnx.vercel.app" \
     -X OPTIONS \
     https://ems-48ug.onrender.com/api/auth/login
```

## Expected Results After Fix:
- ✅ Database connection successful
- ✅ Login working
- ✅ CORS errors resolved
- ✅ WebSocket connection established
- ✅ All API endpoints working

## If Still Issues:

### Database Timeout:
1. Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
2. Verify connection string is correct
3. Check MongoDB Atlas cluster status

### CORS Issues:
1. Verify environment variables are set correctly
2. Check backend logs for CORS configuration
3. Ensure both apps are redeployed

### WebSocket Issues:
1. Render free tier has WebSocket limitations
2. Consider upgrading to paid plan for better WebSocket support
3. Or disable real-time features for free tier