// scripts/simulate.js
console.log("🚀 Starting Netflix-Style Priority Simulation...");

const doctors = Array.from({ length: 4 }, (_, i) => `Doctor ${i + 1}`);

console.log("\n--- Phase: Saturated Data Layer ---");
doctors.forEach(doc => {
  const rejected = Math.random() < 0.7; // 70% chance to reject
  console.log(
    `[${doc}] ${rejected ? "❌ Rejected" : "✅ Accepted"}`
  );
});