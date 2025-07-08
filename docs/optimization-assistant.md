# Optimization Assistant

Run `node tools/optimize.js` to analyze recent AWS spend and receive simple recommendations for cost savings. The script queries CloudWatch metrics for the last week and prints scaling suggestions based on average CPU utilization.

## Predictive Mode

The assistant can also forecast next month's bill. Run `node tools/updateForecast.js` nightly (via cron or a scheduled workflow). It collects recent analytics event counts and CPU averages, applies exponential smoothing and writes the result to `services/analytics/.forecast.json`.

The orchestrator exposes `/api/costForecast` which reads that file and returns `{ cpuForecast, events, costForecast }`. The portal dashboard displays this projection so teams can see estimated spend before deploying new features.
