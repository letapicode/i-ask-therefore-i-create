# Optimization Assistant

Run `node tools/optimize.js` to analyze recent AWS spend and receive simple recommendations for cost savings. The script queries CloudWatch metrics for the last week and prints scaling suggestions based on average CPU utilization. It also reads analytics events stored by `services/analytics` to estimate the upcoming month's expenses.

The orchestrator exposes `/api/costForecast` which returns the same monthly cost projection for use in the portal dashboard.
