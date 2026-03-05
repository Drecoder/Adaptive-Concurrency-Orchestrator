const config = require("../../config/constants");

class GradientLimiter {
  constructor() {
    this.minRT = config.LIMITER.MIN_RT; // SLI Target (Golden Path): The idealized latency baseline.
    this.minLimit = config.LIMITER.MIN_CONCURRENCY; // Floor: Minimum throughput to prevent service starvation.
    this.maxLimit = config.LIMITER.MAX_CONCURRENCY; // Ceiling: Maximum load the WordPress origin can safely ingest.

    // Smoothing state
    this.ema = null; // Internal state for the Exponential Moving Average.
    // Initialized to null to handle the "Cold Start" sequence;
    // ensures the first latency sample seeds the baseline
    // without being dampened by a zero-init.
    this.alpha = config.LIMITER.SMOOTHING; // EMA Smoothing Factor (α): A calculated heuristic representing the
    // system's "memory." Derived from the desired Time Constant (τ)
    // to balance reactivity vs. stability.
    this.band = config.LIMITER.STABILITY_BAND; // this.band. This is my Stability Band. In a production GCP environment,
    // we’d determine this value by looking at our historical $P_{50}$ to $P_{95}$ variance in Cloud Monitoring.
  }

  calculate(latency, currentLimit) {
    // Defensive Fallbacks: Ensuring "Safe" inputs for the controller.
    // Prevents NaN propagation if the telemetry source (Prometheus/Logs)
    // is intermittent or if the origin times out.
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

    // Normalizing telemetry output: Truncating to 2 decimal places to
    // maintain precision while ensuring "clean" structured logs for
    // BigQuery ingestion and Prometheus scraping.
    return {
      newLimit: Number.parseFloat(newLimit.toFixed(2)),
      gradient: Number.parseFloat(gradient.toFixed(2)),
    };
  }
}

module.exports = GradientLimiter;
