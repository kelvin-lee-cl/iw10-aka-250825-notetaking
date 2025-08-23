const express = require('express');
const app = express();

// Production monitoring metrics
const metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    concurrentRequests: 0,
    maxConcurrentRequests: 0,
    responseTimes: [],
    apiErrors: [],
    startTime: Date.now(),
    lastReset: Date.now()
};

// Reset metrics daily
setInterval(() => {
    const now = Date.now();
    if (now - metrics.lastReset > 24 * 60 * 60 * 1000) { // 24 hours
        metrics.totalRequests = 0;
        metrics.successfulRequests = 0;
        metrics.failedRequests = 0;
        metrics.responseTimes = [];
        metrics.apiErrors = [];
        metrics.lastReset = now;
        console.log('📊 Daily metrics reset');
    }
}, 60000); // Check every minute

// Middleware to track requests
app.use((req, res, next) => {
    const startTime = Date.now();
    metrics.totalRequests++;
    metrics.concurrentRequests++;

    if (metrics.concurrentRequests > metrics.maxConcurrentRequests) {
        metrics.maxConcurrentRequests = metrics.concurrentRequests;
    }

    // Log important requests
    if (req.path.includes('/api/generate-image') || req.path.includes('/api/generate-from-image')) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Concurrent: ${metrics.concurrentRequests}`);
    }

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;
        metrics.responseTimes.push(responseTime);

        if (res.statusCode >= 200 && res.statusCode < 300) {
            metrics.successfulRequests++;
        } else {
            metrics.failedRequests++;
            // Track API errors
            if (res.statusCode >= 400) {
                metrics.apiErrors.push({
                    timestamp: Date.now(),
                    status: res.statusCode,
                    path: req.path,
                    responseTime
                });
            }
        }

        metrics.concurrentRequests--;

        // Keep only last 1000 response times
        if (metrics.responseTimes.length > 1000) {
            metrics.responseTimes.shift();
        }

        // Keep only last 100 API errors
        if (metrics.apiErrors.length > 100) {
            metrics.apiErrors.shift();
        }

        originalEnd.apply(this, args);
    };

    next();
});

// Performance endpoint for monitoring services
app.get('/api/performance', (req, res) => {
    const uptime = Date.now() - metrics.startTime;
    const avgResponseTime = metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
        : 0;

    const currentMemory = process.memoryUsage();

    res.json({
        uptime: Math.round(uptime / 1000) + 's',
        totalRequests: metrics.totalRequests,
        successfulRequests: metrics.successfulRequests,
        failedRequests: metrics.failedRequests,
        successRate: metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: Math.round(avgResponseTime) + 'ms',
        currentConcurrentRequests: metrics.concurrentRequests,
        maxConcurrentRequests: metrics.maxConcurrentRequests,
        memoryUsage: {
            rss: Math.round(currentMemory.rss / 1024 / 1024) + 'MB',
            heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024) + 'MB'
        },
        recentApiErrors: metrics.apiErrors.slice(-10),
        systemHealth: {
            memoryUsagePercent: Math.round((currentMemory.heapUsed / currentMemory.heapTotal) * 100),
            isHealthy: currentMemory.heapUsed < currentMemory.heapTotal * 0.8 // 80% threshold
        }
    });
});

// Production metrics endpoint (protected)
app.get('/api/production-metrics', (req, res) => {
    const uptime = Date.now() - metrics.startTime;
    const avgResponseTime = metrics.responseTimes.length > 0
        ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
        : 0;

    const currentMemory = process.memoryUsage();

    res.json({
        uptime: Math.round(uptime / 1000) + 's',
        totalRequests: metrics.totalRequests,
        successfulRequests: metrics.successfulRequests,
        failedRequests: metrics.failedRequests,
        successRate: metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: Math.round(avgResponseTime) + 'ms',
        currentConcurrentRequests: metrics.concurrentRequests,
        maxConcurrentRequests: metrics.maxConcurrentRequests,
        memoryUsage: {
            rss: Math.round(currentMemory.rss / 1024 / 1024) + 'MB',
            heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024) + 'MB',
            heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024) + 'MB'
        },
        recentApiErrors: metrics.apiErrors.slice(-10),
        systemHealth: {
            memoryUsagePercent: Math.round((currentMemory.heapUsed / currentMemory.heapTotal) * 100),
            isHealthy: currentMemory.heapUsed < currentMemory.heapTotal * 0.8 // 80% threshold
        }
    });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
    const currentMemory = process.memoryUsage();
    const memoryUsagePercent = Math.round((currentMemory.heapUsed / currentMemory.heapTotal) * 100);

    const isHealthy = memoryUsagePercent < 80 && metrics.concurrentRequests < 200;

    res.json({
        status: isHealthy ? 'healthy' : 'warning',
        timestamp: new Date().toISOString(),
        memoryUsage: memoryUsagePercent + '%',
        concurrentRequests: metrics.concurrentRequests,
        uptime: Math.round((Date.now() - metrics.startTime) / 1000) + 's'
    });
});

// Alert endpoint for monitoring services
app.get('/api/alerts', (req, res) => {
    const currentMemory = process.memoryUsage();
    const memoryUsagePercent = Math.round((currentMemory.heapUsed / currentMemory.heapTotal) * 100);

    const alerts = [];

    if (memoryUsagePercent > 80) {
        alerts.push({
            level: 'warning',
            message: `High memory usage: ${memoryUsagePercent}%`,
            timestamp: new Date().toISOString()
        });
    }

    if (metrics.concurrentRequests > 150) {
        alerts.push({
            level: 'warning',
            message: `High concurrent requests: ${metrics.concurrentRequests}`,
            timestamp: new Date().toISOString()
        });
    }

    if (metrics.failedRequests / metrics.totalRequests > 0.1) {
        alerts.push({
            level: 'error',
            message: `High error rate: ${(metrics.failedRequests / metrics.totalRequests * 100).toFixed(2)}%`,
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        alerts,
        totalAlerts: alerts.length
    });
});

const PORT = process.env.MONITOR_PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Production monitor running on port ${PORT}`);
    console.log(`📊 Metrics: http://localhost:${PORT}/api/production-metrics`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    console.log(`🚨 Alerts: http://localhost:${PORT}/api/alerts`);
}); 