# Recommendation Engine

This component analyzes usage data from the analytics service and suggests additional features for generated apps.

Data is aggregated in DynamoDB and processed periodically to compute recommendations which are then exposed via a new API endpoint `/api/recommendations`.

## Enabling Business Recommendations

Start the analytics service with the environment variable `ENABLE_BUSINESS_TIPS=true` to expose the `/businessTips` endpoint. The portal dashboard will display monetization suggestions returned from this route.
