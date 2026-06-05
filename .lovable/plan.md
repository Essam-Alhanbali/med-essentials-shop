## Overview

Five new features added across storefront + admin. All data lives in Firestore (consistent with current architecture). The TanStack Router route-tree auto-regenerates from new files in `src/routes/`.

---

### 1. Size Selector (Apparel)

**Schema (per product)**
```ts
sizes?: { label: string; stock: number; priceDelta?: number }[]
```

**Admin** (`admin.products.tsx`): new `SizesEditor` component (rows of label / stock / priceDelta) added to create + edit forms.

**Product page** (`product.$id.tsx`):
- If `sizes?.length`, render pill buttons (not dropdown). Zero-stock = greyed + strikethrough + disabled. Selected = filled red accent.
- "Add to cart" disabled until size selected; hint "Select a size".
- Price reflects `base + priceDelta`.

**Cart**:
- `CartContext` items keyed by `productId + size`. Item shape: `{ productId, size?, quantity }`. `add(productId, qty, size?)`, `setQty/remove` accept `(productId, size?)`. `detailed` includes effective unit price and chosen size; displayed in cart row.

### 2. Product Comparison

- New `CompareContext` (localStorage, up to 3 ids). `useCompare()` exposes `ids, toggle, remove, clear`.
- `ProductCard`: add Compare checkbox (top-left under badge area).
- Sticky bottom bar component `CompareBar` shown when ≥1 selected; "Compare Now" links to `/compare`.
- New route `src/routes/compare.tsx`: horizontally-scrollable table with image / name+category / price / rating / stock / Add-to-Cart per column. Per-column remove button. Empty-state CTA back to /shop.

### 3. Reviews & Ratings

**Firestore**: `reviews` collection — `{ productId, rating(1-5), comment, name, approved: boolean, createdAt }`.

**Product page**: "Student Reviews" section — avg stars + count, list of approved reviews (newest first, paginate 5/page "Load more"), review form (star picker, comment ≥20 chars, name). Submits with `approved: false`.

**Admin**: new route `admin.reviews.tsx` — table of all reviews with Approve / Delete. Pending count badge on the Reviews nav item in `AdminLayout`.

Names shown as "FirstName L." (last-initial truncation).

### 4. "Recommended for Your Year" Filter

**Product schema**: `years?: string[]` ("Year 1"…"Year 6", "All Years").

**Admin** (`admin.products.tsx`): multi-select pill toggles for years on create + edit.

**Shop** (`shop.tsx`):
- Year pill filter in sidebar (All, Year 1–6). Combines AND with category. Synced into `validateSearch` (`year`).
- Reads localStorage key `medclub.studentYear` on mount; if set, pre-applies year filter and shows "Showing for Year 3 · Change" chip at top (Change clears stored year).

**Homepage** (`index.tsx`): "Shopping for Year __?" prompt card → year pills → saves to localStorage, links to `/shop?year=...`. Hidden once set.

### 5. Order Tracker

**Schema**: orders already have `status` + `id`. Add an `orderNumber` field on create: `MC-` + sequential 4-digit (computed client-side from random 1000-9999; collisions acceptable for now) stored on the doc.

**Checkout**: after successful order, show inline confirmation panel (not just toast) with order number and link to `/track?order=MC-XXXX`. (Replaces the previous toast-only flow inside `CheckoutDialog`.)

**New route `/track`** (`src/routes/track.tsx`):
- Input + lookup (queries `orders` where `orderNumber == input`).
- Stepper: Order Placed → Being Prepared → Ready for Pickup → Collected. Map existing statuses: Pending/Confirmed → Placed; "Ready for Pickup" → Ready; Completed → Collected; etc.
- Order summary: items, total, pickup location "Student Union, Room 204", est. ready date (if `readyDate` field set).

**Admin orders** (`admin.orders.tsx`):
- Replace status dropdown options with the 4 canonical stages (keep Pending + Cancelled as existing). Actually: extend `ORDER_STATUSES` with the 4-stage set already largely present (`Pending`, `Confirmed`, `Ready for Pickup`, `Completed`).
- Status filter pills at top.
- When status becomes "Ready for Pickup" → placeholder notice "WhatsApp/email notification (coming soon)".
- Show `orderNumber` column.

---

### Files to create
- `src/context/CompareContext.tsx`
- `src/components/site/CompareBar.tsx`
- `src/routes/compare.tsx`
- `src/routes/track.tsx`
- `src/routes/admin.reviews.tsx`

### Files to edit
- `src/context/CartContext.tsx` — size-aware items
- `src/context/StoreContext.tsx` — load `sizes`, `years` on products
- `src/routes/__root.tsx` — mount `CompareProvider` + `<CompareBar/>`
- `src/routes/admin.products.tsx` — sizes editor + year multi-select
- `src/routes/product.$id.tsx` — size selector + reviews section
- `src/routes/shop.tsx` — year filter sidebar, year search param, persisted year banner
- `src/routes/index.tsx` — "Shopping for Year __?" prompt
- `src/routes/cart.tsx` — show chosen size; pass size through; include orderNumber in created order; show confirmation
- `src/routes/admin.orders.tsx` — orderNumber column, status filter, ready-for-pickup notice
- `src/components/admin/AdminLayout.tsx` — add Reviews nav with pending badge
- `src/components/site/ProductCard.tsx` — Compare checkbox

No DB migrations required (Firestore is schemaless).

### Notes / Limits
- Sizes are independent of category; admin can use them for any product but they only render when defined (apparel is convention, not enforcement).
- Reviews moderation: hidden until `approved=true`.
- Comparison limited to 3 products.
- Order number uniqueness is best-effort (not enforced server-side).
