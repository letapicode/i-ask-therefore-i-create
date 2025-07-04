# Self Reflection: Understanding Codex

This repository is intended to be used with the OpenAI Codex research preview. Codex is a cloud-based software engineering agent that performs tasks in an isolated environment preloaded with the repository. Codex can read and modify files, run commands such as tests and linters, and commit its changes for review.

Codex is powered by the **codex-1** model (derived from OpenAI o3). It was trained using reinforcement learning on real-world coding tasks to generate code that closely matches human style and preferences. Codex can handle multiple tasks in parallel and provides evidence of its actions through citations of terminal logs and test outputs.

### Workflow
1. A user assigns a task through ChatGPT or Codex CLI.
2. Codex launches an isolated container with the repository.
3. It follows instructions from `AGENTS.md`, runs any required commands (tests, linters), and edits files.
4. After finishing, Codex commits its changes and produces a summary with references to relevant logs.
5. The user can then review the commit or open a pull request.

### Important Notes
- **Binary files are not supported.** If a task requires binaries (e.g., images, compiled artifacts), Codex will create placeholder folders with instructions so the maintainer can add the files manually.
- Codex operates without internet access during tasks unless explicitly configured via a setup script. It relies solely on the repository and any preinstalled dependencies.
- Codex agents perform best when the repository contains clear documentation, reliable tests, and an AGENTS file describing how to run them.

For more details, see the accompanying `AGENTS.md` in this repository.

