# CI/CD Configuration

Workflows in this folder automate linting, tests and releases.

- `lint-test.yml` runs ESLint, Jest and builds on each push.
- `codeql.yml` scans for security issues.
- `dependency-check.yml` fails the build if vulnerable packages are found.
- `release.yml` publishes packages to npm when a version tag is pushed.
