const GradientLimiter = require('../../src/limiters/gradient-limiter');
const { LIMITER } = require('../../config/constants');

describe('Gradient Limiter: WordPress Protection Math', () => {
    let limiter;

    beforeEach(() => {
        // Initialize with constants from config
        limiter = new GradientLimiter(LIMITER);
    });

    test('should maintain limit when latency is at Golden Path (250ms)', () => {
        const currentLimit = 10;
        const result = limiter.calculate(250, currentLimit);
        
        // At 250ms, the gradient is 1.0, so the limit should remain steady
        expect(result.newLimit).toBeCloseTo(10);
        console.log(`✅ Stability Verified: Limit held at ${result.newLimit} for 250ms RT.`);
    });

    test('should Squeeze the limit when WordPress lags (750ms)', () => {
        const currentLimit = 10;
        const result = limiter.calculate(750, currentLimit);
        
        // 750ms / 250ms = Gradient of 0.33. Limit should shrink significantly.
        expect(result.newLimit).toBeLessThan(currentLimit);
        expect(result.newLimit).toBeGreaterThan(LIMITER.MIN_CONCURRENCY);
        console.log(`📉 Squeeze Verified: Limit dropped to ${result.newLimit.toFixed(2)} due to Lag Effect.`);
    });

    test('should respect MIN_CONCURRENCY floor during extreme lag', () => {
        const currentLimit = 5;
        // Extreme lag: 5 seconds
        const result = limiter.calculate(5000, currentLimit);
        
        expect(result.newLimit).toBe(LIMITER.MIN_CONCURRENCY);
        console.log(`🛡️ Floor Verified: Limit protected at minimum (${LIMITER.MIN_CONCURRENCY}) during death-spiral.`);
    });

    test('should expand limit (Un-Squeeze) when latency improves', () => {
        const currentLimit = 5;
        // Simulation: A 'New Field' was added, latency dropped back to 250ms
        const result = limiter.calculate(250, currentLimit);
        
        expect(result.newLimit).toBeGreaterThan(currentLimit);
        console.log(`📈 Recovery Verified: Limit expanded to ${result.newLimit.toFixed(2)} as system stabilized.`);
    });
});