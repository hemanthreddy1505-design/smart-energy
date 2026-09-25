# Contributing to GridSense Enterprise EMS

Thank you for your interest in contributing to GridSense Enterprise EMS! We welcome high-quality code contributions, bug reports, and architectural enhancements.

---

## 1. Code of Conduct

This project adheres to the [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). By participating, you are expected to maintain a constructive and respectful atmosphere.

---

## 2. Development Workflow & Git Standards

We follow the **GitFlow** branching model:
- `main`: Production-ready release branch (tagged `v1.0.0`, `v2.0.0`, etc.).
- `feature/<name>`: New features, UI screens, or transducer integrations.
- `fix/<name>`: Bug fixes and performance patches.

### Conventional Commits
All commit messages must adhere to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:
- `feat(scope)`: A new user-facing feature.
- `fix(scope)`: A bug fix.
- `docs(scope)`: Documentation updates.
- `refactor(scope)`: Internal structural refactoring with zero feature change.
- `perf(scope)`: Performance optimizations.
- `test(scope)`: Test fixtures and unit suites.

---

## 3. Submitting Pull Requests

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/dynamic-threshold-engine
   ```
2. Run local tests and verify frontend/backend builds:
   ```bash
   npm run build:frontend
   cd android && ./gradlew assembleDebug
   ```
3. Commit using descriptive conventional commit messages.
4. Push to your branch and open a Pull Request using the repository PR template.
