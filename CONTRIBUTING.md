# Contributing to Beatwave

We welcome contributions to Beatwave!

## Development Setup

1. Fork and clone the repository.
2. Ensure you have Node.js 22+ and pnpm installed.
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run tests and benchmarks:
   ```bash
   pnpm test
   pnpm benchmark
   ```

## Commit Guidelines
- Keep pull requests focused on a single responsibility.
- Include unit or deterministic replay tests for any gesture or audio logic modifications.
- Do not commit copyrighted audio files or personal API secrets.
