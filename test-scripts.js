const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_KEY = process.env.RECRAFT_API_KEY || 'YOUR_RECRAFT_API_KEY_HERE'; // ⚠️ SET YOUR API KEY
const CONCURRENT_USERS = 150;
const TEST_DURATION = 300000; // 5 minutes

// Test prompts
const prompts = [
    'A Chinese dragon flying over a misty mountain landscape',
    'A child in Hanfu painting calligraphy',
    'A panda practicing martial arts in a bamboo forest',
    'A temple with red lanterns during Spring Festival',
    'A crane standing in a rice terrace at sunrise'
];

const styles = ['digital_illustration', 'realistic_image', 'vector_illustration'];
const sizes = ['1024x1024', '1365x1024', '1024x1365'];

// Performance tracking
const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    responseTimes: [],
    errors: [],
    startTime: Date.now()
};

// Generate random test data
function getRandomTestData() {
    return {
        prompt: prompts[Math.floor(Math.random() * prompts.length)],
        style: styles[Math.floor(Math.random() * styles.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)]
    };
}

// Single request test
async function makeRequest(userId) {
    const testData = getRandomTestData();
    const startTime = Date.now();

    try {
        const response = await fetch(`${BASE_URL}/api/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...testData,
                apiKey: API_KEY
            })
        });

        const responseTime = Date.now() - startTime;
        results.totalRequests++;
        results.responseTimes.push(responseTime);

        if (response.ok) {
            results.successfulRequests++;
            console.log(`✅ User ${userId}: Success (${responseTime}ms) - ${testData.prompt.substring(0, 30)}...`);
        } else {
            results.failedRequests++;
            const errorText = await response.text();
            results.errors.push({
                userId,
                status: response.status,
                error: errorText,
                responseTime
            });
            console.log(`❌ User ${userId}: Failed (${response.status}) - ${errorText.substring(0, 50)}...`);
        }
    } catch (error) {
        results.failedRequests++;
        results.errors.push({
            userId,
            error: error.message,
            responseTime: Date.now() - startTime
        });
        console.log(`💥 User ${userId}: Error - ${error.message}`);
    }
}

// Simulate concurrent users
async function simulateConcurrentUsers() {
    console.log(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users for ${TEST_DURATION / 1000} seconds...`);
    console.log(`📊 Monitoring performance at http://localhost:3001/api/performance`);

    const startTime = Date.now();
    const interval = setInterval(() => {
        // Create new requests for all users
        for (let i = 0; i < CONCURRENT_USERS; i++) {
            makeRequest(i + 1);
        }

        // Check if test duration has elapsed
        if (Date.now() - startTime >= TEST_DURATION) {
            clearInterval(interval);
            printResults();
        }
    }, 1000); // Send requests every second
}

// Print test results
function printResults() {
    const totalTime = Date.now() - results.startTime;
    const avgResponseTime = results.responseTimes.length > 0
        ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length
        : 0;

    console.log('\n📈 LOAD TEST RESULTS');
    console.log('===================');
    console.log(`⏱️  Total Test Time: ${Math.round(totalTime / 1000)}s`);
    console.log(`📊 Total Requests: ${results.totalRequests}`);
    console.log(`✅ Successful Requests: ${results.successfulRequests}`);
    console.log(`❌ Failed Requests: ${results.failedRequests}`);
    console.log(`📈 Success Rate: ${(results.successfulRequests / results.totalRequests * 100).toFixed(2)}%`);
    console.log(`⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`🔥 Max Response Time: ${Math.max(...results.responseTimes)}ms`);
    console.log(`❄️  Min Response Time: ${Math.min(...results.responseTimes)}ms`);

    if (results.errors.length > 0) {
        console.log(`\n🚨 Errors (${results.errors.length}):`);
        results.errors.slice(0, 10).forEach((error, index) => {
            console.log(`  ${index + 1}. User ${error.userId}: ${error.error}`);
        });
    }

    // Check if system can handle the load
    const successRate = results.successfulRequests / results.totalRequests;
    if (successRate >= 0.9) {
        console.log('\n🎉 SUCCESS: System can handle 150 concurrent users!');
    } else if (successRate >= 0.7) {
        console.log('\n⚠️  WARNING: System performance is acceptable but could be improved');
    } else {
        console.log('\n💥 FAILURE: System cannot handle 150 concurrent users');
    }
}

// Quick test function
async function quickTest() {
    console.log('🧪 Running quick test with 10 requests...');

    for (let i = 0; i < 10; i++) {
        await makeRequest(i + 1);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
    }

    printResults();
}

// Export functions for use
module.exports = {
    simulateConcurrentUsers,
    quickTest,
    makeRequest
};

// Run quick test if this file is executed directly
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--quick')) {
        quickTest();
    } else {
        simulateConcurrentUsers();
    }
} 