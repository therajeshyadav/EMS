// middleware/performance.js
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Override res.json to capture response size
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const responseSize = JSON.stringify(data).length;
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    // Log performance metrics
    console.log(`📊 Performance Metrics:
    Route: ${req.method} ${req.path}
    Response Time: ${responseTime.toFixed(2)}ms
    Response Size: ${(responseSize / 1024).toFixed(2)}KB
    Memory Delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB
    Query Count: ${req.queryCount || 0}
    Cache Hit: ${req.cacheHit ? 'Yes' : 'No'}
    `);

    // Add performance headers
    res.set({
      'X-Response-Time': `${responseTime.toFixed(2)}ms`,
      'X-Response-Size': `${responseSize}`,
      'X-Memory-Usage': `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
      'X-Cache-Hit': req.cacheHit ? 'true' : 'false'
    });

    return originalJson.call(this, data);
  };

  // Track query count
  req.queryCount = 0;
  req.cacheHit = false;

  next();
};

// Query counter middleware for Mongoose
const queryCounter = (schema) => {
  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments', 'aggregate'], function() {
    if (this.req) {
      this.req.queryCount = (this.req.queryCount || 0) + 1;
    }
  });
};

module.exports = {
  performanceMonitor,
  queryCounter
};