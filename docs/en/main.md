# Komora — Architectural Context

> **To be loaded in every AI Studio session as the base context.**
> This file contains the project contracts: stack, architectural rules, Firestore schema, Security Rules, and the route map. The actual implementation is located within the respective modules.

---

## 1. Product

A family farm sells self-produced jams, sauces, and preserves. The blog publishes recipes linked to specific products in the shop. The newsletter announces new recipes and leads subscribers to the products.

The primary conversion loop: **article → product mentioned in text → cart → order.**

---

## 2. Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Auth | Firebase Auth (Email/Password + Google) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Email / Newsletter | Brevo (REST API + double opt-in) |
| Hosting | Deferred for later; during development — AI Studio Preview |

---

## 3. Manual Configuration by User (BEFORE starting development)

⚠ **Critical Nuance:** The Firebase project must be created **by the user in the Firebase Console**, **not** via AI Studio. If the project is created by AI Studio, the database is marked as "AI-generated" and won't allow activating Storage.

### 3.1 Firebase
1. Open [console.firebase.google.com](https://console.firebase.google.com), create a new project.
2. Activate **Authentication**: enable Email/Password and Google as providers.
3. Activate **Cloud Firestore** (start in production mode — security rules will be overwritten).
4. Activate **Storage** (same condition — production mode).
5. Project Settings → Your apps → Web → register application, copy the `firebaseConfig`.

### 3.2 Brevo
1. Create an account on [brevo.com](https://brevo.com), Free plan.
2. SMTP & API → generate API key.
3. Templates → create a double opt-in flow:
   - Confirmation template ("Confirm your subscription" email).
   - Welcome template (sent after confirmation).
4. Create a list for subscribers.

### 3.3 Passing the Config to AI Studio
Create `.env.local` with the keys:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_BREVO_API_KEY=...
VITE_BREVO_LIST_ID=...
VITE_BREVO_CONFIRM_TEMPLATE_ID=...
VITE_BREVO_WELCOME_TEMPLATE_ID=...
```

---

## 4. Architectural Rules

### 4.1 Feature-based Structure
```
src/
├── features/
│   ├── shop/        { components, hooks, pages }
│   ├── blog/        { components, hooks, pages }
│   ├── auth/        { components, hooks, pages }
│   ├── account/     { components, hooks, pages }
│   ├── newsletter/  { components, hooks }
│   └── admin/       { components, hooks, pages }
├── shared/
│   ├── components/  # Button, Toast, Modal, Loader, EmptyState, PageLoader
│   ├── contexts/    # AuthContext, CartContext, ToastContext
│   ├── lib/         # firebase.js, brevo.js
│   └── router/      # AppRouter, ProtectedRoute
│   └── format/      # Price formatting
└── main.jsx
```

### 4.2 Repository Pattern
Interactions with Firestore must take place **exclusively through hooks** in `features/*/hooks/`. Components and pages **do not access** Firestore directly. Hook signature template:

```js
function useProducts(filters) {
  return { products, loading, error };
}
function useProduct(id) {
  return { product, loading, error };
}
```

Read operations use `onSnapshot` for real-time updates. Write operations use `addDoc` / `updateDoc` / `deleteDoc`.

### 4.3 Global State — Two Contexts
- **AuthContext** — `{ user, role, loading }`. Listens to `onAuthStateChanged`, retrieves `users/{uid}.role` on login.
- **CartContext** — `{ items, addItem, removeItem, updateQuantity, clearCart, total }`. Persisted in `localStorage`.

All other state is kept local or in custom hooks. **No Redux or Zustand.**

### 4.4 Toast — Single Unified Service
One `useToast()` hook. Trigger: `showToast({ message, type })`, types are `success | error | info`.

### 4.5 ProtectedRoute with Roles
```jsx
<ProtectedRoute requiredRole="user">{children}</ProtectedRoute>
<ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
```
Behavior: during `loading` → `<PageLoader />`. No `user` → redirect to `/login` with `state.from`. If `requiredRole === 'admin'` and `role !== 'admin'` → redirect to `/`.

---

## 5. Firestore Structure

```
/users/{uid}
  email: string
  name: string
  phone: string
  role: 'user' | 'admin'
  createdAt: timestamp

/products/{id}
  name: string
  category: 'jam' | 'sauce' | 'preserve'
  tags: string[]
  price: number
  description: string
  images: string[]              # Array of Storage URLs
  inStock: boolean
  featured: boolean
  linkedArticleIds: string[]
  createdAt: timestamp

/articles/{id}
  title: string
  body: string                  # rich text HTML (TipTap)
  excerpt: string
  imageUrl: string
  tags: string[]
  linkedProductIds: string[]
  published: boolean
  featured: boolean
  createdAt: timestamp

/orders/{id}
  userId: string
  userName: string
  userPhone: string
  userEmail: string
  items: { productId, name, price, quantity }[]
  total: number
  deliveryMethod: 'delivery' | 'pickup'
  address: string | null
  pickupAddressId: string | null
  comment: string
  status: 'new' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
  cancelReason: string | null
  createdAt: timestamp
  updatedAt: timestamp

/addresses/{id}
  userId: string
  label: string                 # "Home", "Work"
  street: string
  city: string
  postalCode: string

/subscribers/{id}
  email: string
  status: 'pending' | 'confirmed'
  subscribedAt: timestamp

/newsletterHistory/{id}
  articleId: string
  articleTitle: string
  introText: string
  recipientsCount: number
  sentAt: timestamp
  previewHtml: string

/settings/landing
  hero: { title, subtitle, ctaText, imageUrl }
  about: { text, imageUrl }

/pickupAddresses/{id}
  label: string
  address: string
  workingHours: string
```

---

## 6. Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /articles/{id} {
      allow read: if resource.data.published == true;
      allow read, write: if isAdmin();
    }
    match /products/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow update: if isAdmin();
    }
    match /subscribers/{id} {
      allow create: if true;
      allow read, delete: if isAdmin();
    }
    match /users/{uid} {
      allow read, write: if isOwner(uid);
      allow read: if isAdmin();
    }
    match /addresses/{id} {
      allow read, write: if isOwner(resource.data.userId);
    }
    match /settings/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /pickupAddresses/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /newsletterHistory/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

### Storage Rules
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /articles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /settings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 7. Route Map

### Public
| Path | Page |
|------|----------|
| `/` | Landing |
| `/shop` | Catalog |
| `/shop/:id` | Product Page |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/order/:id` | Order Confirmation |
| `/blog` | Article List |
| `/blog/:id` | Article View |
| `/login` | Login |
| `/register` | Register |
| `/subscription-confirmed` | Post-double opt-in gratitude |

### Authorized Only (`requiredRole="user"`)
| Path | Page |
|------|----------|
| `/account` | Accounts (tabs: Orders / Profile / Addresses) |
| `/account/orders/:id` | Client Order Details |

### Admin Only (`requiredRole="admin"`)
| Path | Page |
|------|----------|
| `/admin` | Dashboard |
| `/admin/orders` | Orders List |
| `/admin/orders/:id` | Order Details (status updates) |
| `/admin/products` | Products List |
| `/admin/products/new` | Create Product |
| `/admin/products/:id` | Edit Product |
| `/admin/blog` | Articles List |
| `/admin/blog/new` | Create Article |
| `/admin/blog/:id` | Edit Article |
| `/admin/newsletter` | Compose / preview / send / history |
| `/admin/subscribers` | Subscribers |
| `/admin/settings` | Landing, About us, Pickup Addresses |

---

## 8. Development Workflow in AI Studio

1. **Every Session:** Load `main.md` + necessary `module-XX-*.md`.
2. **After Every Session:** Update `progress.md` (mark completed tasks).
3. **Module Sequence:** 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08. Do not skip steps — subsequent modules rely on previous ones.
4. **Hosting:** Do not touch hosting until `module-08` is complete. Development runs entirely within the AI Studio Preview.
