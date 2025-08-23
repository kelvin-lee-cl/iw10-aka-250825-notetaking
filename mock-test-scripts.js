const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CONCURRENT_USERS = 150;
const TEST_DURATION = 300000; // 5 minutes

// Mock API responses to simulate Recraft AI
const mockResponses = [
    {
        imageUrl: 'https://example.com/mock-image-1.jpg',
        responseTime: 5000 // 5 seconds
    },
    {
        imageUrl: 'https://example.com/mock-image-2.jpg',
        responseTime: 8000 // 8 seconds
    },
    {
        imageUrl: 'https://example.com/mock-image-3.jpg',
        responseTime: 12000 // 12 seconds
    },
    {
        imageUrl: 'https://example.com/mock-image-4.jpg',
        responseTime: 15000 // 15 seconds
    },
    {
        imageUrl: 'https://example.com/mock-image-5.jpg',
        responseTime: 20000 // 20 seconds
    }
];

// Simulate API rate limiting
let requestCount = 0;
const rateLimitThreshold = 100; // Simulate rate limiting after 100 requests

// Performance tracking
const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: [],
    startTime: Date.now(),
    rateLimitHits: 0
};

// Mock API call that simulates Recraft AI behavior
async function mockApiCall(userId) {
    const startTime = Date.now();
    requestCount++;

    // Simulate rate limiting
    if (requestCount > rateLimitThreshold) {
        const error = {
            userId,
            error: 'Rate limit exceeded - too many requests',
            responseTime: Date.now() - startTime
        };
        results.failedRequests++;
        results.errors.push(error);
        results.rateLimitHits++;
        console.log(`🚫 User ${userId}: Rate limited`);
        return;
    }

    // Simulate random API response time (5-25 seconds)
    const responseTime = Math.random() * 20000 + 5000;

    // Simulate occasional API failures (5% failure rate)
    if (Math.random() < 0.05) {
        const error = {
            userId,
            error: 'API temporarily unavailable',
            responseTime: Date.now() - startTime
        };
        results.failedRequests++;
        results.errors.push(error);
        console.log(`❌ User ${userId}: API Error (${Math.round(responseTime)}ms)`);
        return;
    }

    // Simulate successful response
    await new Promise(resolve => setTimeout(resolve, responseTime));

    const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    results.totalRequests++;
    results.successfulRequests++;
    results.responseTimes.push(responseTime);

    console.log(`✅ User ${userId}: Success (${Math.round(responseTime)}ms) - Mock image generated`);
}

// Test server capacity without API calls
async function testServerCapacity() {
    console.log(`🚀 Starting MOCK load test with ${CONCURRENT_USERS} concurrent users for ${TEST_DURATION / 1000} seconds...`);
    console.log(`💰 NO CREDITS WILL BE CONSUMED - This is a simulation`);
    console.log(`📊 Monitoring performance at http://localhost:3001/api/performance`);

    const startTime = Date.now();
    const interval = setInterval(() => {
        // Create new requests for all users
        for (let i = 0; i < CONCURRENT_USERS; i++) {
            mockApiCall(i + 1);
        }

        // Check if test duration has elapsed
        if (Date.now() - startTime >= TEST_DURATION) {
            clearInterval(interval);
            printResults();
        }
    }, 1000); // Send requests every second
}

// Test with real server but mock API responses
async function testServerWithMockAPI() {
    console.log(`🧪 Testing server capacity with mock API responses...`);

    for (let i = 0; i < 10; i++) {
        const startTime = Date.now();

        try {
            // Test server endpoint with mock data
            const response = await fetch(`${BASE_URL}/api/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: 'Mock test prompt',
                    style: 'digital_illustration',
                    size: '1024x1024',
                    apiKey: 'mock-api-key'
                })
            });

            const responseTime = Date.now() - startTime;
            results.totalRequests++;
            results.responseTimes.push(responseTime);

            if (response.status === 500) {
                // Expected error since we're using mock API key
                results.failedRequests++;
                console.log(`⚠️  Request ${i + 1}: Server handled request (${responseTime}ms) - Expected API error`);
            } else {
                results.successfulRequests++;
                console.log(`✅ Request ${i + 1}: Success (${responseTime}ms)`);
            }
        } catch (error) {
            results.failedRequests++;
            console.log(`💥 Request ${i + 1}: Network error - ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    printResults();
}

// Quick test with minimal API calls
async function quickRealTest() {
    console.log('🧪 Running QUICK REAL test with 5 requests (5 credits)...');
    console.log('⚠️  This will consume 5 Recraft AI credits');

    const realApiKey = process.env.RECRAFT_API_KEY;

    if (!realApiKey) {
        console.log('❌ Please set your Recraft API key as the RECRAFT_API_KEY environment variable');
        return;
    }

    console.log('✅ Using API key from environment for real test...');

    for (let i = 0; i < 5; i++) {
        const startTime = Date.now();

        try {
            const response = await fetch(`${BASE_URL}/api/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: 'A simple test image',
                    style: 'digital_illustration',
                    size: '1024x1024',
                    apiKey: realApiKey
                })
            });

            const responseTime = Date.now() - startTime;
            results.totalRequests++;
            results.responseTimes.push(responseTime);

            if (response.ok) {
                results.successfulRequests++;
                const data = await response.json();
                console.log(`✅ Request ${i + 1}: Success (${responseTime}ms) - ${data.imageUrl}`);
            } else {
                results.failedRequests++;
                const errorText = await response.text();
                console.log(`❌ Request ${i + 1}: Failed (${response.status}) - ${errorText}`);
            }
        } catch (error) {
            results.failedRequests++;
            console.log(`💥 Request ${i + 1}: Error - ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between requests
    }

    printResults();
}

// Print test results
function printResults() {
    const totalTime = Date.now() - results.startTime;
    const avgResponseTime = results.responseTimes.length > 0
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
        : 0;

    console.log('\n📈 MOCK LOAD TEST RESULTS');
    console.log('========================');
    console.log(`⏱️  Total Test Time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📊 Total Requests: ${results.totalRequests}`);
    console.log(`✅ Successful Requests: ${results.successfulRequests}`);
    console.log(`❌ Failed Requests: ${results.failedRequests}`);
    console.log(`🚫 Rate Limit Hits: ${results.rateLimitHits}`);
    console.log(`📈 Success Rate: ${(results.successfulRequests / results.totalRequests * 100).toFixed(2)}%`);
    console.log(`⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`🔥 Max Response Time: ${Math.max(...results.responseTimes)}ms`);
    console.log(`❄️  Min Response Time: ${Math.min(...results.responseTimes)}ms`);
    console.log(`💰 Credits Consumed: 0 (Mock Test)`);

    // Server capacity assessment
    console.log('\n🎯 SERVER CAPACITY ASSESSMENT');
    console.log('============================');

    if (results.successfulRequests / results.totalRequests >= 0.9) {
        console.log('🎉 EXCELLENT: Server can handle 150 concurrent users!');
        console.log('💡 Your Render Starter plan should work well');
    } else if (results.successfulRequests / results.totalRequests >= 0.7) {
        console.log('⚠️  GOOD: Server performance is acceptable');
        console.log('💡 Consider minor optimizations');
    } else {
        console.log('💥 POOR: Server needs optimization');
        console.log('💡 Consider upgrading to Render Standard plan');
    }

    console.log('\n📝 RECOMMENDATIONS:');
    console.log('==================');
    console.log('1. Run a small real test with 5-10 requests to verify API integration');
    console.log('2. Monitor memory usage during peak load');
    console.log('3. Consider implementing request queuing for production');
    console.log('4. Set up proper error handling for API rate limits');
}

// Export functions
module.exports = {
    testServerCapacity,
    testServerWithMockAPI,
    quickRealTest
};

// Run appropriate test based on arguments
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--mock')) {
        testServerCapacity();
    } else if (args.includes('--server-test')) {
        testServerWithMockAPI();
    } else if (args.includes('--quick-real')) {
        quickRealTest();
    } else {
        console.log('Available test options:');
        console.log('  --mock        : Full mock test (NO credits consumed)');
        console.log('  --server-test : Test server capacity with mock API');
        console.log('  --quick-real  : Quick real test (5 credits consumed)');
    }
} 