# AGENT Instructions for Codex

This repository uses OpenAI Codex to automate development tasks. Follow these guidelines when contributing through Codex:

## Repository Conventions
- Use clear commit messages and keep the worktree clean before finishing a task.
- Do not include **binary files** (images, executables, archives) in commits. Instead, create a folder where the binary should reside and place a text file describing the expected contents. The maintainer will add the binaries manually.
- Place documentation in Markdown files using standard `#` headers.

## Testing
There are currently no automated tests configured. If tests are added later, describe how to run them here so Codex can execute them.

## Pull Request Messages
When Codex creates a pull request, include a short summary of what changed and reference relevant files using the citation format `F:filepath:Lstart-Lend` as described in the system instructions.

