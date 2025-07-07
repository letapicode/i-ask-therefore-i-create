# RL-Driven Code Quality Improvement

Feedback from users is logged and used to retrain models that produce higher quality code over time. This process closes the loop between generation and real-world usage.

## Automated Feedback Loop

Ratings collected by the analytics service are periodically processed by `tools/train-from-ratings.js`.
The script snapshots rating data to `services/analytics/training/` and triggers a retraining run.
Execution is scheduled via GitHub Actions in `ci/train-from-ratings.yml` which by default runs daily at 2AM.

To change the cadence, edit the cron expression in that workflow file and update as needed.
