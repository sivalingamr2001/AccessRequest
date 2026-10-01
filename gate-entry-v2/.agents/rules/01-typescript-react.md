# TypeScript and React 19 rules

## 2. TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **No `any`.** Use `unknown` and narrow. `as` casts require a comment explaining why. Prefer `satisfies` for config objects to keep literal types and check shape.
- Derive types from schemas: `type X = z.infer<typeof xSchema>`. Do not hand-write types that duplicate a schema.
- Discriminated unions for variants (`{ type: 'table' } | { type: 'chart' }`), with an `assertNever` in the default branch.
- Prefer `type` for unions and `interface` for extensible object contracts. Name props `ComponentNameProps`.
- Validate **all** external data (API responses, URL params, config JSON, localStorage) with Zod at the boundary. Trust nothing after that boundary.
- No enums. Use `as const` objects or string-literal unions.

---

---

## 3. React 19 rules

- Function components only. Named exports (no default exports, except where a route/lazy loader requires it).
- Do not add `useMemo` / `useCallback` / `React.memo` by default. Enable **React Compiler** if the project has it. Add manual memoisation only after measuring, with a comment.
- `useEffect` is a last resort. Do **not** use it to fetch data, derive state, sync props to state, or respond to events. Use TanStack Query, computed values during render, and event handlers instead. Effects are for syncing with external systems (DOM APIs, subscriptions, timers).
- `ref` is a regular prop in React 19. Do not use `forwardRef` in new code.
- Use `use()`, `Suspense`, and `useTransition` / `useDeferredValue` for async UI and non-urgent updates. Use `useOptimistic` only when it is simpler than TanStack Query's optimistic updates. Do not mix both for the same mutation.
- Keys are stable IDs, never array indexes for dynamic lists.
- Every subtree that can fail or suspend has an **error boundary** and a **Suspense fallback** (skeleton, not spinner, for layout-shaped content).
- Never mutate props or state. Never call hooks conditionally.

---
