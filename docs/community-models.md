# Community Model Sharing

Aggregated models from the federated training service are published to an S3 bucket defined by `COMMUNITY_MODELS_BUCKET`. Each time a new model is aggregated the service uploads a timestamped checkpoint.

The portal lists available versions via `/api/communityModels`. Selecting a version downloads the weights and stores them locally in `.community-model.json` for use by other services.

Only tenants that opt in via `/optIn` contribute updates. Model checkpoints may include patterns learned from contributed data; do not opt in if training data contains sensitive information.
