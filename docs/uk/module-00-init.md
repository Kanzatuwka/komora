# Module 00 — Ініціалізація

> Завантажити разом з `main.md`.
> Цей модуль будує фундамент для всіх наступних. Без нього інші модулі не запустяться.

---

## Що будуємо
1. React + Vite проєкт з Tailwind.
2. Структура папок `features/` + `shared/`.
3. Firebase і Brevo клієнти у `shared/lib/`.
4. Три Context'и: Auth, Cart, Toast.
5. `ProtectedRoute` і `AppRouter` зі всіма маршрутами як placeholder-сторінки.
6. Деплой Security Rules у Firestore і Storage.

---

## Файли що створюються

### Конфігурація
- `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- `index.html`, `.env.local.example`, `.gitignore`

### Корінь
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

### Placeholder-сторінки (по одному файлу на маршрут з main.md)
Кожен — `<div className="p-8"><h1>Page Name</h1></div>`. Реальна імплементація — у наступних модулях.

- `src/features/shop/pages/ShopPage.jsx`, `ProductPage.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx`
- `src/features/blog/pages/BlogPage.jsx`, `ArticlePage.jsx`
- `src/features/auth/pages/LoginPage.jsx`, `RegisterPage.jsx`
- `src/features/account/pages/AccountPage.jsx`, `OrderDetailsPage.jsx`
- `src/features/newsletter/pages/SubscriptionConfirmedPage.jsx`
- `src/features/admin/pages/AdminLayout.jsx`, `DashboardPage.jsx`, `OrdersPage.jsx`, `OrderDetailsPage.jsx`, `ProductsPage.jsx`, `ProductFormPage.jsx`, `BlogPage.jsx`, `ArticleFormPage.jsx`, `NewsletterPage.jsx`, `SubscribersPage.jsx`, `SettingsPage.jsx`
- `src/features/landing/pages/LandingPage.jsx`

---

## Деталі реалізації

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
Клієнт для Brevo REST API. Усі запити йдуть через `fetch` з заголовком `api-key`. Експортувати функції:

```js
export async function subscribe(email);            // додає в список зі статусом pending, тригерить confirmation template
export async function confirmSubscription(email);  // викликається з /subscription-confirmed; шле welcome template
export async function sendTransactional({ to, templateId, params }); // для підтвердження замовлення, зміни статусу
export async function sendCampaign({ subject, htmlContent, listId }); // для розсилки newsletter
```

⚠ API ключ Brevo на клієнті — обмеження Spark-плану (Cloud Functions недоступні). Для production варто винести ці виклики у Cloud Function або Cloudflare Worker.

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
Persist у `localStorage` під ключем `komora-cart`. Структура item: `{ productId, name, price, image, quantity }`.

API:
```js
const { items, addItem, removeItem, updateQuantity, clearCart, total, count } = useCart();
```

`addItem(product, quantity)` — якщо `productId` вже є → збільшує кількість. Інакше — додає.
`total` — обчислюваний геттер `items.reduce((s, i) => s + i.price * i.quantity, 0)`.
`count` — `items.reduce((s, i) => s + i.quantity, 0)`.

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

`ToastContainer` рендерить тости фіксовано в правому нижньому куті, animate-in/out через Tailwind transition. `action` — опціонально, об'єкт `{ label, onClick }` для кнопки в тості (наприклад, "Переглянути кошик" після додавання товару).

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
Створити `BrowserRouter` зі всіма маршрутами з main.md розділ 7. Адмінські маршрути обгорнути в `<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>` з вкладеними роутами.

```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/shop/:id" element={<ProductPage />} />
  {/* ...всі публічні */}

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
    {/* ...решта адмінських */}
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### `App.jsx`
Композиція провайдерів:
```jsx
<AuthProvider>
  <CartProvider>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </CartProvider>
</AuthProvider>
```

### Tailwind palette (в `tailwind.config.js`)
Розширити темами фермерського стилю — теплі землисті тони. Основні кольори: `farm-green` (`#5a6f3f`), `farm-cream` (`#f7f1e3`), `farm-wood` (`#8b6f47`), `farm-berry` (`#9c2b3f`). Використовувати у наступних модулях для консистентності.

---

## Створення першого адміна
Після першої реєстрації звичайного користувача — у Firestore Console знайти `/users/{uid}` і вручну змінити `role: 'user'` → `'admin'`. Це єдиний шлях створення адміна; через UI це не доступно (за дизайном).

---

## Критерії готовності (відмічати в `progress.md`)
Див. блок `Module 00 — Ініціалізація` у `progress.md`. Усі пункти мають бути виконані до старту Module 01.
