# TanStack Router, Query, Table, Form rules

## 6. TanStack Router (routing)

- **File-based routing** with generated route tree. Never hand-edit `routeTree.gen.ts`.
- Routes are **type-safe**. Use `Link`, `useNavigate`, and `route.useParams()` / `useSearch()`. No string concatenation for URLs and no `window.location` for in-app navigation.
- **Search params are state.** Filters, sorting, pagination, tabs, selected IDs, and dialog-open flags live in the URL, validated by `validateSearch` with a Zod schema (with defaults). Pages must be shareable and refresh-safe.
- **Loaders prefetch, Query owns the cache.** In loaders call `queryClient.ensureQueryData(xQueryOptions(...))`. In components use `useSuspenseQuery(xQueryOptions(...))`. Never duplicate the fetch logic.
- Use `beforeLoad` for **auth and permission guards** and redirects (`throw redirect({ to: '/login', search: { redirect: location.href } })`). Guards are never done in components.
- Context: put `queryClient`, `auth`, and `portalConfig` in router context (typed), not in module-level singletons.
- Every route defines: `pendingComponent`, `errorComponent`, `notFoundComponent` (inherit from root when possible), and `head`/title metadata.
- **Code-split by route** (automatic with file-based routing). Lazy-load heavy widgets (charts, editors, PDF viewers) with `React.lazy`. Preload on intent (`defaultPreload: 'intent'`).
- Breadcrumbs, page titles, and required permissions come from **route `staticData`** or `loaderData`, not from scattered component code.

### Dynamic / config-driven routes

- Portal pages that are defined by configuration use a **small number of generic routes** (e.g., `/p/$portalId/$pageId`) whose loader resolves the page config, checks permissions, and renders through the **widget registry** (see §10).
- Static, feature-rich pages (dashboards with unique logic) remain real file routes. Do not force everything through config.
- Unknown `pageId` → `notFound()`. Unauthorised → `redirect`/403 route. Never render a blank screen.

---

---

## 7. TanStack Query (server state)

- **One place for keys and fetchers per feature**, via **query options factories**:
  ```ts
  export const orderKeys = {
    all: ['orders'] as const,
    list: (f: OrderFilters) => [...orderKeys.all, 'list', f] as const,
    detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
  }
  export const ordersQueryOptions = (f: OrderFilters) =>
    queryOptions({ queryKey: orderKeys.list(f), queryFn: ({ signal }) => api.orders.list(f, signal) })
  ```
- Always pass `signal` to the fetcher. Always validate responses with Zod inside the fetcher.
- Query keys contain **every** variable the query depends on. No stale closures.
- Do not copy query data into `useState`. Derive with `select`.
- **Mutations** invalidate the narrowest correct key (`orderKeys.all` or a specific list), never `queryClient.invalidateQueries()` globally. Optimistic updates must snapshot and roll back in `onError`, and reconcile in `onSettled`.
- Set sensible defaults at the client level (`staleTime`, `gcTime`, retry policy that does not retry 4xx). Per-query overrides are documented.
- Use `placeholderData: keepPreviousData` for paginated tables to avoid flicker.
- Global error handling (401 → sign-out/redirect, 5xx → toast) is centralised in the API client / QueryCache, not repeated in components.
- Offline-capable portals: use `persistQueryClient` with an explicit allow-list of persisted keys and a cache-buster version. Never persist sensitive data unencrypted.

---

---

## 8. TanStack Table (data grids)

- One reusable `DataTable<TData>` pattern component. Features do not build their own tables from scratch.
- Columns are defined **declaratively** (`ColumnDef<TData>[]`) in the feature's `config/`, and can be generated from portal config for dynamic tables.
- **Server-side** pagination, sorting, and filtering for anything that can exceed a few hundred rows: `manualPagination`, `manualSorting`, `manualFiltering`. Table state is synced with **URL search params**.
- Virtualise (`@tanstack/react-virtual`) beyond ~200 visible rows.
- Provide: loading skeleton, empty state (with a next action), error state with retry, row selection, column visibility, and keyboard-accessible sorting.
- Stable `getRowId`. Memoise column definitions outside the component or with a stable reference.
- Cell renderers come from a **cell registry** (`currency`, `date`, `status-badge`, `link`, `actions`), so config can refer to them by name.

---

---

## 9. TanStack Form + Zod (forms)

- One Zod schema per form is the single source of truth for validation and types. Server error responses are mapped back onto fields.
- Build reusable field components with `createFormHook` / `withForm` so features write `<form.AppField name="email">{(f) => <f.TextField label="Email" />}</form.AppField>`, not raw inputs.
- Validate on blur and on submit by default. Async validation is debounced.
- Disable the submit button only while submitting, never for "invalid" (show errors instead). Focus the first invalid field on failed submit.
- Preserve unsaved input on navigation with a blocker (`useBlocker`) where data loss matters.
- Dynamic/config-driven forms: generate fields from a **form config** (see §10). Field types map to registered field components. Conditional visibility and validation rules are expressed as data (`visibleWhen`, `requiredWhen`), never as `eval` or `new Function`.

---
