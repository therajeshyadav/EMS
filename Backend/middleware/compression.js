// middleware/compression.js
const compression = require('compression');

// Custom compression middleware
const compressionMiddleware = compression({
  // Only compress responses larger than 1kb
  threshold: 1024,
  
  // Compression level (1-9, 6 is default)
  level: 6,
  
  // Only compress these MIME types
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression for JSON, text, and other compressible types
    return compression.filter(req, res);
  },
  
  // Custom compression for different content types
  chunkSize: 16 * 1024, // 16KB chunks
  windowBits: 15,
  memLevel: 8
});

// Response size optimization middleware
const optimizeResponse = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Remove null/undefined fields to reduce payload size
    if (typeof data === 'object' && data !== null) {
      data = removeEmptyFields(data);
    }
    
    // Add response metadata
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      data.timestamp = new Date().toISOString();
      data.responseTime = Date.now() - req.startTime;
    }
    
    return originalJson.call(this, data);
  };
  
  // Track request start time
  req.startTime = Date.now();
  next();
};

// Helper function to remove empty fields
function removeEmptyFields(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeEmptyFields).filter(item => item !== null && item !== undefined);
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object') {
          const cleanedValue = removeEmptyFields(value);
          if (Object.keys(cleanedValue).length > 0 || Array.isArray(cleanedValue)) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }
  
  return obj;
}

module.exports = {
  compressionMiddleware,
  optimizeResponse
};