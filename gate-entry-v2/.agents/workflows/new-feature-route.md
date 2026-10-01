# /new-feature-route

Add a new route and feature module. Ask me for the path, feature name, and required permission if not given.

1. Read `.agents/rules/03-routing-data-forms.md`.
2. Create `src/features/<feature>/` with `api/`, `components/`, `config/`, and `index.ts`.
3. Define query keys and `queryOptions` factories with Zod-validated fetchers.
4. Create the thin route file: `validateSearch` (Zod, with defaults), loader using `ensureQueryData`, `beforeLoad` permission guard, pending, error, and not-found components, and page title.
5. Add the menu entry to the menu config with its permission. Do not hardcode it in the shell.
6. Build the UI from existing shadcn primitives and `components/patterns/*`. If a pattern is missing, propose it before creating it.
7. Run typecheck, lint, tests. Verify the page in the browser at mobile and desktop widths.
