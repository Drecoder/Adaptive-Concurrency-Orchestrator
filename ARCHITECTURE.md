# Adaptive Concurrency Control System Architecture

## Overview
This project implements a closed-loop feedback controller designed to protect fragile origins (like Headless WordPress) from saturation while maximizing throughput for high-performance frontends (Next.js).

## 1. The Control Loop Logic

The orchestrator operates as a **Proportional-Controller** that treats system latency as a dynamic data stream.

### Control Loop Phases

| Phase | Operation | Description |
|-------|-----------|-------------|
| **Sense** | Monitor | Tracks request latency (RTT) from the WordPress API in real-time |
| **Analyze** | GradientLimiter | Applies Exponential Moving Average (EMA) to filter network noise; calculates the Gradient (rate of change relative to the "Golden Path" SLO) |
| **Act** | Dynamic Adjustment | Automatically adjusts the concurrency semaphore to "squeeze" traffic during saturation or "recover" during idle periods |

## 2. Cloud-Native Stack (GCP)

For production deployment within a Google Cloud Platform environment, the architecture scales as follows:

| Layer | Component | GCP Service |
|-------|-----------|-------------|
| **Telemetry** | Sensor | GCP Managed Service for Prometheus (polling P95 latencies) |
| **Compute** | Controller | Cloud Run / GKE (stateless execution of the Limiter logic) |
| **Shared State** | Memory | Cloud Memorystore (Redis) (syncing limits across multiple pods) |
| **Observability** | Sink | Cloud Logging & BigQuery (storing Gradients for trend analysis) |

### Architecture Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│   Controller │────▶│  WordPress  │
│   Frontend  │◀────│  (Cloud Run) │◀────│    Origin   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Prometheus │
                    │  (P95 monitoring) │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐            ┌──────▼─────┐
        │  Redis    │            │ BigQuery   │
        │ (State)   │            │ (Analytics)│
        └───────────┘            └────────────┘
```

## 3. Data Engineering Integration

By normalizing output to 2 decimal places and providing the Gradient as a first-class metric, this orchestrator feeds directly into Data Engineering pipelines:

### 📊 Real-time Dashboards
- Visualize "System Stress" by plotting the Gradient against CPU/DB load
- Track concurrency adjustments in real-time
- Monitor SLO compliance and saturation events

### ⚡ Predictive Alerting
Use PromQL to trigger alerts when the Gradient stays above 0.8 for a sustained period, indicating a need for horizontal scaling of the WordPress backend:

```promql
# Alert when system stress persists for >5 minutes
gradient_ema > 0.8 AND 
rate(gradient_ema[5m]) > 0
```

### 📈 Trend Analysis
- Store Gradients in BigQuery for long-term trend analysis
- Correlate with business metrics (traffic spikes, conversion rates)
- Build predictive models for capacity planning

## Key Benefits

- **Automatic Protection**: Prevents WordPress origin saturation without manual intervention
- **Maximized Throughput**: Dynamically finds the optimal concurrency level
- **Observability First**: All decisions are tracked and analyzable
- **Cloud-Native**: Built on GCP's managed services for reliability and scale