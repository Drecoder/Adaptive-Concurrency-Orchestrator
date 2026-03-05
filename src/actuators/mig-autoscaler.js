/**
 * ACTUATOR: Managed Instance Group (MIG) Orchestrator
 * Purpose: Executes the "Scale-Up" command to provide a landing spot for the 'Drip' queue.
 */
const compute = require('@google-cloud/compute');
const { GCP } = require('../../config/constants');

// Initialize the GCP Compute Client
const client = new compute.InstanceGroupManagersClient();

/**
 * Resizes the MIG by incrementing the target size.
 * Includes FinOps guardrails to prevent infinite scaling.
 */
async function triggerMigScaleUp() {
    try {
        // 1. Fetch current state to check against Max Capacity
        const [mig] = await client.get({
            project: GCP.PROJECT,
            zone: GCP.ZONE,
            instanceGroupManager: GCP.MIG_NAME
        });

        const currentSize = mig.targetSize;

        // 2. FinOps Guardrail: Protect the budget
        if (currentSize >= GCP.MAX_INSTANCES) {
            console.warn(`[ACTUATOR] Max instances (${GCP.MAX_INSTANCES}) reached. Holding at current capacity.`);
            return { status: 'MAX_CAPACITY', size: currentSize };
        }

        // 3. Execute the Scale-Up (The "Drip" Instance)
        const newSize = currentSize + GCP.INCREMENT;
        
        console.log(`[ACTUATOR] Scaling MIG ${GCP.MIG_NAME}: ${currentSize} -> ${newSize}...`);

        const [operation] = await client.resize({
            project: GCP.PROJECT,
            zone: GCP.ZONE,
            instanceGroupManager: GCP.MIG_NAME,
            size: newSize
        });

        // We don't 'await' the full operation completion here to keep the Node.js loop fast.
        // The Google Global Load Balancer (GLB) will automatically detect the new VM when it's healthy.
        return { 
            status: 'SCALING_INITIATED', 
            operationId: operation.name,
            targetSize: newSize 
        };

    } catch (err) {
        console.error("❌ ACTUATOR FAILURE: Could not communicate with GCP API.");
        console.error(`Reason: ${err.message}`);
        
        // In a real PoW, you might trigger a PagerDuty alert here
        throw err;
    }
}

module.exports = { triggerMigScaleUp };