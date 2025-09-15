// scripts/performanceTest.js
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

class PerformanceTest {
  constructor() {
    this.results = [];
  }

  async measureRequest(name, requestFn) {
    console.log(`🧪 Testing: ${name}`);
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const response = await requestFn();
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage().heapUsed;

      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // Convert to MB
      const responseSize = JSON.stringify(response.data).length / 1024; // Convert to KB

      const result = {
        name,
        duration: parseFloat(duration.toFixed(2)),
        memoryUsed: parseFloat(memoryUsed.toFixed(2)),
        responseSize: parseFloat(responseSize.toFixed(2)),
        status: response.status,
        cacheHit: response.headers['x-cache-hit'] === 'true',
        queryCount: parseInt(response.headers['x-query-count'] || '0')
      };

      this.results.push(result);
      
      console.log(`✅ ${name}: ${duration.toFixed(2)}ms | ${responseSize.toFixed(2)}KB | Cache: ${result.cacheHit ? 'HIT' : 'MISS'}`);
      
      return result;
    } catch (error) {
      console.error(`❌ ${name} failed:`, error.message);
      return null;
    }
  }

  async runTests() {
    console.log('🚀 Starting Performance Tests...\n');

    // Test 1: Employee List (First Load)
    await this.measureRequest('Employee List (Cold)', () =>
      axios.get(`${BASE_URL}/api/employees?page=1&limit=20`)
    );

    // Test 2: Employee List (Cached)
    await this.measureRequest('Employee List (Warm)', () =>
      axios.get(`${BASE_URL}/api/employees?page=1&limit=20`)
    );

    // Test 3: Employee Search
    await this.measureRequest('Employee Search', () =>
      axios.get(`${BASE_URL}/api/employees?search=john&page=1&limit=20`)
    );

    // Test 4: Attendance List
    await this.measureRequest('Attendance List', () =>
      axios.get(`${BASE_URL}/api/attendance?page=1&limit=20`)
    );

    // Test 5: Payroll List
    await this.measureRequest('Payroll List', () =>
      axios.get(`${BASE_URL}/api/payroll?page=1&limit=20`)
    );

    // Test 6: Large Dataset (100 items)
    await this.measureRequest('Large Dataset (100 items)', () =>
      axios.get(`${BASE_URL}/api/employees?page=1&limit=100`)
    );

    // Test 7: Cursor Pagination
    await this.measureRequest('Cursor Pagination', () =>
      axios.get(`${BASE_URL}/api/employees?cursor=true&limit=20`)
    );

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Performance Test Summary');
    console.log('=' .repeat(80));
    console.log('Test Name'.padEnd(30) + 'Duration'.padEnd(12) + 'Size'.padEnd(12) + 'Memory'.padEnd(12) + 'Cache'.padEnd(8) + 'Queries');
    console.log('-'.repeat(80));

    this.results.forEach(result => {
      if (result) {
        console.log(
          result.name.padEnd(30) +
          `${result.duration}ms`.padEnd(12) +
          `${result.responseSize}KB`.padEnd(12) +
          `${result.memoryUsed}MB`.padEnd(12) +
          (result.cacheHit ? 'HIT' : 'MISS').padEnd(8) +
          result.queryCount
        );
      }
    });

    // Calculate averages
    const validResults = this.results.filter(r => r !== null);
    if (validResults.length > 0) {
      const avgDuration = validResults.reduce((sum, r) => sum + r.duration, 0) / validResults.length;
      const avgSize = validResults.reduce((sum, r) => sum + r.responseSize, 0) / validResults.length;
      const cacheHitRate = validResults.filter(r => r.cacheHit).length / validResults.length * 100;

      console.log('-'.repeat(80));
      console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
      console.log(`Average Response Size: ${avgSize.toFixed(2)}KB`);
      console.log(`Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
    }

    console.log('\n💡 Performance Recommendations:');
    
    const slowTests = validResults.filter(r => r.duration > 500);
    if (slowTests.length > 0) {
      console.log('⚠️  Slow endpoints detected (>500ms):');
      slowTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.duration}ms`);
      });
    }

    const largeResponses = validResults.filter(r => r.responseSize > 100);
    if (largeResponses.length > 0) {
      console.log('📦 Large responses detected (>100KB):');
      largeResponses.forEach(test => {
        console.log(`   - ${test.name}: ${test.responseSize}KB`);
      });
    }

    if (cacheHitRate < 50) {
      console.log('🔄 Consider increasing cache TTL or warming cache');
    }

    console.log('\n✅ Performance testing completed!');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PerformanceTest();
  tester.runTests().catch(console.error);
}

module.exports = PerformanceTest;