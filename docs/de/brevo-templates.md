# Brevo — Transaktionsvorlagen für Komora

> Fertige Vorlagen für DOI- und Bestell-E-Mails. Erstellt unter **Transactional → Templates → New template**, nicht Marketing.

---

## Vor dem Start

### 1. Domain-Authentifizierung
**Senders, Domains & Dedicated IPs → Domains → Authenticate a domain.**
Brevo stellt Ihnen DNS-Einträge zur Verfügung (DKIM, SPF, Brevo-Code). Fügen Sie diese beim DNS-Anbieter Ihrer Domain hinzu, warten Sie etwa 30 Minuten und klicken Sie auf "Authenticate".

Solange dies nicht abgeschlossen ist, wird die Absenderadresse (`from`) durch `@brevosend.com` ersetzt. Für die Entwicklung in AI Studio ist dies in Ordnung, vor dem Produktions-Deploy (Modul 08) jedoch zwingend erforderlich.

### 2. Absender (Sender)
Erstellen Sie einen Absender mit einer E-Mail-Adresse Ihrer Domain (z.B. `noreply@komora.ua` oder `hello@komora.ua`) unter **Senders → Add a sender**. Alle Vorlagen verwenden diesen Absender.

### 3. Allgemeine Einstellungen für alle 7 Vorlagen
- **Sender email (Absender-E-Mail):** Ihr verifizierter Absender
- **Sender name (Absendername):** `Komora`
- **Reply-to (Antwort an):** aktive E-Mail des Hofes (an die Kunden zurückschreiben können)
- **Tracking:** Google Analytics-Tracking aktivieren — Nein (Datenschutz/DSGVO; nur aktivieren, wenn Sie Kampagnen tatsächlich analysieren)

---

## Vorlagen

Brevo bietet beim Erstellen einer Vorlage die Wahl des Editors an. **Wählen Sie den HTML-Editor** ("Code-Editor" / "Code einfügen") — der Drag-and-Drop-Editor fügt zusätzlichen Wrapper-HTML-Code hinzu und erschwert manuelle Änderungen.

---

### Vorlage 1 — DOI-Bestätigung

Aufgerufen von `useSubscribe` (Modul 01) unmittelbar nach dem Erstellen des Dokuments `subscribers/{id}` mit dem Status `pending`.

**Betreff:**
```
Bestätigen Sie Ihre Anmeldung bei Komora
```

**Vorschautext:**
```
Nur noch ein Klick
```

**HTML-Inhalt:**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anmeldung bestätigen</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;letter-spacing:0.5px;">Komora</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#3a3a3a;font-weight:normal;">Nur noch ein Schritt</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Vielen Dank für Ihr Interesse an Komora! Bitte bestätigen Sie Ihre E-Mail-Adresse, damit wir Ihnen neue Rezepte und Neuigkeiten vom Hof senden können.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#888;">
                Wenn Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 32px;text-align:center;">
              <a href="{{ params.confirmUrl }}" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:16px;">
                Anmeldung bestätigen
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;line-height:1.5;">
                Falls die Schaltfläche nicht funktioniert, kopieren Sie den Link in Ihren Browser:<br>
                <a href="{{ params.confirmUrl }}" style="color:#5a6f3f;word-break:break-all;">{{ params.confirmUrl }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">
                © Komora · Familienhof
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Parameter (params aus der API):**
```js
{
  confirmUrl: `https://komora.ua/subscription-confirmed?email=${encodeURIComponent(email)}`
}
```

---

### Vorlage 2 — DOI-Willkommen

Aufgerufen von der Seite `/subscription-confirmed` (Modul 01) nach der Aktualisierung des Status auf `confirmed`.

**Betreff:**
```
Willkommen bei Komora!
```

**Vorschautext:**
```
Ihr Abonnement ist aktiv
```

**HTML-Inhalt:**
```html
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;">Komora</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#3a3a3a;font-weight:normal;">Willkommen!</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Ihr Abonnement ist bestätigt. Sie erfahren als Erste von neuen Rezepten, saisonalen Neuigkeiten und Tipps aus unserer Speisekammer.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                In der Zwischenzeit schauen Sie gerne vorbei:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://komora.ua/blog" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;margin:4px;">
                Rezepte lesen
              </a>
              <a href="https://komora.ua/shop" style="display:inline-block;background-color:#8b6f47;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;margin:4px;">
                Zum Shop
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">
                © Komora · Familienhof<br>
                <a href="{{ unsubscribe }}" style="color:#888;">Abmelden</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Parameter:** keine erforderlich.

⚠ **`{{ unsubscribe }}`** — Brevo ersetzt dies automatisch. Dieser Link ist nach DSGVO verpflichtend.

---

### Vorlage 3 — Bestellung eingegangen

Aufgerufen von `useCreateOrder` (Modul 03) sofort nach der Bestellung.

**Betreff:**
```
Bestellung Nr. {{ params.orderNumber }} eingegangen — Komora
```

**Vorschautext:**
```
Vielen Dank für Ihre Bestellung
```

**HTML-Inhalt:**
```html
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;">Komora</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#3a3a3a;font-weight:normal;">Vielen Dank für Ihre Bestellung, {{ params.customerName }}!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#888;">Bestellung Nr. {{ params.orderNumber }}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Wir haben Ihre Bestellung erhalten und melden uns in Kürze mit der Bestätigung.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 16px;">
              <h3 style="margin:0 0 12px;font-size:16px;color:#5a6f3f;font-weight:normal;border-bottom:1px solid #e5e0d0;padding-bottom:8px;">Ihre Bestellung</h3>
              <div style="font-size:14px;line-height:1.8;">
                {{ params.orderItemsHtml }}
              </div>
              <p style="margin:16px 0 0;font-size:16px;text-align:right;border-top:1px solid #e5e0d0;padding-top:12px;">
                <strong>Gesamt: {{ params.total }}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h3 style="margin:16px 0 8px;font-size:16px;color:#5a6f3f;font-weight:normal;">Lieferart</h3>
              <p style="margin:0;font-size:14px;line-height:1.6;">{{ params.deliveryInfo }}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#888;">
                Verfolgen Sie den Status in <a href="https://komora.ua/account" style="color:#5a6f3f;">Ihrem Konto</a>
              </p>
              <p style="margin:0;font-size:12px;color:#888;">© Komora · Familienhof</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Parameter:**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderItemsHtml: order.items
    .map(i => `<div>${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity, order.currency, order.userLanguage)}</div>`)
    .join(''),
  total: formatPrice(order.total, order.currency, order.userLanguage),
  deliveryInfo: order.deliveryMethod === 'delivery'
    ? `Lieferung: ${order.address}`
    : `Abholung: ${pickupAddress.label}, ${pickupAddress.address}`
}
```

---

### Vorlagen 4-7 — Statusänderungen

Alle vier Statusvorlagen haben die gleiche HTML-Struktur. Ändern Sie einfach den Betreff und die `statusMessage` im HTML.

**Gemeinsames HTML (Betreff und statusMessage entsprechend eintragen):**

```html
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;">Komora</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#3a3a3a;font-weight:normal;">{{ params.customerName }}, eine Neuigkeit!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#888;">Bestellung Nr. {{ params.orderNumber }}</p>

              <!-- ⬇ DIESER BLOCK ÄNDERT SICH FÜR JEDEN STATUS -->
              <p style="margin:16px 0;padding:16px;background-color:#f7f1e3;border-left:4px solid #5a6f3f;font-size:16px;line-height:1.6;">
                {{ params.statusMessage }}
              </p>
              <!-- ⬆ -->
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://komora.ua/account/orders/{{ params.orderId }}" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">
                Bestellung anzeigen
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">© Komora · Familienhof</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

#### Vorlage 4 — Bestätigt
- **Betreff:** `Bestellung Nr. {{ params.orderNumber }} bestätigt`
- **statusMessage:**
  ```
  Wir haben Ihre Bestellung bestätigt und bereiten sie nun vor. Wir melden uns, sobald sie zur Lieferung oder Abholung bereit ist.
  ```

#### Vorlage 5 — Unterwegs
- **Betreff:** `Bestellung Nr. {{ params.orderNumber }} ist unterwegs`
- **statusMessage:**
  ```
  Ihre Bestellung wurde an die Lieferung übergeben. Sie wird bald bei Ihnen sein.
  ```

#### Vorlage 6 — Zugestellt
- **Betreff:** `Bestellung Nr. {{ params.orderNumber }} zugestellt`
- **statusMessage:**
  ```
  Ihre Bestellung wurde zugestellt. Vielen Dank, dass Sie Komora gewählt haben! Wir würden uns über Ihr Feedback freuen.
  ```

#### Vorlage 7 — Storniert (Spezial-Layout)
- **Betreff:** `Bestellung Nr. {{ params.orderNumber }} storniert`
- **statusMessage:** Ersetzen Sie den standardmäßigen `<p>` Block durch folgende rote Box:
  ```html
  <p style="margin:16px 0;padding:16px;background-color:#fff3f3;border-left:4px solid #9c2b3f;font-size:16px;line-height:1.6;">
    Leider wurde Ihre Bestellung storniert.<br><br>
    <strong>Grund:</strong> {{ params.cancelReason }}<br><br>
    Bei Fragen antworten Sie einfach auf diese E-Mail.
  </p>
  ```

**Parameter für die Vorlagen 4-7:**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderId: orderId,
  statusMessage: '...', // Text der entsprechenden Vorlage oben (außer für storniert)
  cancelReason: order.cancelReason // nur für Vorlage 7
}
```

---

## Template-IDs erhalten

Nach dem Erstellen von Vorlagen zeigt Brevo deren IDs in der Liste unter **Transactional → Templates** an. Kopieren Sie diese in Ihre `.env.local`:

```
VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID=1
VITE_BREVO_DOI_WELCOME_TEMPLATE_ID=2
VITE_BREVO_ORDER_PLACED_TEMPLATE_ID=3
VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID=4
VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID=5
VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID=6
VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID=7
```
