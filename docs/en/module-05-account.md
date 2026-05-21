# Module 05 — User Account (Cab)

> To be loaded alongside `main.md`. Depends on Modules 00, 02, 03.

---

## What We Build
1. Dashboard page `/account` with two main sections:
   - **Profile Tab** — personal data + list of saved delivery addresses.
   - **Orders Tab** — user order history.
2. Order details page `/account/orders/:id` detailing items, pricing, delivery tracking, and status.

---

## Files Created

### Components
- `src/features/account/components/AccountNav.jsx`
- `src/features/account/components/ProfileTab.jsx`
- `src/features/account/components/OrdersTab.jsx`
- `src/features/account/components/AddressList.jsx`
- `src/features/account/components/AddressFormModal.jsx`

### Pages
- `src/features/account/pages/AccountPage.jsx` (replace placeholder)
- `src/features/account/pages/OrderDetailsPage.jsx` (replace placeholder)

### Hooks
- `src/features/account/hooks/useUserOrders.js`
- `src/features/account/hooks/useUserAddresses.js`

---

## Implementation Details

### AccountPage (`/account`)

**Guards:**
- Protected via `ProtectedRoute` (Module 02). If unauthenticated → redirects to `/login`.

**Layout:**
- Centered grid with layout structure: sidebar on the left `AccountNav` (Profile / Orders switcher), main content panel on the right rendering the active tab.

---

### ProfileTab

**1. Personal Info Form:**
- Name (editable).
- Phone (editable).
- Email (readonly).
- "Save changes" button. Updates document in `/users/{uid}`. Show toast "Changes saved successfully". Validation rules same as registration.

**2. Delivery Addresses Section:**
- Block list populated from `/users/{uid}/addresses/*`.
- Address Cards: displays City, Street Address, Postal Code. Marks one card with a green label as "Default".
- Buttons inside each card: "Delete" + "Edit" + "Set as Default".
- "Add New Address" button → opens `AddressFormModal`.

**`AddressFormModal` Form Fields:**
- City *, Street Address *, Postal Code *.
- Optional Checkbox: "Set as default address".
- On submit: adds document to the subcollection of users or updates an existing address if editing. Clears form, closes and displays a success toast.

---

### OrdersTab
- Lists all user orders. Query: `query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))`.
- Table layout or vertical list of summary order cards.
- Displays:
  - Reference Number (first 8 characters of ID).
  - Creation Date (`formatDate` helper).
  - Total Sum.
  - Current Status (represented as active styled colored badges):
    - `new` — Blue outline
    - `confirmed` — Solid Dark Blue
    - `in_transit` — Orange
    - `delivered` — Green
    - `cancelled` — Red
- "Details" button in each row → redirects client to `/account/orders/:id`.
- Empty state: `<EmptyState>` with "No orders placed yet" + button "To Shop" → `/shop`.

---

### OrderDetailsPage (`/account/orders/:id`)

**Guards:**
- Strictly checks if `order.userId === user.uid` or `role === 'admin'`. Otherwise, shows "Access Denied" or redirects home.

**Layout:**
- "Back to Account" breadcrumb link.
- **Top Block:** order summary (Date, status badge, payment totals, delivery option details).
- **History Tracker:** horizontal progress trail showing order states. Dot sequence: `New` → `Confirmed` → `In Transit` → `Delivered`. Highlighting matches the active progress; if status is `cancelled`, the timeline lights up red with the admin's cancellation reason displayed clearly below.
- **Order items:** list of products, showing product name, photo thumbnail, quantities, unit pricing, and line totals.
- **Recipient contact details:** name, email, phone number.

---

## Ready Criteria
See the `Module 05 — User Account` section in `progress.md`.
