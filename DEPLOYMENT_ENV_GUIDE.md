# Deployment Environment Variables Guide

## Frontend Deployment (Vercel)

### Step 1: Deploy Frontend
1. Push your code to GitHub
2. Connect repository to Vercel
3. Deploy करने से पहले Vercel में ये Environment Variables add करें:

```
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_SOCKET_URL=https://your-backend-url.com
VITE_APP_NAME=Employee Management System
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=false
```

### Step 2: Get Frontend URL
Deploy होने के बाद आपको URL मिलेगा जैसे: `https://your-app-name.vercel.app`

## Backend Deployment (Railway/Render/Heroku)

### Step 3: Deploy Backend
Backend deploy करते समय ये Environment Variables set करें:

```
PORT=5003
MONGO_URI=mongodb+srv://ry8036739:Yadav2003@cluster0.rrdverk.mongodb.net/EmployeeDatabase?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=somethingsecret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-app.vercel.app
```

### Step 4: Update Frontend Environment
Backend deploy होने के बाद frontend के environment variables update करें:

```
VITE_API_BASE_URL=https://your-backend-app.railway.app/api
VITE_SOCKET_URL=https://your-backend-app.railway.app
```

## Quick Fix Commands

### अगर CORS error आए:
1. Backend के environment variables में सही frontend URL add करें
2. Frontend के environment variables में सही backend URL add करें
3. Redeploy करें

### Local Testing:
```bash
# Frontend
cd Frontend
npm run dev

# Backend  
cd Backend
npm start
```

## Environment Files Structure:

```
Frontend/
├── .env                 # Development
├── .env.production     # Production
└── .env.local          # Local overrides (optional)

Backend/
└── .env                # All environments
```

## Important Notes:
- Frontend environment variables must start with `VITE_`
- Backend CORS configuration automatically handles production/development
- Always update both frontend and backend URLs after deployment
- Test locally first before deploying