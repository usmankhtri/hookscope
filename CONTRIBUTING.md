# Contributing to HookLab

Thank you for your interest in contributing to HookLab!

## Development Guidelines

1. **Architecture Separation**: Maintain clean boundaries between UI components, engine utilities, and storage adapters.
2. **Deterministic Logic**: Parsing, hashing, and code generation utilities must remain deterministic and covered by automated unit tests.
3. **TypeScript**: Keep strict typing; avoid `any` wherever possible.
4. **Testing**: Run `npm test` before submitting pull requests to ensure all unit tests pass.
5. **Linting**: Ensure `npm run lint` passes without errors.

## Pull Request Process

1. Fork the repository and create your feature branch: `git checkout -b feature/my-feature`.
2. Commit your changes with descriptive commit messages.
3. Push to your branch and open a Pull Request against `main`.
