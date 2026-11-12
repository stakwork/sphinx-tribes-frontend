# Frontend Contributing Guidelines

Thank you for contributing to Sphinx Tribes Frontend.

### File Naming Convention

- React component files should be Pascal case (for example, `MyComponent.tsx`).
- React component functions should also be Pascal case (for example, `function MyComponent()`).
- Folders should be camel case (for example, `peopleData`).
- TypeScript utility files should be camel case.
- Only `index.tsx` files should be lowercase.

### Formatting and Lint

- Run formatting before submitting:

  ```bash
  yarn run prettier
  ```

- Run lint:

  ```bash
  yarn run lint
  ```

For review standards (function patterns, color usage, reviewer expectations, and PR process), see [docs/CONTRIBUTION.md](docs/CONTRIBUTION.md).

### Getting Started

1. Fork the repository.
2. Create a new branch for your contribution:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Make your changes.
4. Commit your changes:
   ```bash
   git commit -m "Add your meaningful commit message"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```
6. Open a pull request to the `main` branch of the original repository.

### Code Review

All code contributions, including those with commit access, must go through a pull request and be approved by a core developer before merge.

## About Sphinx Bounties

A unique bounty platform that rewards in Bitcoin. Join [Sphinx Chat](https://buy.sphinx.chat/), accomplish a bounty, and start earning Bitcoin! Explore our [website](https://people.sphinx.chat) for available bounties.

### Thank You

Thank you for helping move the project forward. We appreciate your contribution.
