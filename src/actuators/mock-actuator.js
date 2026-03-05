const config = require('../../config/constants')
/**
 * MOCK ACTUATOR: The Simulated Infrastructure
 * Purpose: Simulates "New Field" creation with a delay.
 */
class MockActuator {
    constructor() {
        this.totalInstances = 1; // Start with one "Constant" field
        this.isScaling = false;
    }

    async triggerMigScaleUp() {
        if (this.isScaling) return { status: 'ALREADY_SCALING' };

        if (this.totalInstances >= config.GCP.MAX_INSTANCES) { 
            return { status: 'LIMIT_REACHED'};
        }

        this.isScaling = true;
        console.log(`\n[INFRASTRUCTURE] 🛠  Signal Received: Demand Complexity exceeds Golden Path.`);
        console.log(`[INFRASTRUCTURE] ⏳ Provisioning "New Field" (Instance #${this.totalInstances + 1})...`);

        // Simulate the 3-second "Warm up" of a new Node.js instance
        return new Promise((resolve) => {
            setTimeout(() => {
                this.totalInstances++;
                this.isScaling = false;
                console.log(`[INFRASTRUCTURE] ✅ New Field Online. Total Instances: ${this.totalInstances}`);
                resolve({ status: 'SUCCESS', targetSize: this.totalInstances });
            }, 3000); 
        });
    }
}

module.exports = MockActuator;