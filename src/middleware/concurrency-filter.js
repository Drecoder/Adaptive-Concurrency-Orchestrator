const createMiddleware = (limiter, actuator) => {

    // Instance-level state (NOT global)
    let currentConcurrency = 0;

    return (req, res, next) => {

        const isHighPriority = req.headers['x-priority'] === 'high';

        // --- Mock latency source (for now) ---
        const latency = req.headers['x-latency']
            ? Number(req.headers['x-latency'])
            : limiter.minRT;

        // --- Compute allowed concurrency limit ---
        const { newLimit } = limiter.calculate(latency, currentConcurrency);

        // --- HIGH PRIORITY BYPASS ---
        if (isHighPriority) {

            if (currentConcurrency >= newLimit) {
                actuator.triggerMigScaleUp();
            }

            currentConcurrency++;

            if (res.on) {
                res.on('finish', () => currentConcurrency--);
            }

            return next();
        }

        // --- NORMAL PRIORITY → enforce squeeze ---
        if (currentConcurrency >= newLimit) {
            return res.status(429).json({ error: 'Squeezed' });
        }

        // --- Accept request ---
        currentConcurrency++;

        if (res.on) {
            res.on('finish', () => currentConcurrency--);
        }

        next();
    };
};

module.exports = createMiddleware;