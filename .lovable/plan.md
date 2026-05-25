# Admin Panel Restructure + Frontend Overhaul

A large change. Splitting into clear groups so we can track progress.

## 1. Admin layout (sidebar shell)

- Convert `src/routes/admin.index.tsx` into a layout route `src/routes/admin.tsx` that renders a persistent sidebar + `<Outlet/>`, gated by auth (redirect to `/admin/login`).
- Move existing admin content out of `admin.index.tsx`; new `admin.index.tsx` becomes the **Dashboard** page.
- New admin sub-routes (flat dot notation):
  - `admin.index.tsx` — Dashboard
  - `admin.orders.tsx` — Orders
  - `admin.products.tsx` — Products
  - `admin.categories.tsx` — Categories
  - `admin.homepage.tsx` — Homepage editor
  - `admin.about.tsx` — About editor
  - `admin.images.tsx` — Site images (logo + hero)
  - `admin.footer.tsx` — Footer editor
  - `admin.partners.tsx` — Partners
- Sidebar uses `Sidebar` shadcn component with `collapsible="icon"`, active route highlighting.

## 2. Firestore data model additions

- `categories/{id}` gains `emoji`, `imageUrl`, `subcategories[]` (already exists).
- `content/home` doc: `{ heroHeadline, heroSubheadline, heroImageUrl, stats: [{label, value}] }`.
- `content/about` doc: extend with `phone`, `stats: [{label,value}]`, `imageUrl`; remove address/hours from frontend display.
- `content/footer` doc: extend with `shopCategoryIds: string[]`.
- `content/site` doc: `{ logoUrl, heroImageUrl }` (global images).
- `partners/{id}`: `{ name, logoUrl, websiteUrl }`.
- `orders/{id}`: `{ fullName, email, phone, academicYear, address, notes, items:[{productId,name,price,quantity}], total, status, createdAt }`.

## 3. Dashboard page

- 3 stat cards: total orders count, pending count, completed revenue sum (JOD).
- Recent 5 orders preview table, link to `/admin/orders`.

## 4. Orders page

- onSnapshot `orders` ordered by `createdAt` desc.
- Row expandable to show items + notes + full contact.
- Status `<Select>` with 6 options, color-coded badges (yellow/blue/purple/orange/green/red).
- updateDoc on status change.

## 5. Products page

- Existing product CRUD lifted out, kept as-is plus the subcategory dropdown driven by selected category's `subcategories`.
- Image: URL text input OR upload button (uses `uploadImageFile`). Last-saved wins.

## 6. Categories page

- Full CRUD. Emoji grid picker from fixed set (defaults 📦).
- Image URL + upload.
- Subcategories add/remove chips.
- No locking — seed fallback in StoreContext stays for storefront, but admin lists Firestore docs and can seed defaults on first visit.

## 7. Homepage editor

- Hero headline/subheadline/image (URL + upload).
- Stats list editor (add/edit/delete/reorder via up/down buttons).
- Frontend `routes/index.tsx` reads from `content/home`.

## 8. About editor + frontend cleanup

- Fields: heading, intro, body, email, phone, image, stats list.
- Frontend `routes/about.tsx`: remove address & hours blocks, show email + phone (Phone icon from lucide), render stats and partners.

## 9. Images page

- `content/site` doc with `logoUrl` and `heroImageUrl`; each has URL input + upload.
- Navbar/Footer logo reads `logoUrl`, falls back to `+` icon.
- Homepage hero uses `heroImageUrl` if set.

## 10. Footer editor + frontend

- Tagline, email, address, copyright (`{year}` placeholder), bottomRight, `shopCategoryIds[]` checkbox list.
- Footer renders selected categories (max 5) as Shop column links; fallback all categories.
- Copyright replaces `{year}` with current year.

## 11. Partners page + frontend sections

- CRUD list (name, logoUrl, websiteUrl).
- Homepage: "Sponsored By" section above footer.
- About: "Partners" section at bottom.

## 12. Frontend changes

- **Seed products removed**: empty `products: []` in `src/data/products.ts`; `StoreContext` keeps only Firestore products.
- **Currency**: update `formatPrice` to `JOD X.XXX` (3 decimals).
- **Checkout**: convert `/cart` flow — add `routes/checkout.tsx` form (name/email/phone/year/address/notes + order summary + Place Order). On submit, addDoc to `orders`, clear cart, redirect to `/order/$id`.
- **Order confirmation**: `routes/order.$id.tsx` reads the order from Firestore and shows summary.
- **Category icons**: `CategoryDoc` gains `emoji`; ProductCard badge area + shop filter bar + homepage grid all show emoji (fallback 📦).

## Technical notes

- All admin pages share a tiny gate that listens to `onAuthStateChanged` and redirects if logged out.
- Re-use `uploadImageFile` helper for all uploads.
- Recharts not needed; stat cards are plain components.
- Order status badge variants implemented as a small `getStatusStyles(status)` helper returning Tailwind classes against design tokens (no raw hex).
- No migrations needed (Firestore).
- Firestore security rules already permit authenticated writes — no rule changes required.

## Out of scope / explicit non-goals

- No payment integration; Place Order just records the order.
- No email/SMS notifications.
- No role system beyond "signed-in admin".
