const axios = require('axios');

/**
 * SIMULATE SEARCH SPIKE: WordPress Stress Test
 * Goal: Trigger the 'Lag Effect' and observe the Orchestrator's Squeeze.
 */
async function runSearchSpike() {
    console.log("🚀 Initializing ForMedics Search Spike Simulation...");
    console.log("Target: http://localhost:3000/api/search\n");

    const sendRequest = async (id, priority, isComplex) => {
        const label = `[Doctor ${id}]`.padEnd(12);
        const type = isComplex ? "COMPLEX (No Cache)" : "SIMPLE (Cached)";
        
        try {
            console.log(`${label} 📡 Sending ${priority.toUpperCase()} priority search...`);
            
            // Sending complexity via query param and priority via Header
            const response = await axios.get('http://localhost:3000/api/search', {
                params: { 
                    q: `clinical_query_${id}`,
                    complex: isComplex 
                },
                headers: { 'x-priority': priority }
            });

            console.log(`${label} ✅ Success | Latency: ${response.data.latency} | Status: ${response.status}`);
        } catch (err) {
            if (err.response && err.response.status === 429) {
                console.error(`${label} ❌ SHEDDED: Orchestrator blocked low-priority request (429).`);
            } else {
                console.error(`${label} ❌ ERROR: ${err.message}`);
            }
        }
    };

    // PHASE 1: The "Monday Morning" Surge
    // We send 12 requests simultaneously to exceed the default 'currentLimit' of 10.
    console.log("--- PHASE 1: High-Complexity Surge (Triggering the Squeeze) ---");
    
    const surge = [
        // 4 Emergency Requests (Should bypass squeeze/trigger scale-up)
        sendRequest(1, 'high', true),
        sendRequest(2, 'high', true),
        sendRequest(3, 'high', true),
        sendRequest(4, 'high', true),
        
        // 8 Routine Requests (Some should be 'Dripped' or 'Shedded' as the limit shrinks)
        sendRequest(5, 'low', true),
        sendRequest(6, 'low', true),
        sendRequest(7, 'low', true),
        sendRequest(8, 'low', true),
        sendRequest(9, 'low', true),
        sendRequest(10, 'low', true),
        sendRequest(11, 'low', true),
        sendRequest(12, 'low', true),
    ];

    await Promise.all(surge);

    console.log("\n--- Simulation Complete ---");
    console.log("Check the Server Logs to verify the 'New Field' scale-up signal.");
}

runSearchSpike().catch(console.error);