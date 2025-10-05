// utils/environment.js - Environment utilities (NO HARDCODED URLS)

/**
 * Get environment information for debugging
 */
export const getEnvironmentInfo = () => {
  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    apiUrl: import.meta.env.VITE_API_BASE_URL,
    socketUrl: import.meta.env.VITE_SOCKET_URL,
    appName: import.meta.env.VITE_APP_NAME,
    appVersion: import.meta.env.VITE_APP_VERSION
  };
};

/**
 * Log environment information (development only)
 */
export const logEnvironmentInfo = () => {
  if (import.meta.env.DEV) {
    const info = getEnvironmentInfo();
    console.log('🌍 Environment Info:', info);
    return info;
  }
};

/**
 * Validate required environment variables
 */
export const validateEnvironment = () => {
  const required = ['VITE_API_BASE_URL', 'VITE_SOCKET_URL'];
  const missing = [];
  
  required.forEach(key => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};

// Auto-validate on import
validateEnvironment();