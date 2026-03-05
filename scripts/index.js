// scripts/index.js
console.log("🏁 Starting Local Orchestrator (mocked)");

const express = require("express");
const app = express();
app.use(express.json());

// Mock /api/search endpoint with dynamic failures
app.all("/api/search", (req, res) => {
  const failChance = 0.3; // 30% requests fail
  setTimeout(() => {
    if (Math.random() < failChance) {
      res.status(503).json({ error: "Service Unavailable (simulated)" });
    } else {
      res.json({
        results: [
          { id: 1, title: "Demo Search Result 1" },
          { id: 2, title: "Demo Search Result 2" }
        ]
      });
    }
  }, Math.random() * 100 + 50);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Local Orchestrator listening on http://localhost:${PORT}`));