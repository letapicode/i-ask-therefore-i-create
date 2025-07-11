# Disaster Recovery

This guide explains how to configure multi-region backups using the `disaster-recovery` Terraform module and orchestrator hooks.

1. Deploy the module to create primary and replica S3 buckets with replication enabled.
2. Set `BACKUP_BUCKET` and `REPLICA_BUCKET` environment variables for the orchestrator.
3. Start the orchestrator with these variables to automatically upload daily backups which replicate to the secondary region.
4. To restore, copy objects from the replica bucket back into your service directories.
