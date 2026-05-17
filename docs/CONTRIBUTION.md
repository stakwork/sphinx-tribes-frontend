## Sphinx Tribes Frontend Contribution Standards

This guide helps keep pull requests easy to review and maintain. Please follow these checks before opening a PR to improve merge speed.

## 1) Before You Open a PR

- Run formatting and lint checks:
  - `yarn run prettier`
  - `yarn run lint`
- Run tests related to your changed area when possible:
  - `yarn test-jest`
  - targeted Cypress checks if UI behavior changed
- Keep PRs focused: one PR = one logical change.
- Use descriptive branch names and keep changes small enough to review quickly.

## 2) Function Patterns

The codebase uses both React component files and utility functions. For consistency:

- For exported/shared functions, prefer explicit named functions.
  - Components and hooks are typically easiest to review as named functions.
- For local callbacks in a component, prefer named `const` handlers instead of complex inline lambdas in JSX.
- Use clear action-oriented names, for example:
  - `handleSubmit`, `formatAmount`, `fetchBounties`
- Keep component files focused:
  - One main exported component per file
  - Utility helpers can be kept in `utils/` and shared when reused

## 3) Color Usage

- This project keeps shared color values in `src/config/colors.ts`.
- Before introducing a new color value, check for an existing palette key first.
- Do not add random hex/rgb values in component JSX/CSS unless there is a clear temporary reason.
- If a new color is needed and expected to be reused, add it to `colors.ts` and use the token from that file.
- Use existing semantic tokens where available (status, button, background, text, border variants).

## 4) PR Review Expectations

- Help reviewers respond quickly by keeping PR descriptions short and clear:
  - What changed
  - Why it changed
  - What you tested
  - Any known risks
- Add a screenshot/video for UI changes.
- Avoid scope creep:
  - new ideas or unrelated cleanup should be separated into a follow-up PR.

## 5) After Feedback

- Fix review feedback in one follow-up commit or squash when possible.
- Reply to each reviewer comment and mark it resolved.
- Re-run affected checks after updates.

## 6) PR Flow (Quick Reference)

1. Fork the repository.
2. Create a feature/fix branch.
3. Make the change.
4. Add/adjust tests if behavior changes.
5. Run formatting, lint, and relevant tests.
6. Push and open a PR to `main`.

## About Sphinx Bounties

A unique bounty platform that rewards in Bitcoin. Join [Sphinx Chat](https://buy.sphinx.chat/), accomplish a bounty, and start earning Bitcoin! Explore our [website](https://people.sphinx.chat) for a list of available bounties.

## Thank You

We appreciate your contribution to our project! Your efforts make a difference, and we look forward to collaborating with you.

Feel free to connect with us on our [Sphinx Community](https://people.sphinx.chat/) and follow us on [Twitter](https://twitter.com/stakwork) for updates.
