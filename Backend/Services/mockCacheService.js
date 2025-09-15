// Services/mockCacheService.js - Simple in-memory cache without Redis
class MockCacheService {
  constructor() {
    this.cache = new Map();
    this.isConnected = false; // Always false for mock
  }

  async connect() {
    // Mock connection - always fails gracefully
    this.isConnected = false;
    return Promise.resolve();
  }

  async get(key) {
    return null; // Always return null (no cache)
  }

  async set(key, data, ttl = 300) {
    return false; // Always return false (no cache)
  }

  async del(key) {
    return false;
  }

  async invalidatePattern(pattern) {
    return false;
  }

  // Cache key generators (same as original)
  static keys = {
    employees: (filters) => `employees:${JSON.stringify(filters)}`,
    employee: (id) => `employee:${id}`,
    attendance: (filters) => `attendance:${JSON.stringify(filters)}`,
    payroll: (filters) => `payroll:${JSON.stringify(filters)}`,
    dashboardStats: (employeeId) => `dashboard:${employeeId || 'all'}`,
    departments: () => 'departments:all',
    positions: () => 'positions:all'
  };

  // Cache TTL constants (same as original)
  static TTL = {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 1800,
    VERY_LONG: 3600
  };
}

// Create singleton instance
const mockCacheService = new MockCacheService();

module.exports = mockCacheService;