# How Codex Works

Codex is a cloud-based software engineering agent. It loads the repository into an isolated container and performs tasks like editing files, running tests, and creating pull requests. Each task runs independently and commits changes once complete. Codex references logs and test results with citations so maintainers can audit its work.

- **Task Delegation**: You describe a coding task and Codex carries it out in a sandboxed environment. Multiple tasks can run in parallel.
- **Testing**: If test commands are specified in `AGENTS.md`, Codex runs them and cites the output in pull requests.
- **Security**: The environment is isolated with no network access unless explicitly configured. This ensures Codex only interacts with the provided repository and its dependencies.
- **Binary Files**: Codex cannot generate binary assets (e.g., images, compiled artifacts). Create placeholder directories like `binary-assets/` and add descriptions so maintainers can add the actual binaries manually.
- **Documentation**: Codex respects `AGENTS.md` for instructions about style, commands, and PR details. Provide clear instructions there to streamline future contributions.

By understanding these mechanics, we can use Codex to iteratively build this project while maintaining control over code quality and security.
