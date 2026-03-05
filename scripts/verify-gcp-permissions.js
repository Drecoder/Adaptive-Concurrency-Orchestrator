/**
 * PRE-FLIGHT: IAM & Connectivity Validator (Local Demo)
 */

// Comment out the real compute import
// const compute = require('@google-cloud/compute');

// Use demo constants instead of real GCP config
const GCP = {
  PROJECT: "demo-project",
  MIG_NAME: "demo-service-mig",
  ZONE: "us-central1-a"
};

// Mock InstanceGroupManagersClient
class MockInstanceGroupManagersClient {
  async get({ project, zone, instanceGroupManager }) {
    console.log(`(mock) Fetching MIG metadata for ${instanceGroupManager} in ${zone}...`);
    // Return fake MIG metadata
    return [{
      name: instanceGroupManager,
      targetSize: 3
    }];
  }
}

async function checkPermissions() {
  // Use the mock client instead of real GCP client
  const client = new MockInstanceGroupManagersClient();

  console.log(`🔍 Checking IAM Permissions for Project: ${GCP.PROJECT}`);
  console.log(`🔍 Targeting MIG: ${GCP.MIG_NAME} in ${GCP.ZONE}...`);

  try {
    const [mig] = await client.get({
      project: GCP.PROJECT,
      zone: GCP.ZONE,
      instanceGroupManager: GCP.MIG_NAME
    });

    console.log("✅ IAM VERIFIED: Brain has access (mocked).");
    console.log(`📊 Current Fleet Size: ${mig.targetSize} instances.`);
  } catch (err) {
    console.error("❌ PERMISSION DENIED (mocked).");
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

checkPermissions();