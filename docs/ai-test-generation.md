# AI-Based Test Generation

`tools/gen-tests.js` uses the OpenAI API to create Jest tests from a source file.

```bash
OPENAI_API_KEY=sk-... node tools/gen-tests.js src/index.ts
```

The script will write `src/index.test.ts` containing the generated tests.
