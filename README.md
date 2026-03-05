````markdown
# Adaptive Concurrency Orchestrator

### Headless WordPress & Next.js Infrastructure Shield

This repository contains a **Proof of Work (PoW)** for an adaptive concurrency controller. It is designed to sit between a Next.js
frontend and a WordPress REST API backend to prevent service degradation during high-complexity search spikes.

---

## 1. The Core Problem: The "Lag Effect"

In a Headless WordPress architecture, complex clinical searches often bypass the Object Cache (Redis)
and hit the database directly.

* **Saturation:** When PHP-FPM workers saturate, response times drift from a "Golden Path" of **250ms** to several seconds.
* **The Death Spiral:** Standard CPU-based autoscalers react too slowly to this "Lag Effect," leading to a total bottleneck of the clinical data layer.

---

## 2. The Solution: Gradient-Based Orchestration

Instead of waiting for CPU spikes, this orchestrator monitors the **Latency Gradient** of the WordPress REST API.

* **Squeezing:** When the system detects latency drifting above the baseline, it automatically shrinks the concurrency limit to protect the WordPress "Core."
* **Priority Load Shedding:** High-priority clinical searches are granted an emergency bypass, while routine marketing or blog traffic is "Dripped" or rejected (429) until the system stabilizes.
* **Symmetric Scaling:** The system proactively signals a GCP Managed Instance Group (MIG) to provision a "New Field" (extra compute) the moment the squeeze is triggered.

---

## 3. Project Structure

```text
├── config/             # Golden Path constants and GCP specs
├── scripts/            # Simulation tools for search spikes
├── src/
│   ├── actuators/      # Infrastructure signaling (GCP MIG)
│   ├── limiters/       # The Gradient Math (The Brain)
│   ├── middleware/     # Next.js / Express adaptive filter
│   └── services/       # WordPress REST API integration
└── tests/              # Unit, Integration
````

---

## 4. Getting Started

### Prerequisites

* Node.js v18+
* `npm install`

### Setup

1. Clone the repository.
2. `cp .env.example .env`
3. Adjust `GOLDEN_LATENCY_MS` based on your WordPress benchmarks.

### Running Simulations

To demonstrate the system's reaction to a complexity spike:

```bash
# Start the orchestrator server
npm start

# In a second terminal, trigger the spike simulation
npm run spike
```

---

## 5. Technical Validation

The system is backed by a comprehensive test suite to ensure mathematical accuracy and infrastructure reliability:

* **Unit Tests:** Validate the `GradientLimiter` math and the `Actuator` guardrails.
* **Integration Tests:** Verify the `Middleware` correctly handles `x-priority` headers.
* **System Tests:** Confirm the end-to-end recovery cycle from "Squeeze" to "Scale-up."

```bash
npm test
```

---

### Middleware Edge-Case Validation

To ensure the orchestrator behaves predictably under real traffic conditions, the test suite simulates realistic request sequences, covering both priority handling and concurrency limits:

1. **Low-Priority Requests at Limit**
   *Simulates multiple low-priority requests until concurrency reaches its calculated limit.*
   **Outcome:** Low-priority requests are rejected with `429` once the system is saturated, preventing overload.
   *Story:* *“Routine traffic is throttled to maintain stability under peak load.”*

2. **High-Priority Requests Trigger Scale-Up**
   *High-priority clinical searches are sent when the system is at capacity.*
   **Outcome:** Requests bypass limits and the orchestrator signals GCP to provision extra compute.
   *Story:* *“Critical searches always get through, and resources scale dynamically to meet demand.”*

3. **Concurrency Decrements on Request Completion**
   *Monitors the internal concurrency counter via `res.finish` callbacks.*
   **Outcome:** Completed requests free capacity, allowing new requests to enter.
   *Story:* *“System recovers gracefully as work completes, preventing bottlenecks.”*

4. **Rapid Alternating Priorities**
   *Mixes high- and low-priority requests in quick succession.*
   **Outcome:** High-priority requests continue to bypass, low-priority requests are throttled if necessary, and scale-up signals are triggered appropriately.
   *Story:* *“Even under chaotic traffic patterns, priority handling and system stability remain consistent.”*

5. **Numeric Edge Limits**
   *Tests the limiter under extreme calculated values.*
   **Outcome:** Requests are processed safely, respecting maximum and minimum thresholds.
   *Story:* *“Mathematical safeguards prevent runaway concurrency or excessive throttling.”*

✅ **Key Takeaways:**

* The orchestrator dynamically protects WordPress from saturation while prioritizing critical searches.
* Internal concurrency accounting and finish callbacks ensure realistic request handling.
* Scale-up and squeeze logic are validated end-to-end, reinforcing system resilience.

```
