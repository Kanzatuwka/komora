# Modul 05 — Persönlicher Bereich (Konto)

> Zusammen mit `main.md` laden. Hängt von Modul 00, 02, 03 ab.

---

## Was wir bauen
1. Dashboard-Seite `/account` mit zwei Hauptbereichen:
   - **Profil-Tab** — persönliche Daten + Liste der gespeicherten Lieferadressen.
   - **Bestellungs-Tab** — Historie der Bestellungen des Benutzers.
2. Bestelldetailseite `/account/orders/:id` mit detaillierter Ansicht der Artikel, Preise, Versandstatus und Historie.

---

## Zu erstellende Dateien

### Komponenten
- `src/features/account/components/AccountNav.jsx`
- `src/features/account/components/ProfileTab.jsx`
- `src/features/account/components/OrdersTab.jsx`
- `src/features/account/components/AddressList.jsx`
- `src/features/account/components/AddressFormModal.jsx`

### Seiten
- `src/features/account/pages/AccountPage.jsx` (Platzhalter ersetzen)
- `src/features/account/pages/OrderDetailsPage.jsx` (Platzhalter ersetzen)

### Hooks
- `src/features/account/hooks/useUserOrders.js`
- `src/features/account/hooks/useUserAddresses.js`

---

## Details zur Implementierung

### AccountPage (`/account`)

**Schutz:**
- Geschützt über `ProtectedRoute` (Modul 02). Wenn unangemeldet → Weiterleitung zu `/login`.

**Layout:**
- Zentriertes Raster-Layout: Auf der linken Seite `AccountNav` (Umschalter zwischen Profil und Bestellungen), auf der rechten Seite das entsprechende aktive Panel.

---

### ProfileTab (Profil-Bereich)

**1. Formular für persönliche Daten:**
- Name (änderbar).
- Telefonnummer (änderbar).
- E-Mail-Adresse (schreibgeschützt).
- Button "Änderungen speichern" → aktualisiert das Dokument unter `/users/{uid}`. Zeigt bei Erfolg den Toast "Profil erfolgreich aktualisiert". Die Validierungsregeln entsprechen denen der Registrierung.

**2. Lieferadressen-Verwaltung:**
- Liste geladener Adressen aus `/users/{uid}/addresses/*`.
- Adresskarten: zeigt Stadt, Straße/Hausnummer, PLZ. Eine Karte kann als standardmäßig ("Default") deklariert werden (gekennzeichnet mit grünem Label).
- Buttons auf jeder Karte: "Löschen", "Bearbeiten", "Als Standard festlegen".
- Button "Neue Adresse hinzufügen" → öffnet das `AddressFormModal`.

**`AddressFormModal` - Formularfelder:**
- Stadt *, Straße/Hausnummer *, Postleitzahl *.
- Checkbox "Als standardmäßige Lieferadresse speichern".
- Beim Absenden: fügt das Dokument zur Subkollektion hinzu oder aktualisiert die bestehende Adresse bei der Bearbeitung. Leert das Formular, schließt das Modal und zeigt einen Erfolgs-Toast.

---

### OrdersTab (Bestellungs-Bereich)
- Zeigt alle Bestellungen des Benutzers an. Abfrage: `query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))`.
- Tabellen-Layout oder eine übersichtliche Karten-Liste.
- Jede Zeile zeigt:
  - Bestellnummer (die ersten 8 Zeichen der ID).
  - Erstellungsdatum (`formatDate` Helfer).
  - Gesamtsumme.
  - Aktuellen Status (als farblich dekorierte Badges):
    - `new` — blauer Rahmen
    - `confirmed` — durchgehendes Dunkelblau
    - `in_transit` — Orange
    - `delivered` — Grün
    - `cancelled` — Rot
- Button "Details" führt zur Detailseite `/account/orders/:id`.
- Falls keine Bestellungen vorhanden sind: `<EmptyState>` mit dem Text "Sie haben noch keine Bestellungen aufgegeben" + Button "Zum Shop" → `/shop`.

---

### OrderDetailsPage (Bestellungsdetails) (`/account/orders/:id`)

**Schutz:**
- Prüft strikt, ob `order.userId === user.uid` (oder `role === 'admin'`). Andernfalls wird ein Zugriff-verweigert-Screen angezeigt oder zur Startseite weitergeleitet.

**Layout:**
- Zurück-Link "Mein Konto".
- **Oberer Infobereich:** Zusammenfassung der Bestellung (Bestellnummer, Datum, aktueller Status-Badge, Gesamtsumme, Lieferoption).
- **Statusverlauf-Zeitleiste:** Horizontale Statuslinie. Schritte: `Neu` → `Bestätigt` → `Unterwegs` → `Zugestellt`. Die Hervorhebung richtet sich nach dem aktuellen Status. Wenn der Status `cancelled` ist — leuchtet die Statuslinie rot auf und der Stornierungsgrund des Administrators wird gut lesbar darunter angezeigt.
- **Bestellte Artikel:** Tabelle der bestellten Produkte (Foto-Miniatur, Name, Menge, Einzelpreis, Zwischensumme).
- **Empfängerdaten:** Name, E-Mail-Adresse, Telefonnummer des Empfängers.

---

## Kriterien für die Fertigstellung
Siehe Block `Module 05 — User Account` in `progress.md`.
