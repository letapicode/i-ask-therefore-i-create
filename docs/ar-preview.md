# Augmented Reality Preview

The `/ar` page lets you view generated UIs as AR overlays using WebXR. A simple
Three.js scene is initialized with AR support and loads layout information from
`/api/arLayout`.

Selecting on an AR controller places a new object at a fixed distance and sends
the updated layout back to the orchestrator. Layout changes are also recorded by
the analytics service for history.

Place custom 3D assets under `binary-assets/ar` to use them in your previews.
