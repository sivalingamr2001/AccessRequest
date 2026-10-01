# /new-widget

Add a new portal widget. Ask me for the widget name and purpose if not given.

1. Read `.agents/rules/04-portal-engine.md` and one existing widget in `src/portal/widgets/` to match conventions.
2. Create the Zod config schema for the widget (serialisable, versioned, no functions or JSX).
3. Create the component. It owns its loading, empty, and error states and receives `{ config, context }`.
4. Fetch data through a Query options factory using a named data source from config, never a raw URL.
5. Register it in the widget registry with `lazy()` and its schema.
6. Add tests: valid config renders, invalid config degrades safely, empty and error states.
7. Run typecheck, lint, tests. Fix failures before continuing.
8. Start the dev server, open the page with a sample config in the browser, and capture a screenshot as evidence.
9. Report what changed in under 10 lines.
