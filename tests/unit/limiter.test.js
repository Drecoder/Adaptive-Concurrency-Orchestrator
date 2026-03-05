const GradientLimiter = require('../../src/limiters/gradient-limiter');

describe('Gradient Limiter Logic', () => {
    const config = { minRT: 250, maxConcurrency: 20 };
    const limiter = new GradientLimiter(config);

    test('should shrink the limit when latency is 3x the Golden Path', () => {
        const currentLimit = 10;
        const result = limiter.calculate(750, currentLimit); // 750ms is slow for WP
        expect(result.newLimit).toBeLessThan(currentLimit);
        console.log(`📉 Squeeze Verified: Limit dropped to ${result.newLimit}`);
    });
});