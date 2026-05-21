# Modul 00 — Initialisierung

> Zusammen mit `main.md` laden.
> Dieses Modul bildet die Grundlage für alle folgenden Module. Ohne dieses Modul können die anderen nicht gestartet werden.

---

## Was wir bauen
1. React + Vite-Projekt mit Tailwind.
2. Ordnerstruktur `features/` + `shared/`.
3. Firebase- und Brevo-Clients in `shared/lib/`.
4. Drei Contexts: Auth, Cart, Toast.
5. `ProtectedRoute` und `AppRouter` mit Platzhalterseiten für alle Routen.
6. Deployment der Sicherheitsregeln in Firestore und Storage.

---

## Zu erstellende Dateien

### Konfiguration
- `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- `index.html`, `.env.local.example`, `.gitignore`

### Stammverzeichnis (Root)
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

### Platzhalterseiten (eine Datei pro Route aus main.md)
Jeweils: `<div className="p-8"><h1>Page Name</h1></div>`. Die tatsächliche Implementierung erfolgt in den folgenden Modulen.

- `src/features/shop/pages/ShopPage.jsx`, `ProductPage.jsx`, `CartPage.jsx`, `CheckoutPage.jsx`, `OrderConfirmationPage.jsx`
- `src/features/blog/pages/BlogPage.jsx`, `ArticlePage.jsx`
- `src/features/auth/pages/LoginPage.jsx`, `RegisterPage.jsx`
- `src/features/account/pages/AccountPage.jsx`, `OrderDetailsPage.jsx`
- `src/features/newsletter/pages/SubscriptionConfirmedPage.jsx`
- `src/features/admin/pages/AdminLayout.jsx`, `DashboardPage.jsx`, `OrdersPage.jsx`, `OrderDetailsPage.jsx`, `ProductsPage.jsx`, `ProductFormPage.jsx`, `BlogPage.jsx`, `ArticleFormPage.jsx`, `NewsletterPage.jsx`, `SubscribersPage.jsx`, `SettingsPage.jsx`
- `src/features/landing/pages/LandingPage.jsx`

---

## Details zur Implementierung

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
Client für die Brevo REST-API. Alle Anfragen erfolgen über `fetch` mit dem Header `api-key`. Exportieren Sie folgende Funktionen:

```js
export async function subscribe(email);            // fügt Empfänger mit Status "pending" der Liste hinzu, löst Bestätigungsvorlage aus
export async function confirmSubscription(email);  // aufgerufen von /subscription-confirmed; sendet Willkommensvorlage
export async function sendTransactional({ to, templateId, params }); // zur Bestellbestätigung und Statusänderung
export async function sendCampaign({ subject, htmlContent, listId }); // für den Newsletter-Versand
```

⚠ Brevo API-Schlüssel auf dem Client — Einschränkung des Spark-Tarifs (Cloud Functions sind nicht verfügbar). Für die Produktionsumgebung sollten diese Aufrufe in eine Cloud-Funktion oder einen Cloudflare Worker verlagert werden.

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
Speichert dauerhaft in `localStorage` unter dem Schlüssel `komora-cart`. Struktur eines Eintrags: `{ productId, name, price, image, quantity }`.

API:
```js
const { items, addItem, removeItem, updateQuantity, clearCart, total, count } = useCart();
```

`addItem(product, quantity)` — wenn `productId` bereits vorhanden ist → erhöht die Menge. Andernfalls wird der Eintrag hinzugefügt.
`total` — berechneter Getter `items.reduce((s, i) => s + i.price * i.quantity, 0)`.
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

`ToastContainer` rendert Toasts fest in der unteren rechten Ecke, Animate-in/out mittels Tailwind-Transitions. `action` — optionales Objekt `{ label, onClick }` für einen Button im Toast (z.B. "Warenkorb anzeigen" nach dem Hinzufügen eines Produkts).

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
Erstellen Sie einen `BrowserRouter` mit allen Routen aus `main.md` Abschnitt 7. Verpacken Sie Administrator-Routen in `<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>` mit verschachtelten Routen.

```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/shop" element={<ShopPage />} />
  <Route path="/shop/:id" element={<ProductPage />} />
  {/* ...alle öffentlichen Routen */}

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
    {/* ...andere Administrator-Routen */}
  </Route>

  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### `App.jsx`
Zusammensetzung der Provider:
```jsx
<AuthProvider>
  <CartProvider>
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  </CartProvider>
</AuthProvider>
```

### Tailwind-Farbpalette (in `tailwind.config.js`)
Erweitern Sie das Thema um warme, erdige Töne für den Hof-Stil. Hauptfarben: `farm-green` (`#5a6f3f`), `farm-cream` (`#f7f1e3`), `farm-wood` (`#8b6f47`), `farm-berry` (`#9c2b3f`). Verwenden Sie diese in allen folgenden Modulen für Konsistenz.

---

## Ersten Administrator erstellen
Suchen Sie nach der ersten Registrierung eines normalen Benutzers in der Firestore-Konsole `/users/{uid}` und ändern Sie `role: 'user'` manuell in `'admin'`. Dies ist der einzige Weg, einen Administrator zu erstellen; über die Benutzeroberfläche ist dies nicht möglich (Konzeptbedingung).

---

## Kriterien für die Fertigstellung (in `progress.md` abhaken)
Siehe Block `Module 00 — Initialization` in `progress.md`. Alle Punkte müssen vor dem Start von Modul 01 erfüllt sein.
