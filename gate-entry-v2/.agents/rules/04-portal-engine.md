# Portal engine: dynamic and configurable rules

## 10. Portal engine: dynamic, configurable, reusable

This is the core of a configurable portal. Treat it like a small framework.

### 10.1 Config is data, validated, and versioned

```ts
const pageConfigSchema = z.object({
  id: z.string(),
  version: z.number().int(),
  title: z.string(),
  permission: z.string().optional(),
  layout: z.enum(['single', 'two-column', 'dashboard']),
  widgets: z.array(widgetConfigSchema),
})
```

- All portal, menu, page, widget, form, and table configs have a **Zod schema** and a `version`. Invalid config **fails loudly in dev** and degrades safely in prod (skip the widget, render an error placeholder, report to monitoring). Never crash the whole portal for one bad widget.
- Config is **serialisable JSON**. No functions, JSX, or class instances in config. Behaviour is referenced **by name** through registries.
- Support config from three sources with one interface: local defaults (typed TS), remote (API), and per-tenant overrides. Merge order is explicit and tested.

### 10.2 Registries (name → implementation)

```ts
export const widgetRegistry = {
  'kpi-card':   { component: lazy(() => import('./kpi-card')),   schema: kpiSchema },
  'data-table': { component: lazy(() => import('./data-table')), schema: tableSchema },
  'chart':      { component: lazy(() => import('./chart')),      schema: chartSchema },
} satisfies Record<string, WidgetDefinition<any>>
```

- Widgets, field types, cell renderers, actions, icons, and data sources each have a **typed registry**. Adding a capability = register one entry. Unknown type → safe fallback + log.
- Each widget receives `{ config, context }` where `context` carries portal id, user, permissions, and route params. Widgets fetch their own data through Query using a **data-source name + params** from config, not arbitrary URLs.
- Widgets are **self-contained**: own loading, empty, and error states, wrapped in their own error boundary and Suspense.

### 10.3 Navigation and shell

- Sidebar, topbar, breadcrumbs, and command palette are **generated from one menu config**, filtered by permissions. One source of truth.
- The shell (`AppShell`) is layout-only. It knows nothing about specific features.
- Active state comes from the router (`Link` `activeProps`), never from manual string comparison.

### 10.4 Permissions

- Permission checks use a single API: `can(user, 'orders:approve')` and a `<Can permission="…">` component. Applied in **three places**: route `beforeLoad`, menu filtering, and UI element visibility. UI hiding is convenience only. The **server is the authority**, and the frontend must handle 403 gracefully.
- Never scatter role-name string comparisons (`user.role === 'admin'`) through components.

### 10.5 Theming and branding

- Per-portal branding (logo, colours, density, radius) is applied through CSS variables from config at the root. No per-portal forks of components.
- Density (`compact`/`comfortable`) is a token set, not conditional class logic in every component.

### 10.6 Reusability checklist for any new component

Before creating a component, answer:
1. Does a shadcn primitive or an existing pattern already do this? → Use or extend it.
2. Is it used in 2+ places, or is it clearly a pattern (table, page header, filter bar, empty state)? → Put it in `components/patterns/`. Otherwise keep it in the feature, and do not prematurely abstract.
3. Is its API **small, typed, and composable** (slots via `children`, variants via `cva`, `className` passthrough, polymorphism via `asChild`)?
4. Is it controlled/uncontrolled-friendly where relevant (`value`/`defaultValue`/`onValueChange`)?
5. Does it own its loading/empty/error states and is it accessible by default?
6. Does it have a Storybook story or a test covering its variants?

Rule of three: abstract on the third repetition, not the first.

---

---

## 11. State management

Order of preference:
1. **URL** (router search params) — anything shareable/bookmarkable.
2. **Server cache** (TanStack Query) — anything from the backend.
3. **Form state** (TanStack Form).
4. **Local** `useState` / `useReducer` — ephemeral UI.
5. **Context** — stable, low-frequency values only (theme, auth, portal config). Split contexts, and never put fast-changing data in them.
6. **Small global store** (Zustand) — only for cross-tree client state that fits none of the above (e.g., layout preferences, draft/offline queue). Use selectors. No global store for server data.

---
