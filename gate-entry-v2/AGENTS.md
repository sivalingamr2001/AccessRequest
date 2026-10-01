# AGENTS.md — Frontend Rules for Configurable React Portals (2026)

Stack: React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn/ui · TanStack Router / Query / Table / Form · Zod · Vitest + Testing Library + Playwright + MSW.

Detailed rules live in `.agents/rules/`. Slash-command workflows live in `.agents/workflows/`.

> **Before you write code:** check `package.json` for installed versions and read the official docs for any API you are unsure about. Never write Tailwind, TanStack, or shadcn APIs from memory. Do not invent APIs.

---

## 0. Operating principles

1. **Config over code.** A new portal, page, menu item, or widget should be added by editing configuration, not by copy-pasting components.
2. **Compose, don't fork.** Extend via props, slots, variants, and composition. Never duplicate a component to change one thing.
3. **Server state is not client state.** Server data lives in TanStack Query. URL state lives in the router. Form state lives in TanStack Form. Only truly local UI state uses `useState`.
4. **Make illegal states unrepresentable.** Use discriminated unions, Zod schemas, and exhaustive `switch` checks.
5. **Small diffs, verified.** Make the smallest change that solves the task. Run typecheck, lint, and tests before declaring done.
6. **Accessibility and performance are not optional.** They are part of "done".
7. **Match the codebase.** Read 2–3 neighbouring files first. Follow existing conventions unless they violate this file.

---

---

## 1. Project structure (feature-first)

```
src/
  app/                    # bootstrap: providers, router, query client, error boundaries
  routes/                 # TanStack Router file-based routes (thin: wiring only)
  features/
    <feature>/
      api/                # query options, mutations, DTO types, zod schemas
      components/         # feature-specific UI
      hooks/
      config/             # feature config (columns, forms, permissions)
      index.ts            # public API (only import from here across features)
  components/
    ui/                   # shadcn primitives (generated, lightly customised)
    patterns/             # reusable composed components (DataTable, PageHeader, FormField...)
    layout/               # AppShell, Sidebar, Topbar, PageContainer
  portal/                 # portal engine: config schema, registry, resolvers, renderers
  lib/                    # utils (cn, formatters), api client, auth helpers
  styles/                 # tailwind entry + theme tokens
  test/                   # test utils, MSW handlers, factories
```

Rules:
- Routes are **thin**. A route file defines path, loader, search schema, and renders a feature component. No business logic in routes.
- Features never import from other features' internals. Cross-feature use goes through `index.ts`. Shared code is promoted to `components/`, `lib/`, or `portal/`.
- No circular imports. No barrel files inside `components/ui` (they break tree shaking and slow HMR).
- Path alias `@/` maps to `src/`. No deep relative imports (`../../../`).

---

---

## 19. Definition of done (agent checklist)

Before you report a task complete, verify every item:

- [ ] Types are strict; no `any`; external data validated with Zod.
- [ ] Reused an existing primitive/pattern where one exists; no duplicated component.
- [ ] Only semantic Tailwind tokens; responsive; dark mode and theme work.
- [ ] Loading, empty, and error states implemented; error boundary and Suspense in place.
- [ ] URL owns shareable state; loader prefetches; server data is in Query, not `useState`.
- [ ] Permissions enforced in route guard, menu, and UI; 403 handled.
- [ ] Keyboard navigable, labelled, focus visible, contrast OK.
- [ ] Config-driven pieces use registries and validated schemas; unknown/invalid config degrades safely.
- [ ] Tests added or updated; `typecheck`, `lint`, `test`, and `build` all pass.
- [ ] No secrets, tokens, or PII in code or logs; no `dangerouslySetInnerHTML`, `eval`, or `console.log`.

---

## 20. Never do this

- Never fetch in `useEffect`; never store server data in `useState`/global stores.
- Never hand-edit generated files (`routeTree.gen.ts`) or fork `components/ui/*` for a one-off.
- Never hardcode colours, menu items, roles, or URLs inside components.
- Never build your own modal, dropdown, tooltip, date picker, or focus trap.
- Never put functions or JSX inside config JSON.
- Never ship a page without title, error, and not-found handling.
- Never add a dependency without checking whether the current stack already covers it, and state why in the PR.
