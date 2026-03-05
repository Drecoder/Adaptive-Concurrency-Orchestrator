const axios = require('axios');

async function runPrioritySimulation() {
    console.log("🚀 Starting Netflix-Style Priority Simulation...");

    const sendRequest = (id, priority, isComplex) => {
        return axios.get('http://localhost:3000/search' + (isComplex ? '?complex=true' : ''), {
            headers: { 'x-priority': priority }
        }).then(() => console.log(`[Doctor ${id}] ✅ Finished (${priority} priority)`))
          .catch(err => console.error(`[Doctor ${id}] ❌ Rejected`));
    };

    // Simulate a saturated system
    console.log("\n--- Phase: Saturated Data Layer ---");
    
    // Mix of high and low priority doctors
    const doctors = [
        sendRequest(1, 'high', true), // Emergency
        sendRequest(2, 'low', true),  // Routine
        sendRequest(3, 'high', true), // Emergency
        sendRequest(4, 'low', true)   // Routine
    ];

    await Promise.all(doctors);
}

runPrioritySimulation();