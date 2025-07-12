# Accessibility Scoring

The accessibility assistant converts audit results into a numeric score between
0 and 100. Critical violations reduce the score more than minor issues. Scores
above **90** are considered excellent while scores below **70** should be
addressed before release.

Scores are recorded by the analytics service via the `/a11yScore` endpoint and
visualized in the portal on `/a11y-score`. Monitoring these trends helps catch
regressions after deployments.
