/**
 * PRE-FLIGHT: IAM & Connectivity Validator
 */
const compute = require('@google-cloud/compute');
const { GCP } = require('../config/constants');

async function checkPermissions() {
    const client = new compute.InstanceGroupManagersClient();
    
    console.log(`🔍 Checking IAM Permissions for Project: ${GCP.PROJECT}`);
    console.log(`🔍 Targeting MIG: ${GCP.MIG_NAME} in ${GCP.ZONE}...`);
    
    try {
        // Attempt to fetch the MIG metadata
        const [mig] = await client.get({
            project: GCP.PROJECT,
            zone: GCP.ZONE,
            instanceGroupManager: GCP.MIG_NAME
        });
        
        console.log("✅ IAM VERIFIED: Brain has access.");
        console.log(`📊 Current Fleet Size: ${mig.targetSize} instances.`);
    } catch (err) {
        console.error("❌ PERMISSION DENIED: The Brain cannot resize the infrastructure.");
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
    }
}

checkPermissions();