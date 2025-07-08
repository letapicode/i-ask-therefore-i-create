# Optimization Assistant

Run `node tools/optimize.js` to analyze recent AWS spend and receive simple recommendations for cost savings. The script queries CloudWatch metrics for the last week and prints scaling suggestions based on average CPU utilization.

## Predictive Mode

When invoked by the orchestrator's `/api/costForecast` endpoint, the assistant operates in a predictive mode. It combines usage data from the analytics service with CPU metrics gathered via `tools/optimize.js` and applies exponential smoothing to forecast near‑term infrastructure costs.
