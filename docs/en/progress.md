# Komora — Development Progress

> Update after each session. Mark `[x]` only after testing inside AI Studio Preview.
> Each module has two sections: **Implementation** (what to build) and **Verification** (what to click manually).

---

## Preparation (performed by the user)
- [ ] Firebase project created in Firebase Console
- [ ] Authentication activated (Email/Password + Google)
- [ ] Firestore Database activated
- [ ] Storage activated
- [ ] Copied `firebaseConfig`
- [ ] Brevo account created, API key retrieved
- [ ] Brevo confirmation and welcome templates created (double opt-in)
- [ ] 5 transactional templates created for order statuses (new → confirmed → in_transit → delivered, cancelled)
- [ ] Brevo subscribers list created
- [ ] Filled `.env.local` with all retrieved keys

---

## Module 00 — Initialization

### Implementation
- [x] React + Vite initialized, Tailwind connected
- [x] Folder structure `features/` + `shared/` created
- [x] `shared/lib/firebase.js` works (auth, db, storage exported)
- [x] `shared/lib/brevo.js` contains `subscribe`, `confirmSubscription`, `sendTransactional`, `sendCampaign` functions
- [x] `AuthContext` listens to `onAuthStateChanged`, loads roles
- [x] `CartContext` persisted in `localStorage`
- [x] `ToastContext` + `useToast` are operational
- [x] `ProtectedRoute` redirects according to roles
- [x] `AppRouter` contains all routes from `main.md` as placeholder pages
- [x] Security Rules from `main.md` deployed to Firestore and Storage
- [x] First admin manually created (Firestore Console: users/{uid}.role = 'admin')

### Verification
- [x] Navigating to any public routes from `main.md` renders placeholders
- [x] `/account` redirects to `/login` if not logged in
- [x] `/admin` redirects to `/` if not possessing reference `role: 'admin'`
- [x] First admin successfully accesses `/admin`
- [x] Toast functions: call `showToast` from anywhere → toast appears and vanishes in 3 seconds
- [x] Cart preserves test items in `localStorage` across reloads

---

## Module 01 — Landing + Newsletter

### Implementation
- [x] Hero pulls `/settings/landing.hero` from Firestore
- [x] "About us" section pulls `/settings/landing.about`
- [x] "Our Products" — 4 cards with `featured: true` from `/products`
- [x] "Recipes" — 3 cards with `featured: true` from `/articles`
- [x] Newsletter form saves subscriber with `pending` status
- [x] Brevo sends confirmation email
- [x] `/subscription-confirmed` updates status to `confirmed`
- [x] Footer with navigation

### Verification
- [x] Create document `/settings/landing` with template data → Hero/About us render correctly
- [x] Mark product `featured: true` in Firestore → appeared on the landing page
- [x] Newsletter end-to-end: enter email → confirmation email received → click link → `/subscription-confirmed` shows success → Firestore status becomes `confirmed` → welcome email received
- [x] Attempting to subscribe again with the same email → toast "You are already subscribed"
- [x] Attempting to subscribe with an email in `pending` status → toast "Confirmation email has already been sent"

---

## Module 02 — Auth

### Implementation
- [x] Login: Email/Password + Google
- [x] Register: creates `/users/{uid}` with `role: 'user'`
- [x] Redirection after login to `state.from` or `/`
- [x] Errors display below form (no alerts)

### Verification
- [x] Register with a new email → `/users/{uid}` created with `role: 'user'`
- [x] Logout → login again → works
- [x] Login with Google for the first time → user document created in `/users`
- [x] Incorrect password → error text appears below form (no alert)
- [x] Registering with invalid data → submit disabled, errors show below fields
- [x] Navigation to `/account` without logging in → redirects to `/login` with `state.from` = `/account`
- [x] Logging in → redirected back to `/account`

---

## Module 03 — Shop

### Implementation
- [x] `/shop` — category and tag filters, sorting
- [x] Skeleton loader, empty states
- [x] Product card with "Added" micro-interaction
- [x] `/shop/:id` — gallery, linked articles
- [x] `/cart` — update quantity, remove, persist
- [x] `/checkout` — Delivery/Pickup, validation
- [x] Order saved in Firestore with status `new`
- [x] Brevo sends confirmation to client
- [x] `/order/:id` — confirmation page
- [x] Cart clears after order creation

### Verification
- [x] Add item to cart → Navbar counter updates +1, toast appears
- [x] Reload page → cart state persists
- [x] Category and tag filtering — state inside URL, back-navigation functional
- [x] Incompatible filter (empty result) → empty state page shown
- [x] Product with `inStock: false` → "Add to cart" button disabled
- [x] Product page — gallery switches by clicking thumbnails
- [x] Checkout without login → redirects to `/login`
- [x] Checkout with empty cart → redirects to `/shop`
- [x] Submitting checkout with empty required fields → red borders and error messages appear
- [x] Placing an order → `/orders/{id}` created with status `new`, email sent, cart cleared, redirect to `/order/:id`
- [x] Accessing someone else's `/order/:id` → Access Denied

---

## Module 04 — Blog

### Implementation
- [x] `/blog` — tag filtering, card list, skeleton loaders
- [x] `/blog/:id` — rich text rendering
- [x] Embedded product cards within article body are functional
- [x] "Other recipes" block — 3 similar articles based on shared tags

### Verification
> Fully tested after Module 07. At this stage — create a document in `/articles` manually via Firestore Console with a body like:
> ```html
> <h2>Test</h2><p>Recipe text.</p><product-mention data-product-id="EXISTING_PRODUCT_ID"></product-mention><p>End.</p>
> ```
> and check the first three items. Check the rest after Module 07.

- [x] `/blog` — list renders, tag filtering works
- [x] `/blog/:id` — article renders, `<product-mention>` replaced with `InlineProductCard`
- [x] Draft article (`published: false`) is excluded from list and inaccessible via direct URL
- [x] (after Module 07) Clicking "Add to cart" in article's `InlineProductCard` works
- [x] (after Module 07) "Other recipes" displays articles based on tag intersections

---

## Module 05 — Accounts Section

### Implementation
- [x] `/account` — three dashboard tabs
- [x] Orders: list, details, cancellation reasons
- [x] Profile: modify name, phone, password
- [x] Addresses: CRUD with delete confirmation dialog

### Verification
- [x] Create a few orders → they populate the "My Orders" tab
- [x] Order Details — all data points display correctly
- [x] Accessing someone else's order `/account/orders/<someone_elses_id>` → redirects to `/account`
- [x] Edit name and phone → save → reload page → changes persist
- [x] Changing password for email user — works (new password authenticates, old doesn't)
- [x] Changing password for Google user — explanation displayed with links to Google
- [x] Add path-address → shows in list → visible in checkout dropdown
- [x] Delete address → shows confirmation modal → removed upon confirm
- [x] Select saved address inside checkout dropdown → fields auto-fill

---

## Module 06 — Admin Core

### Implementation
- [x] Admin layout with sidebar navigation
- [x] Dashboard: statistic cards, quick actions
- [x] `/admin/orders` — table list, order status filter
- [x] `/admin/orders/:id` — update status, cancellation reason
- [x] Status updates trigger Brevo emails to clients

### Verification
- [x] Accessing `/admin` without admin privileges → redirects to `/`
- [x] Admin user login → Dashboard displays genuine real-time statistics from Firestore
- [x] Heading click "New Orders" → redirects to `/admin/orders?status=new`
- [x] Quick Actions route to correct locations
- [x] Complete order from customer account → visible in `/admin/orders` under "New" filter
- [x] Update status to `confirmed` → verification email lands with confirmation template
- [x] Attempt to update status to `cancelled` without a reason → submit disabled
- [x] Specify cancellation reason -> customer sees it under `/account/orders/:id`
- [x] Cycle status: new → confirmed → in_transit → delivered → receives 4 emails

---

## Module 07 — Admin CMS

### Implementation
- [x] `/admin/products` — CRUD, media gallery from Storage, drag-and-drop ordering
- [x] Associate articles to a product
- [x] `/admin/blog` — CRUD, TipTap rich text editor, product mention node
- [x] Associate products to an article

### Verification

**Products:**
- [x] Create product with 3 photos → re-order via drag-and-drop → save → Firestore `images` updated in order
- [x] Toggle `featured: true` → product populates the home page catalog
- [x] Inline `inStock` toggle in table operates directly without navigating to the form
- [x] Link article to a product → edit article → product is visible in `linkedProductIds` (bi-directional link)
- [x] Delete product → Firestore records and Storage files removed

**Blog:**
- [x] Create article with title, image, content, publish
- [x] In editor, insert `<product-mention>` via Picker → renders in preview
- [x] Save and visit `/blog/:id` → InlineProductCard renders in body text
- [x] Click "Add to cart" on InlineProductCard → card item added, toast shown
- [x] Delete product referenced in `<product-mention>` → visit article → card safely excluded
- [x] Draft article excluded from `/blog`

---

## Module 08 — Newsletter, Subscribers, Settings, Deployment

### Implementation
- [x] `/admin/newsletter` — compose, preview, send
- [x] Log campaign to `/newsletterHistory`
- [x] Archive history with visual HTML preview
- [x] `/admin/subscribers` — listing table, deletion controls
- [x] `/admin/settings` — landing page content, pickup addresses
- [ ] **Hosting chosen and set up**
- [ ] **Production build deployed**
- [x] **README.md composed**

### Verification

**Newsletter:**
- [x] Compose: select article → auto-fills fields (title, excerpt, image, product mentions)
- [x] Preview in iframe renders email exactly as clients see it
- [x] Click "Send" → confirmation window shows list count of `confirmed` subscribers
- [x] Confirm → email reaches inbox, record logged under `/newsletterHistory`
- [x] History: click "Preview" → reveals HTML modal

**Subscribers:**
- [x] Header counter = matches count of documents with `confirmed` status
- [x] Remove subscriber → prompts confirmation, deletes from Firestore and Brevo list (if integrated)

**Settings:**
- [x] Edit Hero Title → save → `/settings/landing.hero` updates → landing reflects changes
- [x] Update Hero Background -> removes old file from Storage, uploads new cover
- [x] Add pick-up address → populates checkout list (Module 03)
- [x] Delete pick-up address → removed from checkout list

**Production Deployment (Final):**
- [x] Build script (`npm run build`) runs successfully
- [ ] GitHub Actions workflow deploys correctly on push to `main`
- [ ] All vital routes function on production domain: auth, purchase flows, newsletter subscriptions
- [ ] Status updates and transactional mailings triggers from production
- [ ] Storage utilizes CDN, write rules protected against non-admins
- [x] README is fully updated (configuration, environment variables, admin delegation)
- [ ] Admin user invited, ownership transferred to client
