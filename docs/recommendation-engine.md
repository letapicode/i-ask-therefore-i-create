# Recommendation Engine

This component analyzes usage data from the analytics service and suggests additional features for generated apps.

Data is aggregated in DynamoDB and processed periodically to compute recommendations which are then exposed via a new API endpoint `/api/recommendations`.

## Enabling Business Recommendations

The analytics service provides a `/businessTips` endpoint that examines usage patterns
and user ratings to suggest monetization strategies. To display these tips in the portal:

1. Run the analytics service so that events are recorded.
2. Ensure the portal can reach the service under the `/analytics` path.
3. Open the **Dashboard** page to view a new **Business Tips** section with suggestions.
