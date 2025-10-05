// config/config.js - Centralized configuration

const config = {
  // API Configuration - Always use environment variables
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  
  // Environment
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // API Settings
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Socket Settings
  SOCKET_TIMEOUT: 20000, // 20 seconds
  SOCKET_TRANSPORTS: ["websocket", "polling"],
  
  // App Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || "Employee Management System",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: "token",
    USER: "user",
    THEME: "theme",
    LANGUAGE: "language"
  }
};

// Log configuration for debugging
if (config.IS_DEVELOPMENT) {
  console.log("🔧 EMS Configuration:", {
    API_BASE_URL: config.API_BASE_URL,
    SOCKET_URL: config.SOCKET_URL,
    ENVIRONMENT: config.IS_PRODUCTION ? "production" : "development",
    HOSTNAME: window.location.hostname,
    ENV_MODE: import.meta.env.MODE,
    ALL_ENV_VARS: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION
    }
  });
}

export default config;