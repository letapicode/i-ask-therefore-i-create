# Edge Inference Support

Generated apps can optionally load lightweight models in the browser using TensorFlow.js. The codegen service bundles pretrained models and exposes a helper to run predictions without server calls.

## Model Formats

Models should be provided in TensorFlow.js `model.json` format or SavedModel directories. Place them under `binary-assets/models` and configure the path via the `MODEL_PATH` environment variable if needed.

Only small models (under 5MB) are recommended for browser loading to avoid long download times.

## Limitations

- The placeholder model included in the repository does not perform real predictions.
- Complex models may exceed browser memory limits; convert or quantize them before use.

Use `/api/predict` to run server-side inference through the orchestrator.
