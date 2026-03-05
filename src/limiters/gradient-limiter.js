const config = require("../../config/constants");

class GradientLimiter {
  constructor() {
    this.minRT = config.LIMITER.MIN_RT; // Golden Path (250ms)
    this.minLimit = config.LIMITER.MIN_CONCURRENCY; // 5
    this.maxLimit = config.LIMITER.MAX_CONCURRENCY; // 10

    // Smoothing state
    this.ema = null;
    this.alpha = config.LIMITER.SMOOTHING;
    this.band = config.LIMITER.STABILITY_BAND;
  }

  calculate(latency, currentLimit) {
    const safeLatency = Number(latency) || this.minRT;
    const safeCurrentLimit = Number(currentLimit) || this.minLimit;

    // Hard stability lock when latency is exactly Golden Path
    if (Math.abs(safeLatency - this.minRT) < this.band) {
      this.ema = this.minRT;
      return {
        newLimit: safeCurrentLimit,
        gradient: 0,
      };
    }

    // --- 1. Smooth the latency signal (EMA) ---
    if (this.ema === null) {
      this.ema = safeLatency;
    } else {
      this.ema = this.alpha * safeLatency + (1 - this.alpha) * this.ema;
    }

    // --- 2. Compute derivative-like gradient ---
    const gradient = (this.ema - this.minRT) / this.minRT;

    let newLimit = safeCurrentLimit;

    // --- 3. Stable zone: hold steady at Golden Path ---
    if (Math.abs(gradient) < 0.02) {
      newLimit = safeCurrentLimit;
    }

    // --- 4. Squeeze: latency rising ---
    else if (gradient > 0) {
      // Extreme lag → hard floor
      if (safeLatency > this.minRT * 10) {
        newLimit = this.minLimit;
      } else {
        // Normal squeeze
        newLimit = safeCurrentLimit * (1 - gradient * 1.2);

        // Ensure squeeze is meaningful but not collapsing
        if (newLimit <= this.minLimit) {
          newLimit = this.minLimit + 0.5;
        }
      }
    }

    // --- 5. Recovery: latency improving ---
    else if (gradient < 0) {
      newLimit = safeCurrentLimit * (1 - gradient * 1.1); // negative gradient increases limit
    }

    // --- 6. Clamp to allowed range ---
    newLimit = Math.max(this.minLimit, Math.min(this.maxLimit, newLimit));

    return {
      newLimit: Number.parseFloat(newLimit.toFixed(2)),
      gradient: Number.parseFloat(gradient.toFixed(2)),
    };
  }
}

module.exports = GradientLimiter;
