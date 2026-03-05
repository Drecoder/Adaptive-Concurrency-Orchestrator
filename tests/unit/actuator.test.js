const MockActuator = require('../../src/actuators/mock-actuator');
const config = require('../../config/constants');

describe('Actuator Unit Tests: Infrastructure Signaling', () => {
    let actuator;

    beforeEach(() => {
        // Reset the actuator state before each test
        actuator = new MockActuator(config.GCP);
    });

    test('should increment instance count when triggerMigScaleUp is called', async () => {
        const initialCount = actuator.totalInstances;
        await actuator.triggerMigScaleUp();
        
        expect(actuator.totalInstances).toBe(initialCount + 1);
        console.log(`✅ Scale Signal Verified: ${initialCount} -> ${actuator.totalInstances}`);
    });

    test('should NOT exceed MAX_INSTANCES defined in config', async () => {
        // Force the actuator to the limit
        actuator.totalInstances = config.GCP.MAX_INSTANCES;
        
        const result = await actuator.triggerMigScaleUp();
        
        expect(actuator.totalInstances).toBe(config.GCP.MAX_INSTANCES);
        expect(result.status).toBe('LIMIT_REACHED');
        console.log(`✅ Boundary Check Passed: Respects Max Instances (${config.GCP.MAX_INSTANCES})`);
    });

    test('should ignore redundant signals during cooldown period', async () => {
        // Trigger two scales instantly
        const p1 = actuator.triggerMigScaleUp();
        const p2 = actuator.triggerMigScaleUp();
        
        const [res1, res2] = await Promise.all([p1, p2]);
        
        // Only one should have successfully initiated a "New Field"
        const successCount = [res1, res2].filter(r => r.status === 'SUCCESS').length;
        expect(successCount).toBe(1);
        console.log("✅ Cooldown Verified: Prevented redundant infrastructure churn.");
    });
});