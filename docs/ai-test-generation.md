# AI-Based Test Generation

`tools/gen-tests.js` demonstrates how unit tests could be generated from source files using the OpenAI API.

```bash
node tools/gen-tests.js src/index.ts
```

The script currently logs the selected file but can be extended to call the API and write Jest tests.
