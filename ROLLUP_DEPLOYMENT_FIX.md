# Rollup Deployment Fix for Vercel

## Problem
The deployment was failing with this error:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

## Root Cause
- Vercel was using `npm install --no-optional` which skips optional dependencies
- Rollup requires platform-specific optional dependencies to work on Linux (Vercel's build environment)

## Solution Applied

### 1. Updated vercel.json
Changed from:
```json
"installCommand": "npm install --no-optional"
```
To:
```json
"installCommand": "npm install"
```

### 2. Added Rollup Platform Package
Added `@rollup/rollup-linux-x64-gnu` to devDependencies in package.json to ensure it's always available.

### 3. Updated .npmrc
Added `optional=true` to ensure optional dependencies are properly handled.

## Deploy Steps
1. Commit these changes
2. Push to your repository
3. Redeploy on Vercel

The build should now complete successfully without the Rollup module error.