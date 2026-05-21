# Module 06 — Admin Panel: Core & Orders

> To be loaded alongside `main.md`. Depends on Modules 00, 02, 03, 05.

---

## What We Build
1. Shared layout for the Admin Panel (`AdminLayout`) with sidebar navigation.
2. Analytics dashboard `/admin/dashboard` showing key business metrics and trend charts (using `recharts` / `d3`).
3. Order management page `/admin/orders` (filtering, listing).
4. Detailed order page `/admin/orders/:id` with state transition controls and cancellation modals.

---

## Files Created

### Layout
- `src/features/admin/components/AdminLayout.jsx` (replace placeholder)
- `src/features/admin/components/AdminSidebar.jsx`

### Dashboard & Analytics
- `src/features/admin/pages/DashboardPage.jsx` (replace placeholder)
- `src/features/admin/components/StatsGrid.jsx` (cards representing key metrics)
- `src/features/admin/components/SalesChart.jsx`
- `src/features/admin/components/RecentOrdersList.jsx`

### Order Management
- `src/features/admin/pages/OrdersPage.jsx` (replace placeholder)
- `src/features/admin/pages/OrderDetailsPage.jsx` (replace placeholder)
- `src/features/admin/components/OrdersTable.jsx`
- `src/features/admin/components/OrderStatusBadge.jsx`
- `src/features/admin/components/CancelOrderModal.jsx`
- `src/features/admin/components/OrderStatusStepper.jsx`

---

## Implementation Details

### AdminLayout
- **Guards:** Checks `ProtectedRoute role === 'admin'`. Displays loading page or blocks non-admins by redirecting to `/` (Module 02).
- Includes an `AdminSidebar` on the left (fixed list of links to Sub-modules) and the `<Outlet />` workspace panel on the right.
- Links in Sidebar:
  - Dashboard (`/admin`)
  - Orders (`/admin/orders`)
  - Products (`/admin/products`)
  - Blog (`/admin/blog`)
  - Newsletter (`/admin/newsletter`)
  - Settings (`/admin/settings`)
- Displays currently authenticated admin user name and a "Main Website" link directing back to `/`.

---

### DashboardPage (`/admin` workspace index)

**1. StatsGrid Cards:**
- **Total Revenue:** sum of all orders with statuses `confirmed`, `in_transit`, `delivered` (excludes `new`, `cancelled`).
- **Orders Count:** total number of documents in `/orders`.
- **Active Subscribers:** total of `/subscribers` documents with `confirmed` status.
- **Average Ticket Size:** calculated by dividing Total Revenue by the number of sales orders.
Show skeletons while fetching the Firestore counters.

**2. SalesChart (using `recharts`):**
- LineChart or BarChart representing monthly revenue trends. Group order data locally by transaction timestamp `createdAt` (aggregated by month). Shows smooth transitions and animations.

**3. RecentOrdersList:**
- Interactive table highlighting the 5 newest orders. Quick link in each row to go directly to `/admin/orders/:id`.

---

### OrdersPage (`/admin/orders`)
- Core view: Interactive listing of all platform orders.
- Filters: Row of selectable statuses (`All`, `New`, `Confirmed`, `In Transit`, `Delivered`, `Cancelled`).
- Table Columns:
  - Order ID (truncated)
  - Date and Time
  - Client Name
  - Delivery Method (icon + text label)
  - Total Payment Sum
  - Status Badge
  - Action button → Details (`/admin/orders/:id`)
- Fully supports onSnapshot real-time synchronization.

---

### OrderDetailsPage (`/admin/orders/:id`)
- Shows a concise master/detail block layout matching the look of the user's order page (items, prices, totals, custom notes) but appends **State Control Panels**.

#### Status Transition Rules (State Machine)
Administrators must follow a strict, one-directional status updates pipeline:

```
new ──> confirmed ──> in_transit ──> delivered
 │          │            │
 └───> cancelled <───────┘
```

**State Control Buttons:**
- If status is `new` → displays button "Confirm Order" (triggers transition to `confirmed`) and "Cancel Order".
- If status is `confirmed` → displays button "Hand Over to Delivery" (triggers transition to `in_transit`) and "Cancel Order".
- If status is `in_transit` → displays button "Mark as Delivered" (triggers transition to `delivered`) and "Cancel Order".
- If status is `delivered` or `cancelled` → hide transition buttons entirely (terminal states).

#### Cancellation Trigger
- Clicking "Cancel Order" opens `CancelOrderModal`.
- Includes input textarea: "Specify the reason of cancellation *" (required).
- Clicking "Confirm Cancellation" writes the update: `status: 'cancelled', cancelReason: text`. Closes modal, highlights status badge red, and triggers an email update.

---

### Dispatching Email Notifications

When an admin updates an order status, a notification email must be sent to the client. This uses the helper `getTemplateId` from Module 09.

```js
const handleUpdateStatus = async (newStatus) => {
  // 1. Update document in Firestore
  await updateDoc(doc(db, 'orders', id), { status: newStatus });

  // 2. Resolve template ID based on order language
  const templateId = getTemplateId('order_' + newStatus, order.userLanguage);

  // 3. Dispatch transactional email via Brevo REST client
  await brevo.sendTransactional({
    to: [{ email: order.userEmail, name: order.userName }],
    templateId,
    params: {
      customerName: order.userName,
      orderNumber: id.slice(0, 8).toUpperCase(),
      orderId: id,
      statusMessage: t('admin:orderStatus.' + newStatus + 'Message', { lng: order.userLanguage }),
      cancelReason: order.cancelReason || '', // only for cancellation state
    },
  });

  showToast({ message: 'Order status updated and consumer notified', type: 'success' });
};
```

---

## Ready Criteria
See the `Module 06 — Admin Panel Core & Orders` section in `progress.md`.
