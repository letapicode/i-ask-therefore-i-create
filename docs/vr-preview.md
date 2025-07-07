# VR Preview Navigation & Assets

The `/vr-preview` page provides an interactive WebXR scene powered by Three.js.
Navigation uses `OrbitControls` with `WASD` keys to move the camera. Clicking the
"Enter VR" button switches the renderer into headset mode.

Generated apps are fetched from the orchestrator and represented as simple 3D
boxes. Real assets can be placed under `binary-assets/vr` and will be loaded at
runtime.

Keyboard shortcuts:

| Key | Action            |
| --- | ----------------- |
| W   | Move forward      |
| S   | Move backward     |
| A   | Move left         |
| D   | Move right        |

Add your own `.glb` models or textures to the `binary-assets/vr` folder to see
them in the preview.
