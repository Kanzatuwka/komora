# Modul 06 — Admin-Bereich: Kernfunktionen & Bestellungen

> Zusammen mit `main.md` laden. Hängt von Modul 00, 02, 03, 05 ab.

---

## Was wir bauen
1. Gemeinsames Layout für den Administrator-Bereich (`AdminLayout`) mit Seitenleisten-Navigation.
2. Analytics-Dashboard `/admin` mit Anzeige von Schlüsselkennzahlen (Metrics) und Umsatzdiagrammen (unter Verwendung von `recharts` / `d3`).
3. Bestellungsverwaltung `/admin/orders` (Auflistung, Filterung).
4. Bestelldetailseite `/admin/orders/:id` mit Statussteuerungsleiste und Stornierungs-Modal.

---

## Zu erstellende Dateien

### Layout
- `src/features/admin/components/AdminLayout.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/AdminSidebar.jsx`

### Dashboard & Analytics
- `src/features/admin/pages/DashboardPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/StatsGrid.jsx` (Metric-Karten)
- `src/features/admin/components/SalesChart.jsx`
- `src/features/admin/components/RecentOrdersList.jsx`

### Bestellungsverwaltung
- `src/features/admin/pages/OrdersPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/pages/OrderDetailsPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/OrdersTable.jsx`
- `src/features/admin/components/OrderStatusBadge.jsx`
- `src/features/admin/components/CancelOrderModal.jsx`
- `src/features/admin/components/OrderStatusStepper.jsx`

---

## Details zur Implementierung

### AdminLayout
- **Schutz:** Überprüfung von `ProtectedRoute role === 'admin'`. Blockiert unberechtigte Benutzer und leitet sie zurück zu `/` weiter (Modul 02).
- Enthält auf der linken Seite das Navigationsmenü `AdminSidebar` (feste Liste zu den Funktions-Modulen) und rechts den Arbeitsbereich `<Outlet />`.
- Links in der Seitenleiste:
  - Dashboard (`/admin`)
  - Bestellungen (`/admin/orders`)
  - Produkte (`/admin/products`)
  - Blog (`/admin/blog`)
  - Newsletter (`/admin/newsletter`)
  - Einstellungen (`/admin/settings`)
- Zeigt den Namen des aktuellen Administrators und einen Link "Zur Website" → `/` an.

---

### DashboardPage (`/admin` Arbeitsbereich)

**1. StatsGrid-Karten:**
- **Gesamtumsatz:** Summe aller Bestellungen mit dem Status `confirmed`, `in_transit`, `delivered` (exklusive `new`, `cancelled`).
- **Anzahl der Bestellungen:** Gesamtzahl der Dokumente in `/orders`.
- **Aktive Abonnenten:** Anzahl der `/subscribers` mit dem Status `confirmed`.
- **Durchschnittlicher Warenkorbwert:** Gesamtumsatz dividiert durch die Anzahl der Verkäufe.
Zeigt beim Laden entsprechende Skeletons an.

**2. SalesChart (Umsatzdiagramm mit `recharts`):**
- LineChart oder BarChart zur Darstellung des monatlichen Umsatzes. Die Bestelldaten werden lokal anhand des Feldes `createdAt` (aggregiert nach Monaten) ausgewertet. Das Diagramm verfügt über flüssige Animationen beim Rendern.

**3. RecentOrdersList (Neueste Bestellungen):**
- Tabelle mit den 5 neuesten Bestellungen im System. Jede Reihe verfügt über einen direkten Link zur Bestellseite `/admin/orders/:id`.

---

### OrdersPage (`/admin/orders`)
- Hauptansicht: Tabelle mit allen Bestellungen auf der Plattform.
- Filterleiste: Schnellauswahl nach Status (`Alle`, `Neu`, `Bestätigt`, `Unterwegs`, `Zugestellt`, `Storniert`).
- Tabellenspalten:
  - Bestellnummer (Kurzform)
  - Datum und Uhrzeit
  - Name des Kunden
  - Versandart (Symbol + Text)
  - Gesamtsumme
  - Status-Badge
  - Direkt-Link zur Detailansicht → Details (`/admin/orders/:id`)
- Volle Unterstützung für onSnapshot für Echtzeit-Listen-Updates.

---

### OrderDetailsPage (`/admin/orders/:id`)
- Zeigt dieselbe Detailtabelle der Bestellung wie für den Kunden (Artikel, Preise, Zwischensummen, Benutzerhinweise), verfügt jedoch zusätzlich über das **Admin-Status-Steuerungs-Panel**.

#### Status-Schnittstellenregeln (State Machine)
Der Status einer Bestellung kann sich nur in vordefinierte Richtungen bewegen:

```
new ──> confirmed ──> in_transit ──> delivered
 │          │            │
 └───> cancelled <───────┘
```

**Zustands-Steuerungsbuttons:**
- Wenn Status `new` is → Button "Bestellung bestätigen" (Status wird `confirmed`) und "Bestellung stornieren" anzeigen.
- Wenn Status `confirmed` ist → Button "An Versand übergeben" (Status wird `in_transit`) und "Bestellung stornieren" anzeigen.
- Wenn Status `in_transit` ist → Button "Als zugestellt markieren" (Status wird `delivered`) und "Bestellung stornieren" anzeigen.
- Wenn Status `delivered` oder `cancelled` ist → keine Steuerungsschaltflächen mehr anzeigen (Endzustände).

#### Stornierungs-Workflow
- Ein Klick auf "Bestellung stornieren" öffnet das `CancelOrderModal`.
- Enthält ein Pflicht-Textfeld: "Grund für die Stornierung angeben *".
- Ein Klick auf "Stornierung bestätigen" schreibt das Update: `status: 'cancelled', cancelReason: text`. Schließt das Modal, ändert den Status-Badge auf Rot und löst den E-Mail-Versand aus.

---

### E-Mail-Status-Benachrichtigungen versenden

Beim Ändern des Bestellstatus wird automatisch eine entsprechende E-Mail-Nachricht an den Kunden gesendet (verwendet den Helfer `getTemplateId` aus Modul 09).

```js
const handleUpdateStatus = async (newStatus) => {
  // 1. Status im Dokument in Firestore aktualisieren
  await updateDoc(doc(db, 'orders', id), { status: newStatus });

  // 2. Vorlagen-ID basierend auf der Bestell-Sprache auflösen
  const templateId = getTemplateId('order_' + newStatus, order.userLanguage);

  // 3. E-Mail über Brevo-Client senden
  await brevo.sendTransactional({
    to: [{ email: order.userEmail, name: order.userName }],
    templateId,
    params: {
      customerName: order.userName,
      orderNumber: id.slice(0, 8).toUpperCase(),
      orderId: id,
      statusMessage: t('admin:orderStatus.' + newStatus + 'Message', { lng: order.userLanguage }),
      cancelReason: order.cancelReason || '', // nur für Stornierung
    },
  });

  showToast({ message: 'Bestellstatus aktualisiert und Kunde benachrichtigt', type: 'success' });
};
```

---

## Kriterien für die Fertigstellung
Siehe Block `Module 06 — Admin Panel Core & Orders` in `progress.md`.
