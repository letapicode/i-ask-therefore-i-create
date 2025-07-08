# Mobile App Generation

The code generation service can optionally produce React Native projects. Templates are stored alongside web templates and selected via the portal wizard.

## Build & Emulator

Install dependencies with `pnpm install` and run `npx expo start` inside the generated app. Use the iOS or Android emulator from Expo to preview the project.

## Publishing

Configure your Apple and Google credentials under **Connectors** in the portal (`appleKey` and `googleKey`). Once configured, each entry on the **Apps** page includes a **Publish to Store** button that triggers the orchestrator to upload the build via the store APIs.
