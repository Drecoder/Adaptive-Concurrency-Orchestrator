This `README.md` is designed to serve as the definitive technical guide for your Proof of Work. It frames the project as a professional infrastructure solution for **Headless WordPress** environments, focusing on reliability and the "Lag Effect" without any personal references.

---

# Adaptive Concurrency Orchestrator

### Headless WordPress & Next.js Infrastructure Shield

This repository contains a **Proof of Work (PoW)** for an adaptive concurrency controller. It is designed to sit between a Next.js frontend and a WordPress REST API backend to prevent service degradation during high-complexity search spikes.

## 1. The Core Problem: The "Lag Effect"

In a Headless WordPress architecture, complex clinical searches often bypass the Object Cache (Redis) and hit the database directly.

* **Saturation:** When PHP-FPM workers saturate, response times drift from a "Golden Path" of **250ms** to several seconds.
* **The Death Spiral:** Standard CPU-based autoscalers react too slowly to this "Lag Effect," leading to a total bottleneck of the clinical data layer.

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
└── tests/              # Unit, Integration, and E2E recovery tests

```

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

## 5. Technical Validation

The system is backed by a comprehensive test suite to ensure mathematical accuracy and infrastructure reliability:

* **Unit Tests:** Validate the `GradientLimiter` math and the `Actuator` guardrails.
* **Integration Tests:** Verify the `Middleware` correctly handles `x-priority` headers.
* **System Tests:** Confirm the end-to-end recovery cycle from "Squeeze" to "Scale-up."

```bash
npm test

```

---

# Adaptive-Concurrency-Orchestrator
