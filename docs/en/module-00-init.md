# Module 00 — Initialization

> To be loaded alongside `main.md`.
> This module builds the foundation for all subsequent ones. Without it, other modules will not start.

---

## What We Deploy
1. React + Vite project with Tailwind.
2. Folder structure: `features/` + `shared/`.
3. Firebase and Brevo clients in `shared/lib/`.
4. Three Contexts: Auth, Cart, Toast.
5. `ProtectedRoute` and `AppRouter` with placeholder pages for all routes.
6. Deployment of Security Rules to Firestore and Storage.

---

## Files Created

### Configuration
- `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- `index.html`, `.env.local.example`, `.gitignore`

### Root
- `src/main.jsx`, `src/App.jsx`, `src/index.css`

### Shared
- `src/shared/lib/firebase.js`
- `src/shared/lib/brevo.js`
- `src/shared/contexts/AuthContext.jsx`
- `src/shared/contexts/CartContext.jsx`
- `src/shared/contexts/ToastContext.jsx`
- `src/shared/components/Toast.jsx`
- `src/shared/components/Button.jsx`
- `src/shared/components/Modal.jsx`
- `src/shared/components/Loader.jsx` (PageLoader, Spinner)
- `src/shared/components/EmptyState.jsx`
- `src/shared/router/AppRouter.jsx`
- `src/shared/router/ProtectedRoute.jsx`

### Placeholder Pages (one file per route from main.md)
Each page should be simple: `<div className="p-8"><h1>Page Name</h1></div>`. Real implementation occurs in following modules.

- `src/features/shop/pages/ShopPage.jsx`, `ProductPage.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx`
- `src/features/blog/pages/BlogPage.jsx`, `ArticlePage.jsx`
- `src/features/auth/pages/LoginPage.jsx`, `RegisterPage.jsx`
- `src/features/account/pages/AccountPage.jsx`, `OrderDetailsPage.jsx`
- `src/features/newsletter/pages/SubscriptionConfirmedPage.jsx`
- `src/features/admin/pages/AdminLayout.jsx`, `DashboardPage.jsx`, `OrdersPage.jsx`, `OrderDetailsPage.jsx`, `ProductsPage.jsx`, `ProductFormPage.jsx`, `BlogPage.jsx`, `ArticleFormPage.jsx`, `NewsletterPage.jsx`, `SubscribersPage.jsx`, `SettingsPage.jsx`
- `src/features/landing/pages/LandingPage.jsx`

---

## Implementation Details

### `shared/lib/firebase.js`
```js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
```

### `shared/lib/brevo.js`
Client for Brevo REST API. All requests go through `fetch` with the `api-key` header. Export the following functions:

```js
export async function subscribe(email);            // adds to the list with pending status, triggers confirmation template
export async function confirmSubscription(email);  // called from /subscription-confirmed; sends welcome template
export async function sendTransactional({ to, templateId, params }); // for order confirmation, status updates
export async function sendCampaign({ subject, htmlContent, listId }); // for newsletter campaigns
```

⚠ The Brevo API key is stored on the client side — a constraint of the Spark plan (Cloud Functions are not available). For production, these calls should be moved to a Cloud Function or Cloudflare Worker.

### `shared/contexts/AuthContext.jsx`
```jsx
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setRole(userDoc.exists() ? userDoc.data().role : 'user');
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### `shared/contexts/CartContext.jsx`
Persists in `localStorage` under the key `komora-cart`. Item structure: `{ productId, name, price, image, quantity }`.

API:
```js
const { items, addItem, removeItem, updateQuantity, clearCart, total, count } = useCart();
```

`addItem(product, quantity)` — if `productId` exists, increases quantity. Otherwise, appends new item.
`total` — computed getter `items.reduce((s, i) => s + i.price * i.quantity, 0)`.
`count` — computed getter `items.reduce((s, i) => s + i.quantity, 0)`.

### `shared/contexts/ToastContext.jsx`
```jsx
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ message, type = 'info', duration = 3000, action }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}
```

`ToastContainer` renders toasts fixed in the bottom-right corner, with an animate-in/out effect using Tailwind transitions. `action` — optional object `{ label, onClick }` for a button inside the toast (e.g., "View Cart" after adding a product).

### `shared/router/ProtectedRoute.jsx`
```jsx
export function ProtectedRoute({ children, requiredRole = 'user' }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requiredRole === 'admin' && role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
```

### `shared/router/AppRouter.jsx`
Create a `BrowserRouter` with all routes from `main.md` section 7. Wrap admin routes in `<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>` with nested routes.

```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/shop/:id" element={<ProductPage />} />
  {/* ...all public routes */}

  <Route path="/account" element={
    <ProtectedRoute><AccountPage /></ProtectedRoute>
  } />
  <Route path="/account/orders/:id" element={
    <ProtectedRoute><OrderDetailsPage /></ProtectedRoute>
  } />

  <Route path="/admin" element={
    <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
  }>
    <Route index element={<DashboardPage />} />
    <Route path="orders" element={<AdminOrdersPage />} />
    <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
    {/* ...all other admin routes */}
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### `App.jsx`
Provider composition:
```jsx
<AuthProvider>
  <CartProvider>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </CartProvider>
</AuthProvider>
```

### Tailwind Palette (in `tailwind.config.js`)
Extend the theme with warm earthy farm tones. Core colors: `farm-green` (`#5a6f3f`), `farm-cream` (`#f7f1e3`), `farm-wood` (`#8b6f47`), `farm-berry` (`#9c2b3f`). Use throughout the following modules for consistency.

---

## Creating the First Admin
After the first normal user registration, locate `/users/{uid}` in the Firestore Console and manually update `role: 'user'` → `'admin'`. This is the only way to create an admin; it is not accessible through the UI (by design).

---

## Ready Criteria (check off in `progress.md`)
See the `Module 00 — Initialization` section in `progress.md`. All items must be completed before launching Module 01.
