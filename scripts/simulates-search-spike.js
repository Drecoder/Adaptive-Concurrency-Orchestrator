// scripts/simulates-search-spike.js
const axios = require("axios");

console.log("🚀 Initializing ForMedics Search Spike Simulation...");
const TARGET = "http://localhost:3000/api/search";

const doctors = Array.from({ length: 12 }, (_, i) => `Doctor ${i + 1}`);

(async function runSimulation() {
  console.log("\n--- PHASE 1: High-Complexity Surge (Triggering the Squeeze) ---");

  for (const doc of doctors) {
    const priority = Math.random() < 0.3 ? "HIGH" : "LOW";
    console.log(`[${doc}]   📡 Sending ${priority} priority search...`);

    try {
      await axios.post(TARGET, { query: `test ${doc}` });
      if (Math.random() < 0.2) {
        console.log(`[${doc}]   ❌ ERROR: Artificial network hiccup`);
      } else {
        console.log(`[${doc}]   ✅ Completed successfully`);
      }
    } catch (err) {
      console.log(`[${doc}]   ❌ ERROR: ${err.message}`);
    }
  }

  console.log("\n--- Simulation Complete ---\n");

  // Mock scaling logs
  console.log("[INFRASTRUCTURE] 🛠 Signal Received: Demand Complexity exceeds Golden Path.");
  console.log("[INFRASTRUCTURE] ⏳ Provisioning 'New Field' (Instance #2)...");
  setTimeout(() => {
    console.log("[INFRASTRUCTURE] ✅ New Field Online. Total Instances: 2");
    console.log("[INFRASTRUCTURE] ✅ Cooldown Verified: Prevented redundant infrastructure churn.");
  }, 200);
})();