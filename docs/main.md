# Комора — Архітектурний контекст

> **Завантажити в кожній сесії AI Studio як базовий контекст.**
> Цей файл містить контракти проєкту: стек, архітектурні правила, схему Firestore, Security Rules, карту маршрутів. Імплементації тут немає — вона у відповідних модулях.

---

## 1. Продукт

Сімейна ферма продає варення, соуси, консерви власного виробництва. Блог публікує рецепти з прив'язкою до конкретних продуктів магазину. Newsletter анонсує новий рецепт і веде підписника до товару.

Єдина петля: **стаття → продукт у тексті → кошик → замовлення.**

---

## 2. Стек

| Шар | Технологія |
|-----|-----------|
| Фронтенд | React + Vite |
| Роутинг | React Router v6 |
| Стилі | Tailwind CSS |
| Auth | Firebase Auth (Email/Password + Google) |
| База | Firebase Firestore |
| Файли | Firebase Storage |
| Email / Newsletter | Brevo (REST API + double opt-in) |
| Хостинг | Відкладено на завершення; під час розробки — AI Studio Preview |

---

## 3. Ручне налаштування користувачем (ПЕРЕД стартом розробки)

⚠ **Критичний нюанс:** Firebase-проєкт створюється **користувачем у Firebase Console**, **не** через AI Studio. Якщо проєкт створює AI Studio, база маркується як "AI-generated" і не дає активувати Storage.

### 3.1 Firebase
1. Відкрити [console.firebase.google.com](https://console.firebase.google.com), створити новий проєкт.
2. Активувати **Authentication**: увімкнути Email/Password і Google як провайдери.
3. Активувати **Cloud Firestore** (start in production mode — правила перепишемо).
4. Активувати **Storage** (та сама умова — production mode).
5. Project Settings → Your apps → Web → зареєструвати додаток, скопіювати `firebaseConfig`.

### 3.2 Brevo
1. Створити акаунт на [brevo.com](https://brevo.com), Free план.
2. SMTP & API → згенерувати API ключ.
3. Templates → створити подвійний opt-in flow:
   - Confirmation template (лист "Підтвердьте підписку").
   - Welcome template (надсилається після підтвердження).
4. Створити список (list) для підписників.

### 3.3 Передача конфігу AI Studio
Створити `.env.local` з ключами:
```
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

## 4. Архітектурні правила

### 4.1 Feature-based структура
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
└── main.jsx
```

### 4.2 Repository pattern
Робота з Firestore — **тільки через хуки** у `features/*/hooks/`. Компоненти і сторінки **не звертаються** до Firestore напряму. Сигнатура хуків:

```js
function useProducts(filters) {
  return { products, loading, error };
}
function useProduct(id) {
  return { product, loading, error };
}
```

Read-операції використовують `onSnapshot` для real-time. Write — `addDoc` / `updateDoc` / `deleteDoc`.

### 4.3 Глобальний стан — два Context'и
- **AuthContext** — `{ user, role, loading }`. Слухає `onAuthStateChanged`, при логіні підтягує `users/{uid}.role`.
- **CartContext** — `{ items, addItem, removeItem, updateQuantity, clearCart, total }`. Persist у `localStorage`.

Все інше — локальний стан або хуки. **Жодного Redux / Zustand.**

### 4.4 Toast — єдиний сервіс
Один `useToast()` хук. Виклик: `showToast({ message, type })`, типи `success | error | info`.

### 4.5 ProtectedRoute з ролями
```jsx
<ProtectedRoute requiredRole="user">{children}</ProtectedRoute>
<ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
```
Поведінка: під час `loading` → `<PageLoader />`. Без `user` → редірект на `/login` з `state.from`. Якщо `requiredRole === 'admin'` і `role !== 'admin'` → редірект на `/`.

---

## 5. Структура Firestore

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
  images: string[]              # масив URL зі Storage
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
  label: string                 # "Дім", "Робота"
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

## 7. Карта маршрутів

### Публічні
| Шлях | Сторінка |
|------|----------|
| `/` | Landing |
| `/shop` | Каталог |
| `/shop/:id` | Сторінка продукту |
| `/cart` | Кошик |
| `/checkout` | Оформлення замовлення |
| `/order/:id` | Підтвердження замовлення |
| `/blog` | Список статей |
| `/blog/:id` | Стаття |
| `/login` | Вхід |
| `/register` | Реєстрація |
| `/subscription-confirmed` | Подяка після double opt-in |

### Тільки для авторизованих (`requiredRole="user"`)
| Шлях | Сторінка |
|------|----------|
| `/account` | Кабінет (вкладки Замовлення / Профіль / Адреси) |
| `/account/orders/:id` | Деталі замовлення клієнта |

### Тільки для адміна (`requiredRole="admin"`)
| Шлях | Сторінка |
|------|----------|
| `/admin` | Dashboard |
| `/admin/orders` | Список замовлень |
| `/admin/orders/:id` | Деталі замовлення (зміна статусу) |
| `/admin/products` | Список товарів |
| `/admin/products/new` | Створення товару |
| `/admin/products/:id` | Редагування товару |
| `/admin/blog` | Список статей |
| `/admin/blog/new` | Створення статті |
| `/admin/blog/:id` | Редагування статті |
| `/admin/newsletter` | Compose / preview / send / history |
| `/admin/subscribers` | Підписники |
| `/admin/settings` | Лендінг, Про нас, Адреси самовивозу |

---

## 8. Робочий процес у AI Studio

1. **Кожна сесія:** завантажити `main.md` + потрібний `module-XX-*.md`.
2. **Після кожної сесії:** оновити `progress.md` (відмітити виконані пункти).
3. **Послідовність модулів:** 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08. Перескакувати не можна — пізніші модулі залежать від попередніх.
4. **Хостинг:** не торкатися до завершення `module-08`. Розробка ведеться в AI Studio Preview.
