# Modul 03 — Shop (Katalog → Kasse)

> Zusammen mit `main.md` laden. Hängt von Modul 00, 02 ab.

---

## Was wir bauen
1. Produktkatalog `/shop` mit Filtern und Sortierung.
2. Produktdetailseite `/shop/:id`.
3. Warenkorb `/cart`.
4. Kasse / Bestellformular `/checkout`.
5. Bestellbestätigung `/order/:id`.
6. Globaler `Navbar` (Header) mit Warenkorb-Zähler.

---

## Zu erstellende Dateien

### Komponenten
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

### Seiten
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

## Details zur Implementierung

### Navbar (shared)
- Logo "Komora" → `/`.
- Menü: Shop, Blog, Über uns (Sprunglink auf Landingpage).
- Rechts: Warenkorb-Symbol mit Mengenanzeige `count` aus `useCart()`. Klick → `/cart`.
- Authentifizierungs-Bereich (siehe Modul 02).
- Auf Mobilgeräten: Hamburger-Menü.

---

### ShopPage (`/shop`)

**Layout:**
- Links (auf dem Desktop) — `CategoryFilter`. Auf Mobilgeräten — einklappbarer Bereich oben.
- Oben — `SortDropdown` (`Neueste`, `Preis ↑`, `Preis ↓`).
- Raster aus `ProductCard` (3 Spalten auf Desktop, 2 auf Tablet, 1 auf Mobilgeräten).

**Filter:**
- Kategorien: `Marmeladen` (`jam`), `Saucen` (`sauce`), `Konserven` (`preserve`).
- Unter jeder Kategorie — Liste von Tags (Unterkategorien). Die Tags werden dynamisch aus allen Produkten der ausgewählten Kategorie ausgelesen.
- Der Filterzustand wird in den URL-Suchparametern synchronisiert: `/shop?category=jam&tag=berry&sort=price-asc`. Dies ermöglicht teilbare Links und eine korrekte Browser-Navigation zurück.

**Hook `useProducts`:**
```js
function useProducts({ category, tag, sortBy }) {
  // Baut die Firestore-Abfrage für /products auf
  // category → where('category', '==', category)
  // tag → where('tags', 'array-contains', tag)
  // sortBy:
  //   'newest' → orderBy('createdAt', 'desc')
  //   'price-asc' → orderBy('price', 'asc')
  //   'price-desc' → orderBy('price', 'desc')
  // Gibt { products, loading, error } zurück
  // Verwendet onSnapshot für Echtzeit-Updates
}
```

**Zustände:**
- `loading: true` — 9 Skeletons für die Produktkarten anzeigen.
- Keine Produkte vorhanden — `<EmptyState>` mit dem Text "Keine Produkte für diesen Filter gefunden".

---

### ProductCard (Produktkarte)

**Layout:**
- Foto oben (quadratisch, `aspect-square`, `object-cover`).
- Name (anklickbar → führt zu `/shop/:id`).
- Preis.
- `QuantityCounter` (Mengenregler, Minimum 1).
- Button "In den Warenkorb" über die volle Breite.

**Mikro-Interaktion "In den Warenkorb":**
1. Klick → löst `addItem(product, quantity)` aus dem `CartContext` aus.
2. Der Button ändert sofort seinen Zustand: Häkchen-Symbol ✓ + Text "Hinzugefügt" für 1,5 Sekunden.
3. Toast-Nachricht: `{ message: '${product.name} zum Warenkorb hinzugefügt', type: 'success', action: { label: 'Warenkorb anzeigen', onClick: () => navigate('/cart') } }`.
4. Der Warenkorbzähler im Navbar vergrößert sich animiert (CSS `transition: transform`).
5. Nach 1,5 Sekunden kehrt der Button in den Ausgangszustand zurück.

**Wenn `inStock: false` (nicht auf Lager):**
- Button ist deaktiviert, Text zeigt "Nicht auf Lager".
- `QuantityCounter` wird ausgeblendet.

---

### ProductPage (`/shop/:id`)

**Layout (auf Desktop — 2 Spalten):**
- **Links:** `ProductGallery` — großes aktives Foto + horizontale Miniaturbildleiste darunter. Klick auf eine Miniatur ändert das aktive Foto.
- **Rechts:** Name, Preis, Beschreibung, `QuantityCounter`, Button "In den Warenkorb" (Gleiche Mikro-Interaktion).

**Unten (volle Breite):**
- Bereich "Rezepte mit diesem Produkt" — horizontaler Verlauf von Artikelkarten, die in `linkedArticleIds` hinterlegt sind.

**Hook `useLinkedArticles(linkedArticleIds)`:**
- Wenn das Array leer ist → gibt `[]` zurück.
- Andernfalls → `query(collection(db, 'articles'), where('__name__', 'in', linkedArticleIds), where('published', '==', true))`.
- Firestore limitiert `in`-Abfragen auf 10 Elemente — für den Blog unter dem Produkt ist dies völlig ausreichend.

---

### CartPage (Warenkorbseite) (`/cart`)

**Layout:**
- Links — Liste von `CartItem` (Foto, Name, Preis, `QuantityCounter`, Löschen-Symbol-Button).
- Rechts — Zusammenfassungsblock: Anzahl der Positionen, Gesamtsumme, Button "Zur Kasse" → `/checkout`.

**Verhalten:**
- Änderung der Menge → sofortige Neuberechnung der Summe (aus dem `CartContext`).
- Löschen einer Position → Toast "Aus dem Warenkorb entfernt".
- Wenn `items.length === 0` → `<EmptyState>` mit dem Text "Ihr Warenkorb ist leer" und einem Button "Zum Shop" → `/shop`.

---

### CheckoutPage (Kasse) (`/checkout`)

**Schutz:** Wenn unaufgemeldet (`!user`) → Weiterleitung zu `/login` mit vorübergehendem Speicher `state.from = /checkout`.
**Schutz:** Wenn Warenkorb leer (`items.length === 0`) → Weiterleitung zu `/shop`.

**Layout (2 Spalten auf Desktop):**
- **Links (60%):** `CheckoutForm`.
- **Rechts (40%):** `OrderSummary` (sticky auf Desktop, am Ende auf Mobilgeräten).

#### CheckoutForm
**Felder:**
- Vor- und Nachname * (vorausgefüllt aus `user.displayName` / `users/{uid}.name`)
- Telefonnummer * (vorausgefüllt aus `users/{uid}.phone`)
- E-Mail-Adresse * (vorausgefüllt aus `user.email`, schreibgeschützt)
- Auswahl: **Lieferung / Abholung**
- Wenn Lieferung:
  - Straße/Hausnummer *, Stadt *, Postleitzahl *
  - Wenn in `/addresses` gespeicherte Adressen des Benutzers vorliegen — Dropdown-Auswahl "Gespeicherte Adresse wählen" oben im Formular anzeigen.
- Wenn Abholung:
  - `PickupAddressList` — Radio-Gauges-Liste der Abholstellen aus `/pickupAddresses`. Jeder Punkt enthält: Name, Adresse, Öffnungszeiten.
- Kommentar (Textbereich, optional)

**Validierung:**
- Pflichtfelder, die beim Absenden leer sind → roter Rahmen + Fehlermeldung unter dem Feld.
- Telefonnummer — Formatvalidierung.
- E-Mail — Formatprüfung.
- Absende-Button ist deaktiviert, solange das Formular ungültige Angaben enthält.

#### `useCreateOrder`
```js
const { createOrder, loading } = useCreateOrder();
// Beim Absenden:
// 1. Dokument in /orders mit Status 'new' erstellen
// 2. brevo.sendTransactional mit der Vorlage zur Bestellbestätigung aufrufen
// 3. clearCart()
// 4. navigate(`/order/${orderId}`)
```

---

### OrderConfirmationPage (`/order/:id`)
- Liest `id` aus der URL, lädt das Dokument über `useOrder(id)`.
- Schutz: Nur anzeigen, wenn `order.userId === user.uid` (oder `role === 'admin'`).
- Inhalt:
  - Große Überschrift: "Bestellung Nr. [Kurzform der ID] eingegangen"
  - Liste der Artikel mit Menge und Zwischensummen
  - Lieferadresse oder gewählte Abholstelle
  - Nachricht: *"Wir haben Ihnen eine Bestätigung an [E-Mail-Adresse] gesendet. Sie können den Status jederzeit in Ihrem persönlichen Bereich einsehen."*
  - Button "Zurück zum Shop" → `/shop`.

---

## Kriterien für die Fertigstellung
Siehe Block `Module 03 — Shop` in `progress.md`.
