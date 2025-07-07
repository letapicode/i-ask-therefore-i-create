# Figma Design Import

The portal allows uploading Figma JSON exports to generate basic React components.

1. Export your Figma frame as JSON using the Figma API or plugin.
2. Visit `/figma` in the portal and upload the JSON file.
3. The orchestrator converts the design to a simple React component which can be previewed and downloaded.

The conversion logic lives in `tools/figma-converter.js` and is also exposed via `/api/figma`.
