/**
 * LOGIC ENGINE: The Gradient Controller
 * Purpose: Compares real-time telemetry against the Source of Truth.
 */
class GradientLimiter {
    constructor(config) {
        this.minRT = config.minRT; // The Golden Path (e.g., 200ms)
        this.maxLimit = config.maxConcurrency;
    }

    calculate(currentRT, currentLimit) {
        // The Math: Gradient = (Ideal / Actual)
        const gradient = this.minRT / currentRT;
        
        // New Limit = (Current * Gradient) + Headroom
        let newLimit = (currentLimit * gradient) + 2;

        // FinOps Guardrails
        newLimit = Math.max(5, Math.min(this.maxLimit, newLimit));

        return {
            newLimit: parseFloat(newLimit.toFixed(2)),
            action: gradient < 0.8 ? 'SIGNAL_SCALE' : 'MAINTAIN',
            gradient
        };
    }
}

module.exports = GradientLimiter;