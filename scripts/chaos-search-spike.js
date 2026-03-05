// scripts/chaos-search-spike.js
const axios = require("axios");

console.log("🚀 Initializing ForMedics Chaos Search Spike Simulation...");
const TARGET = "http://localhost:3000/api/search";
const doctors = Array.from({ length: 12 }, (_, i) => `Doctor ${i + 1}`);
let fleetSize = 1; // start with 1 instance

// Helper to simulate random delay
function randomDelay(min = 100, max = 800) {
  return new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));
}

// Helper to simulate random error types
function randomError() {
  const roll = Math.random();
  if (roll < 0.15) return "Artificial network hiccup";
  if (roll < 0.25) return "Request failed with status code 503";
  if (roll < 0.35) return "Request timeout";
  return null; // success
}

(async function runSimulation() {
  const phases = ["Low Complexity", "Medium Complexity", "High-Complexity Surge"];

  for (const phase of phases) {
    console.log(`\n--- PHASE: ${phase} ---`);

    for (const doc of doctors) {
      const priority = Math.random() < 0.3 ? "HIGH" : "LOW";
      console.log(`[${doc}]   📡 Sending ${priority} priority search...`);

      // Simulate network latency
      await randomDelay();

      const errorMsg = randomError();
      if (errorMsg) {
        console.log(`[${doc}]   ❌ ERROR: ${errorMsg}`);
      } else {
        console.log(`[${doc}]   ✅ Completed successfully`);
      }
    }

    // Simulate fleet scaling based on phase
    if (phase === "Medium Complexity") fleetSize = 2;
    if (phase === "High-Complexity Surge") fleetSize = Math.floor(Math.random() * 4) + 2; // 2-5 instances

    console.log(`[INFRASTRUCTURE] ⚡ Current Fleet Size: ${fleetSize}`);
    console.log(`[INFRASTRUCTURE] 🛠 Signal Received: Demand Complexity exceeds Golden Path.`);
    console.log(`[INFRASTRUCTURE] ⏳ Provisioning instances...`);
    await randomDelay(200, 500);
    console.log(`[INFRASTRUCTURE] ✅ Fleet Ready. Total Instances: ${fleetSize}`);
    console.log(`[INFRASTRUCTURE] ✅ Cooldown Verified: Prevented redundant infrastructure churn.`);
  }

  console.log("\n--- Chaos Simulation Complete ---\n");
})();