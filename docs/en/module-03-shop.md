# Module 03 — Shop (Catalog → Checkout)

> To be loaded alongside `main.md`. Depends on Modules 00, 02.

---

## What We Build
1. Product catalog `/shop` with filters and sorting capabilities.
2. Product details page `/shop/:id`.
3. Shopping cart page `/cart`.
4. Checkout page `/checkout`.
5. Order confirmation page `/order/:id`.
6. Global `Navbar` with shopping cart count.

---

## Files Created

### Components
- `src/shared/components/Navbar.jsx`
- `src/features/shop/components/ProductCard.jsx`
- `src/features/shop/components/ProductGallery.jsx`
- `src/features/shop/components/CategoryFilter.jsx`
- `src/features/shop/components/SortDropdown.jsx`
- `src/features/shop/components/CartItem.jsx`
- `src/features/shop/components/QuantityCounter.jsx`
- `src/features/shop/components/CheckoutForm.jsx`
- `src/features/shop/components/OrderSummary.jsx`
- `src/features/shop/components/PickupAddressList.jsx`

### Pages
- `src/features/shop/pages/ShopPage.jsx`
- `src/features/shop/pages/ProductPage.jsx`
- `src/features/shop/pages/CartPage.jsx`
- `src/features/shop/pages/CheckoutPage.jsx`
- `src/features/shop/pages/OrderConfirmationPage.jsx`

### Hooks
- `src/features/shop/hooks/useProducts.js`
- `src/features/shop/hooks/useProduct.js`
- `src/features/shop/hooks/useLinkedArticles.js`
- `src/features/shop/hooks/usePickupAddresses.js`
- `src/features/shop/hooks/useCreateOrder.js`

---

## Implementation Details

### Navbar (shared)
- Brand logo "Komora" → `/`.
- Main menu: Shop, Blog, About Us (anchor pointing to landing page).
- Right aligned: cart icon with item count badge `count` from `useCart()`. Click → `/cart`.
- Auth section (see Module 02).
- Mobile layout: hamburger collapsible menu.

---

### ShopPage (`/shop`)

**Layout:**
- Left panel (desktop) — `CategoryFilter`. Collapsible panel at the top on mobile.
- Top — `SortDropdown` (`Newest`, `Price: Low to High`, `Price: High to Low`).
- Grid of `ProductCard` components (3 columns on desktop, 2 on tablet, 1 on mobile).

**Filtering:**
- Core Categories: `Jam` (`jam`), `Sauces` (`sauce`), `Preserves` (`preserve`).
- Under each category is a list of subcategory tags. Tags are extracted on initialization from existing products inside that category.
- Filter values are synced with URL search params: `/shop?category=jam&tag=berry&sort=price-asc`. This guarantees shareable links and proper back-button navigation.

**Hook `useProducts`:**
```js
function useProducts({ category, tag, sortBy }) {
  // Builds query to /products
  // category → where('category', '==', category)
  // tag → where('tags', 'array-contains', tag)
  // sortBy:
  //   'newest' → orderBy('createdAt', 'desc')
  //   'price-asc' → orderBy('price', 'asc')
  //   'price-desc' → orderBy('price', 'desc')
  // Returns { products, loading, error }
  // Uses onSnapshot for real-time sync
}
```

**States:**
- `loading: true` — shows 9 product card skeletons.
- Empty list — renders `<EmptyState>` with "No products found for this filter combination".

---

### ProductCard

**Layout:**
- Square cover image (`aspect-square`, `object-cover`).
- Title (clickable, leading to `/shop/:id`).
- Price.
- `QuantityCounter` input (min 1).
- Full-width "Add to Cart" button.

**Micro-Interaction "Add to Cart":**
1. Click → invokes `addItem(product, quantity)` from `useCart`.
2. Button immediately switches style: checkmark icon ✓ + text "Added" for 1.5 seconds.
3. Show Toast: `{ message: '${product.name} added to cart', type: 'success', action: { label: 'View Cart', onClick: () => navigate('/cart') } }`.
4. Cart counter in Navbar updates with CSS transform transition scaling.
5. After 1.5 seconds, the button style returns to default.

**If `inStock: false`:**
- "Add to Cart" button is disabled and displays "Out of Stock".
- `QuantityCounter` is hidden.

---

### ProductPage (`/shop/:id`)

**Layout (2 columns on desktop):**
- **Left Panel:** `ProductGallery` — prominent active photo + row of thumbnail images. Clicking thumbnail updates active image.
- **Right Panel:** Title, price, description, `QuantityCounter`, "Add to Cart" button (identical micro-interaction).

**Bottom Block:**
- "Recipes using this product" section — horizontal row of article cards using `linkedArticleIds`.

**Hook `useLinkedArticles(linkedArticleIds)`:**
- If array is empty → returns `[]`.
- Otherwise → `query(collection(db, 'articles'), where('__name__', 'in', linkedArticleIds), where('published', '==', true))`.
- Firestore restricts `in` operations to 10 entities, which is more than enough.

---

### CartPage (`/cart`)

**Layout:**
- Left section — list of `CartItem` elements (photo, name, price, `QuantityCounter`, delete button).
- Right section — summary block: total quantity, subtotal, and "Checkout" button → `/checkout`.

**Behavior:**
- Changing quantity → immediate reactive subtotal recalculation.
- Deleting an element → show toast "Removed from cart".
- If `items.length === 0` → `<EmptyState>` with "Your cart is empty" and a button "To Store" → `/shop`.

---

### CheckoutPage (`/checkout`)

**Guards:**
- If !user → redirect to `/login` with `state.from = /checkout`.
- If cart is empty → redirect to `/shop`.

**Layout (2 columns on desktop):**
- **Left (60%):** `CheckoutForm`.
- **Right (40%):** `OrderSummary` (sticky on desktop, aligned at the bottom on mobile).

#### CheckoutForm
**Fields:**
- First and last name * (prefilled from `user.displayName` or `users/{uid}.name`)
- Phone number * (prefilled from `users/{uid}.phone`)
- Email * (prefilled from `user.email`, readonly)
- Delivery Type Selection: **Delivery or Pickup**
- If Delivery:
  - Street Address *, City *, Postal Code *
  - If user addresses exist under `/addresses` → show dropdown "Select saved address" to auto-fill.
- If Pickup:
  - `PickupAddressList` — radio list populated from `/pickupAddresses`. Includes point name, working hours, address.
- Order Comment (textarea, optional)

**Validation:**
- Empty required fields on submit are marked with a red border and validation error text.
- Phone number format mask validation.
- Email input formatting.
- Submit button is disabled until form fields validate successfully.

#### `useCreateOrder`
```js
const { createOrder, loading } = useCreateOrder();
// Upon submit:
// 1. Create document under /orders with status 'new'
// 2. Call brevo.sendTransactional with order placed email template
// 3. Invoke clearCart()
// 4. navigate(`/order/${orderId}`)
```

---

### OrderConfirmationPage (`/order/:id`)
- Reads `id` from URL, loads order document via `useOrder(id)`.
- Security: Only display details if `order.userId === user.uid` or `role === 'admin'`.
- Content:
  - Big success header: "Order #... received!"
  - List of purchased products, quantities, prices, total sum.
  - Active delivery destination address or pickup collection point.
  - Informative text: *"We have sent a confirmation message to [email]. You can track your ordering progress anytime in your personal profile."*
  - Button "Back to Shop" → `/shop`.

---

## Ready Criteria
See the `Module 03 — Shop` section in `progress.md`.
