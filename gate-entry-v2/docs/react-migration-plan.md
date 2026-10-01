# React Migration Plan

This plan outlines the architecture of the new modern React application that will replace the legacy VB.NET desktop interface.

## 1. Suggested React Routing Layout
- `/login`: Secure role selector screen (replaces `Login.vb`).
- `/dashboard`: Main gate dashboard registry with custom filters (replaces `Gate.vb`).
- `/gate-entry/new`: Inward gate entry creation form (replaces `Add.vb`).
- `/gate-entry/edit/:gateNo`: Inward gate entry modifier.
- `/gate-validation`: Supervisor approval list (replaces `Validate.vb`).
- `/adi-download`: Advance Shipping Notice processing page (replaces `adi.vb`).
- `/fifo-labels`: Label generator and printer settings (replaces `fifo_sticker.vb`).

## 2. Reusable Shared UI Components
- **`Layout`**: Navigation sidebar and responsive header containing current operator profile and database health indicators.
- **`DataGrid`**: Interactive table component supporting client-side searching, server-side pagination, row check selectors, and PDF/Excel export hooks.
- **`ZplPrinterConfig`**: Printer mapping form allowing operators to select local IP addresses or raw socket printing clients (like QZ Tray).

## 3. State Management Suggestion
- **Redux Toolkit**: To manage global state like active operator token, role permissions, active filters, and printer configs.
- **RTK Query**: For backend REST API queries (caching, polling status, and mutation updates).

## 4. Screen-by-Screen Migration Checklist
- [ ] Implement role-based login routing with mock tokens.
- [ ] Build `/dashboard` grid using TanStack Table (React Table).
- [ ] Connect dashboard search filters to `/api/gate-entries`.
- [ ] Build `/gate-entry/new` form using Formik and Yup for validation.
- [ ] Implement cross-database ASN download flow on `/adi-download`.
- [ ] Integrate local printing using QZ Tray API or direct socket connectivity (replaces local `Shell` execution).