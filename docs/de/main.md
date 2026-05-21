# Komora — Architektonischer Kontext

> **In jeder AI Studio Session als Basiskontext laden.**
> Diese Datei enthält die Projektverträge: Stack, Architekturregeln, Firestore-Schema, Security Rules und die Routen-Map. Die eigentliche Implementierung befindet sich in den jeweiligen Modulen.

---

## 1. Produkt

Ein Familienbetrieb verkauft Marmeladen, Saucen und Konserven aus eigener Herstellung. Der Blog veröffentlicht Rezepte mit Verweisen auf bestimmte Produkte im Shop. Der Newsletter kündigt neue Rezepte an und führt Abonnenten direkt zum Produkt.

Der primäre Konvertierungskreislauf: **Artikel → im Text erwähntes Produkt → Warenkorb → Bestellung.**

---

## 2. Stack

| Schicht | Technologie |
|-----|-----------|
| Frontend | React + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Auth | Firebase Auth (E-Mail/Passwort + Google) |
| Datenbank | Firebase Firestore |
| Speicher (Storage) | Firebase Storage |
| E-Mail / Newsletter | Brevo (REST-API + Double-Opt-in) |
| Hosting | Auf später verschoben; während der Entwicklung — AI Studio Preview |

---

## 3. Manuelle Konfiguration durch den Benutzer (VOR dem Entwicklungsstart)

⚠ **Kritische Nuance:** Das Firebase-Projekt muss **vom Benutzer in der Firebase Console** erstellt werden, **nicht** über AI Studio. Wenn das Projekt von AI Studio erstellt wird, wird die Datenbank als "AI-generated" markiert und lässt die Aktivierung des Storage-Dienstes nicht zu.

### 3.1 Firebase
1. Öffnen Sie [console.firebase.google.com](https://console.firebase.google.com) und erstellen Sie ein neues Projekt.
2. Aktivieren Sie **Authentication**: Aktivieren Sie E-Mail/Passwort und Google als Anbieter.
3. Aktivieren Sie **Cloud Firestore** (im Produktionsmodus starten — die Sicherheitsregeln werden später überschrieben).
4. Aktivieren Sie **Storage** (gleiche Bedingung — Produktionsmodus).
5. Systemeinstellungen → Ihre Apps → Web → Registrieren Sie die App und kopieren Sie die `firebaseConfig`.

### 3.2 Brevo
1. Erstellen Sie ein Konto auf [brevo.com](https://brevo.com), Tarife: Kostenlos (Free).
2. SMTP & API → Generieren Sie einen API-Schlüssel.
3. Vorlagen (Templates) → Erstellen Sie einen Double-Opt-in-Flow:
   - Bestätigungsvorlage (E-Mail "Abonnement bestätigen").
   - Willkommensvorlage (wird nach Bestätigung gesendet).
4. Erstellen Sie eine Liste für Abonnenten.

### 3.3 Konfiguration an AI Studio übergeben
Erstellen Sie eine `.env.local` mit den folgenden Schlüsseln:
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

## 4. Architekturregeln

### 4.1 Feature-basierte Struktur
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
│   └── format/      # Preis-Formatierung
└── main.jsx
```

### 4.2 Repository-Muster (Repository Pattern)
Interaktionen mit Firestore dürfen **ausschließlich über Hooks** im Verzeichnis `features/*/hooks/` erfolgen. Komponenten und Seiten **greifen nicht direkt** auf Firestore zu. Hook-Signatur-Vorlage:

```js
function useProducts(filters) {
  return { products, loading, error };
}
function useProduct(id) {
  return { product, loading, error };
}
```

Leseoperationen verwenden `onSnapshot` für Echtzeit-Updates. Schreiboperationen verwenden `addDoc` / `updateDoc` / `deleteDoc`.

### 4.3 Globaler Zustand — Zwei Kontexte
- **AuthContext** — `{ user, role, loading }`. Überwacht `onAuthStateChanged`, lädt `users/{uid}.role` bei erfolgreicher Anmeldung.
- **CartContext** — `{ items, addItem, removeItem, updateQuantity, clearCart, total }`. Gespeichert im `localStorage`.

Jeder weitere Zustand wird lokal oder in benutzerdefinierten Hooks verwaltet. **Kein Redux oder Zustand.**

### 4.4 Toast — Einziger einheitlicher Dienst
Ein einziger `useToast()` Hook. Aufruf: `showToast({ message, type })`, mögliche Typen sind `success | error | info`.

### 4.5 ProtectedRoute mit Rollen
```jsx
<ProtectedRoute requiredRole="user">{children}</ProtectedRoute>
<ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
```
Verhalten: Während des Ladevorgangs (`loading`) → `<PageLoader />`. Kein `user` angemeldet → Weiterleitung zu `/login` mit `state.from`. Wenn `requiredRole === 'admin'` und `role !== 'admin'` → Weiterleitung zu `/`.

---

## 5. Firestore-Struktur

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
  images: string[]              # Array von Storage-URLs
  inStock: boolean
  featured: boolean
  linkedArticleIds: string[]
  createdAt: timestamp

/articles/{id}
  title: string
  body: string                  # Rich-Text HTML (TipTap)
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
  label: string                 # "Zuhause", "Arbeit"
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

## 6. Firestore-Sicherheitsregeln (Security Rules)

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

### Storage-Regeln
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

## 7. Routenplan (Route Map)

### Öffentlich
| Pfad | Seite |
|------|----------|
| `/` | Landing (Startseite) |
| `/shop` | Katalog |
| `/shop/:id` | Produktseite |
| `/cart` | Warenkorb |
| `/checkout` | Kasse |
| `/order/:id` | Bestellbestätigung |
| `/blog` | Artikelliste |
| `/blog/:id` | Artikelansicht |
| `/login` | Anmelden |
| `/register` | Registrieren |
| `/subscription-confirmed` | Dankesseite nach Double-Opt-in |

### Nur für angemeldete Kunden (`requiredRole="user"`)
| Pfad | Seite |
|------|----------|
| `/account` | Kundenbereich (Tabs: Bestellungen / Profil / Adressen) |
| `/account/orders/:id` | Bestelldetails des Kunden |

### Nur für Administratoren (`requiredRole="admin"`)
| Pfad | Seite |
|------|----------|
| `/admin` | Dashboard |
| `/admin/orders` | Bestellungsliste |
| `/admin/orders/:id` | Bestelldetails (Status-Updates) |
| `/admin/products` | Produktliste |
| `/admin/products/new` | Produkt erstellen |
| `/admin/products/:id` | Produkt bearbeiten |
| `/admin/blog` | Artikelliste |
| `/admin/blog/new` | Artikel erstellen |
| `/admin/blog/:id` | Artikel bearbeiten |
| `/admin/newsletter` | Erstellen / Vorschau / Senden / Historie |
| `/admin/subscribers` | Abonnenten |
| `/admin/settings` | Landing, Über uns, Abholstellen |

---

## 8. Entwicklungs-Workflow in AI Studio

1. **Jede Session:** Laden Sie `main.md` + das entsprechende `module-XX-*.md`.
2. **Nach jeder Session:** Aktualisieren Sie `progress.md` (erledigte Aufgaben abhaken).
3. **Modul-Reihenfolge:** 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08. Schritte nicht überspringen — nachfolgende Module bauen auf vorhergehenden auf.
4. **Hosting:** Rühren Sie das Hosting erst nach Abschluss von `module-08` an. Die Entwicklung erfolgt vollständig in der AI Studio-Vorschau.
