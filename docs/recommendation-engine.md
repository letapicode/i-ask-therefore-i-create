# Recommendation Engine

This component analyzes usage data from the analytics service and suggests additional features for generated apps.

Data is aggregated in DynamoDB and processed periodically to compute recommendations which are then exposed via a new API endpoint `/api/recommendations`.
