# Frontend Contributing Guidelines

Thank you for contributing to Sphinx Tribes. These guidelines keep code, styling, and pull
request reviews consistent across the frontend.

## File And Naming Standards

- Name React component files in PascalCase, for example `BountyCard.tsx`.
- Name React component functions in PascalCase, for example `function BountyCard() {}`.
- Name folders and non-component TypeScript files in camelCase.
- Use lowercase `index.ts` and `index.tsx` files only for module entry points.
- Prefer named types and interfaces for shared data shapes. Keep local-only types near the
  component or helper that uses them.

## React And TypeScript Standards

- Keep components focused on rendering and user interaction. Move reusable business logic into
  helpers, stores, or hooks.
- Prefer existing hooks, stores, helpers, and components before adding new abstractions.
- Use explicit return types on exported helpers and store methods.
- Avoid `any` for new shared APIs. If an existing component uses `any`, keep the change scoped and
  add a narrower type when it reduces risk.
- Keep async handlers defensive: handle failed requests, loading states, and empty states.
- Do not introduce broad refactors in bug-fix pull requests. Keep the diff tied to the issue.

## Styling And Colors

- Reuse colors from `src/config/colors.ts` when a matching token exists.
- Do not hardcode new color values unless the design requires a new token. If a color is reused,
  add or reuse a named token instead.
- Prefer the project's existing styled-component patterns for nearby code.
- Keep responsive styles close to the component they affect, and test mobile behavior when editing
  mobile layouts.
- Preserve spacing, border radius, typography, and button behavior from the surrounding UI unless
  the issue explicitly asks for a visual change.

## Validation Before Opening A PR

Run the narrowest checks that cover your change:

```bash
yarn eslint <changed files> --max-warnings 100 --ext .ts --ext .tsx
yarn jest <changed test file or related spec> --runInBand --no-cache --coverage=false
yarn prettier:check
```

If your change only touches documentation, run:

```bash
yarn prettier:check
```

If a check cannot run locally, mention the reason in the pull request.

## Pull Request Checklist

- Link the issue that the PR fixes.
- Summarize the behavior change and user impact.
- Include screenshots or video for visible UI changes.
- Add or update focused tests for bug fixes and shared behavior.
- Keep commits and PR titles concise and descriptive.
- Rebase or update from the target branch before requesting review.

## Code Review Standards

All code contributions, including those from maintainers with commit access, must go through a
pull request and be approved by a core developer before merge.

Reviewers should check:

- The change solves the linked issue without unrelated refactors.
- New code follows the naming, styling, and validation standards above.
- Edge cases, loading states, empty states, permissions, and mobile behavior are handled when
  relevant.
- Tests or manual validation are appropriate for the risk of the change.

## About Sphinx Bounties

Sphinx Bounties rewards contributors for completing work in the Sphinx ecosystem. Explore available
bounties at [people.sphinx.chat](https://people.sphinx.chat).
