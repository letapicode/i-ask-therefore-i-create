# Mobile App Generation

The code generation service can optionally produce React Native projects. Templates are stored alongside web templates and selected via the portal wizard.

## Build & Emulator

Install dependencies with `pnpm install` and run `npx expo start` inside the generated app. Use the iOS or Android emulator from Expo to preview the project.

## Mobile Storefront Tutorial

1. Open the Create App page in the portal.
2. Select **mobile** as the language and choose the **e-commerce** template.
3. Save your Stripe key under Connectors.
4. Submit the form and wait for generation to finish.
5. Run `pnpm install` and `npx expo start` in the output directory to preview the mobile storefront.
