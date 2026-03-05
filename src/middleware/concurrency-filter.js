/**
 * NEXT.JS ADAPTIVE MIDDLEWARE
 * Specifically tuned for WordPress REST API bottlenecks.
 */
const createMiddleware = (logicEngine, actuator) => {
    let activeRequests = 0;
    // We start with a conservative window for PHP-FPM workers
    let currentLimit = 10; 

    return async (req, res, next) => {
        const priority = req.headers['x-priority'] || 'low';

        // 1. GATEKEEPING (The Squeeze)
        if (activeRequests >= currentLimit) {
            if (priority === 'high') {
                console.log(`⚠️  [URGENT] Bypassing Squeeze for Clinical Search.`);
                actuator.triggerMigScaleUp(); 
            } else {
                console.log(`⏳ [LOAD SHED] Throttling routine WP request.`);
                // Return 429 to the frontend to trigger a retry/cached view
                return res.status(429).json({ error: 'System Busy' });
            }
        }

        activeRequests++;
        const wpStart = Date.now();

        try {
            // 2. THE WORK: Next.js calls WordPress
            await next(); 
        } finally {
            // 3. THE FEEDBACK (Analyzing WP Performance)
            const wpDuration = Date.now() - wpStart;
            activeRequests--;

            const result = logicEngine.calculate(wpDuration, currentLimit);
            currentLimit = result.newLimit;

            // Signal Felman if we identify the "Data Layer Lag"
            if (wpDuration > (logicEngine.minRT * 3)) {
                console.log(`🚨 [BOTTLENECK] WP REST API Lag: ${wpDuration}ms. Check PHP-FPM/Redis.`);
            }
        }
    };
};