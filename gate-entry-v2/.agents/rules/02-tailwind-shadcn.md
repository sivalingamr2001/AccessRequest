# Tailwind v4 and shadcn/ui rules

## 4. Tailwind CSS v4

- **CSS-first config.** Design tokens live in `@theme` inside the main CSS file. Do not create a `tailwind.config.js` unless the repo already has one.
- Colours, radii, spacing, fonts, and shadows come from **semantic tokens** (`bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`), never raw palette values (`bg-blue-500`) or arbitrary hex in components.
- Dark mode and multi-brand theming are done by swapping CSS variables on a root attribute (`[data-theme="..."]`, `.dark`). Components never contain `dark:` colour logic when a token can do it.
- Use `cn()` (`clsx` + `tailwind-merge`) for every conditional or overridable class string. The consumer's `className` always goes **last**.
- Use **`cva`** (class-variance-authority) or `tv` for components with variants. No ternary chains building class strings.
- Mobile-first: base styles are mobile, then `sm:`, `md:`, `lg:`. Prefer **container queries** (`@container`, `@md:`) for reusable components, so they adapt to their slot, not the viewport.
- Use `gap`, `grid`, and `flex` for spacing. Avoid margins on reusable components (the parent owns spacing). Use `size-*` when width equals height.
- No inline `style` except for truly dynamic values (pass them via CSS variables: `style={{ '--progress': value }}`).
- No `@apply` except in the base layer for third-party markup you cannot control.
- Avoid arbitrary values (`w-[137px]`). If you need one twice, add a token.
- Respect `prefers-reduced-motion`. Motion answers a user action; do not add decorative entrance animations everywhere.

---

---

## 5. shadcn/ui

- shadcn is **source code you own**, not a dependency. Add components via the CLI (`npx shadcn@latest add <name>`), then commit them.
- **Never edit `components/ui/*` for one-off needs.** Wrap them in `components/patterns/*` or a feature component. Edit the primitive only for a change that should apply everywhere (e.g., global radius, focus ring, new variant).
- Keep the primitive API intact so upstream updates can be diffed and merged.
- Use the `asChild` / slot pattern (or the equivalent in the chosen primitive library) for polymorphism, for example, a `Button` rendering a router `Link`.
- Compose, don't configure via mega-props. Prefer `<Card><CardHeader/>…</Card>` slots over `<Card headerTitle=… footerActions=…/>`.
- Forms: use the shadcn `Field`/`Form` building blocks wired to **TanStack Form**. Every input needs a label, description (if needed), and an error slot with `aria-describedby`.
- Use `Dialog`, `Sheet`, `Popover`, `Command`, `Tooltip` from the library. Never build custom modals, focus traps, or dropdowns.
- Icons: one icon library (lucide-react). Icon-only buttons must have an `aria-label`.
- Toasts: one system (Sonner). Feedback wording is consistent, and the toast text matches the button verb ("Save changes" → "Changes saved").

---
