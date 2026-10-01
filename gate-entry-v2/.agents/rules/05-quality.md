# Accessibility, performance, security, testing, workflow

## 12. Accessibility (WCAG 2.2 AA)

- Semantic HTML first (`button`, `nav`, `main`, `table`, headings in order). No `div` with `onClick`.
- Everything works with the **keyboard** alone. Focus is visible (`focus-visible:` ring from tokens). Modals trap and restore focus (handled by the primitive).
- Every input has a programmatic label. Errors are announced (`aria-live` / `aria-describedby`). Colour is never the only signal.
- Contrast ≥ 4.5:1 for text, 3:1 for UI components. Touch targets ≥ 24px (prefer 44px on mobile).
- Route changes update the document title and move focus to the main heading or announce the change.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Test with `jest-axe`/`axe-core` in component tests and Playwright a11y checks on key flows.

---

---

## 13. Performance

- Budget: track LCP, INP, CLS. Set a bundle-size budget in CI.
- Route-level code splitting by default; lazy-load heavy widgets and rarely used dialogs.
- Import icons and utilities by name (tree-shakeable). No whole-library imports (`import _ from 'lodash'`).
- Avoid waterfalls: prefetch in loaders, parallelise independent queries, prefetch on link intent.
- Virtualise long lists. Debounce search inputs. Use `useDeferredValue` for expensive filtering.
- Images: explicit `width`/`height`, `loading="lazy"` below the fold, modern formats.
- Measure before optimising (React DevTools Profiler, Lighthouse, `vite-bundle-visualizer`).

---

---

## 14. Security

- Never use `dangerouslySetInnerHTML` with unsanitised content. If unavoidable, sanitise with DOMPurify and add a comment.
- Never use `eval`, `new Function`, or dynamic `import()` of URLs from config. Config drives behaviour only through registries.
- Tokens: prefer **httpOnly, Secure, SameSite cookies**. If tokens must be held in JS, keep them in memory, never in `localStorage`. Never log tokens or PII.
- Secrets never go in frontend code or `VITE_*` env vars. Only public values do.
- Validate and encode any value used in URLs. Use `rel="noopener noreferrer"` on external links.
- Assume the client is hostile. Frontend permission checks are UX, not security.

---

---

## 15. Error handling, loading, and empty states

- Every async surface has **four states**: loading (skeleton), success, empty (explain and offer next action), error (say what happened, how to fix it, and offer retry).
- Errors are typed (`ApiError` with `status`, `code`, `message`, `fieldErrors`). User-facing text comes from a mapping, not raw server messages.
- Error boundaries report to monitoring (Sentry or equivalent) with route, portal id, and user id (no PII).
- Never `console.log` in committed code. Use a logger wrapper.

---

---

## 16. Copy and UX writing

- Sentence case. Plain verbs. Buttons say what happens ("Save changes", "Send for approval"), not "Submit" or "OK".
- The same action keeps the same name across button, dialog, and toast.
- Errors state what failed and how to fix it. No apologies, no vague "Something went wrong" without a next step.
- Empty states are an invitation to act, not decoration.
- All user-facing strings are centralised or i18n-ready (`t('orders.approve')`) if the portal is multi-language. Do not concatenate translated fragments.
- Format dates, numbers, and currency with `Intl` and the user's locale/timezone. Never hand-format.

---

---

## 17. Testing

- **Unit** (Vitest): pure functions, schema parsing, config resolvers, permission logic.
- **Component** (Testing Library): test behaviour through roles and labels (`getByRole`), not implementation details or class names. Use **MSW** for network, and never mock TanStack Query itself.
- **E2E** (Playwright): critical flows per portal (login, main workflow, permission-denied, offline/error path).
- Config engine tests: valid config renders; invalid config degrades safely; unknown widget type falls back; permission-filtered menu; tenant override merge order.
- Use factories/fixtures for data. No test depends on another test's state.
- A bug fix starts with a failing test.

---

---

## 18. Code quality and workflow

- ESLint (typescript-eslint strict, `react-hooks`, `jsx-a11y`, TanStack Query and Router plugins) + Prettier (with the Tailwind class-sorting plugin). Zero warnings policy.
- Naming: components `PascalCase.tsx`, hooks `useThing.ts`, utils `kebab-case.ts`, tests `*.test.tsx`. One component per file (small private helpers may share a file).
- Component file order: imports → types → constants → component → helpers. Keep components under ~150 lines. Extract hooks and subcomponents beyond that.
- Comments explain **why**, not what. Delete dead code and unused exports. No commented-out code.
- Commits: Conventional Commits. PRs are small, single-purpose, and include screenshots for UI changes.
- CI gates: `typecheck`, `lint`, `test`, `build`, bundle-size check, and a11y checks.

---
