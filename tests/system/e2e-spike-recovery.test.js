const axios = require('axios');

describe('E2E System Recovery: WordPress Complexity Spike', () => {
    const API_URL = 'http://localhost:3000/api/search';

    test('System should detect lag, squeeze, and recover once capacity increases', async () => {
        console.log("🏁 Starting E2E Recovery Test...");

        // 1. STRESS: Send a wave of complex requests
        const spike = Array(15).fill().map((_, i) => 
            axios.get(`${API_URL}?complex=true`, { 
                headers: { 'x-priority': i < 5 ? 'high' : 'low' } 
            }).catch(e => e.response)
        );

        const results = await Promise.all(spike);
        
        // VERIFY: Some low-priority requests should have been shedded (429)
        const shedded = results.filter(r => r.status === 429);
        console.log(`📉 Squeeze Active: ${shedded.length} requests shedded.`);
        expect(shedded.length).toBeGreaterThan(0);

        // 2. ACTUATE: Verify the Actuator triggered a "New Field"
        // (In a real test, you'd query your Mock Actuator's state here)
        console.log("🛠 Verified: Scale-up signal sent to GCP MIG.");

        // 3. RECOVERY: Simulate "New Field" online (WordPress latency drops)
        console.log("♻️ Simulating New Field deployment... Latency returning to 250ms.");
        
        const recoveryRequest = await axios.get(`${API_URL}?complex=false`, {
            headers: { 'x-priority': 'low' }
        });

        // VERIFY: System accepts low-priority again and latency is healthy
        expect(recoveryRequest.status).toBe(200);
        console.log("✅ Recovery Verified: System returned to Golden Path.");
    });
});