/**
 * Configuration Constants for Adaptive Concurrency
 * Maps JSON policies to application-level constants.
 */
const limiterConfig = require('./limiter-config.json');
const migConfig = require('./gcp-mig-spec.json');

module.exports = {
  // The Netflix Gradient Thresholds
  LIMITER: {
    MIN_RT: limiterConfig.latency.baseline_ms,
    MAX_RT: limiterConfig.latency.baseline_ms * limiterConfig.latency.tolerance_multiplier,
    MIN_CONCURRENCY: limiterConfig.concurrency.min_limit,
    MAX_CONCURRENCY: limiterConfig.concurrency.max_limit
  },
  
  // The Infrastructure Targets for the MIG Actuator
  GCP: {
    PROJECT: migConfig.mig_config.project_id,
    ZONE: migConfig.mig_config.zone,
    MIG_NAME: migConfig.mig_config.managed_instance_group_name,
    INCREMENT: migConfig.mig_config.scaling_step_size,
    MAX_INSTANCES: migConfig.mig_config.max_instances
  }
};