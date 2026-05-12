# Brevo Templates — EN та DE версії

> UA версії — у `brevo-templates.md`. Тут — EN і DE переклади для решти 14 шаблонів.

---

## Загальні правила

- **Brand name** залишається `Komora` (не перекладається).
- **Sender name**: `Komora` для всіх 21 шаблону.
- **Sender email і Reply-to**: ті самі що для UA версій.
- **HTML структура** ідентична UA шаблонам — змінюється лише текст всередині. CSS-палітра (farm-green, farm-cream, farm-berry) — без змін.
- **URL-и у листах**: замінити `https://komora.ua` на твій реальний домен перед публікацією.
- **Tone of voice**:
  - EN — нейтрально-теплий, прямий ("Thank you for...", не "Hey there!").
  - DE — використовується `Sie` (ввічливе ви) як стандарт для бізнес-комунікації. Якщо бренд вирішить перейти на `Du` — це окреме рішення власника.

---

## Naming convention у Brevo Templates

Щоб не плутатися серед 21 шаблону, давай чітку назву кожному при створенні:

```
DOI Confirm UA      DOI Confirm EN      DOI Confirm DE
DOI Welcome UA      DOI Welcome EN      DOI Welcome DE
Order Placed UA     Order Placed EN     Order Placed DE
Order Confirmed UA  Order Confirmed EN  Order Confirmed DE
Order InTransit UA  Order InTransit EN  Order InTransit DE
Order Delivered UA  Order Delivered EN  Order Delivered DE
Order Cancelled UA  Order Cancelled EN  Order Cancelled DE
```

ID кожного шаблону → відповідна змінна у `.env.local`.

---

## Template 1 — DOI Confirmation

### EN version

**Subject:** `Confirm your subscription to Komora`

**Preview text:** `One click away`

**HTML:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your subscription</title>
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
              <h2 style="margin:0 0 16px;font-size:22px;color:#3a3a3a;font-weight:normal;">One more step</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Thank you for your interest in Komora! Please confirm your email address so we can send you new recipes and farm updates.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#888;">
                If you didn't subscribe, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 32px;text-align:center;">
              <a href="{{ params.confirmUrl }}" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:16px;">
                Confirm subscription
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;line-height:1.5;">
                If the button doesn't work, copy this link into your browser:<br>
                <a href="{{ params.confirmUrl }}" style="color:#5a6f3f;word-break:break-all;">{{ params.confirmUrl }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">
                © Komora · family farm
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

### DE version

**Subject:** `Bestätigen Sie Ihre Anmeldung bei Komora`

**Preview text:** `Nur noch ein Klick`

**HTML:**
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

---

## Template 2 — DOI Welcome

### EN version

**Subject:** `Welcome to Komora!`

**Preview text:** `Your subscription is active`

**HTML:**
```html
<!DOCTYPE html>
<html lang="en">
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
              <h2 style="margin:0 0 16px;font-size:22px;color:#3a3a3a;font-weight:normal;">Welcome!</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Your subscription is confirmed. You'll be among the first to hear about new recipes, seasonal updates, and tips from our pantry.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                In the meantime, take a look:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://komora.ua/blog" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;margin:4px;">
                Read recipes
              </a>
              <a href="https://komora.ua/shop" style="display:inline-block;background-color:#8b6f47;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;margin:4px;">
                Visit shop
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">
                © Komora · family farm<br>
                <a href="{{ unsubscribe }}" style="color:#888;">Unsubscribe</a>
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

### DE version

**Subject:** `Willkommen bei Komora!`

**Preview text:** `Ihr Abonnement ist aktiv`

**HTML:**
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

---

## Template 3 — Order Placed

### EN version

**Subject:** `Order #{{ params.orderNumber }} received — Komora`

**Preview text:** `Thank you for your order`

**HTML:**
```html
<!DOCTYPE html>
<html lang="en">
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
              <h2 style="margin:0 0 8px;font-size:22px;color:#3a3a3a;font-weight:normal;">Thank you for your order, {{ params.customerName }}!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#888;">Order #{{ params.orderNumber }}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                We've received your order and will contact you with confirmation shortly.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 16px;">
              <h3 style="margin:0 0 12px;font-size:16px;color:#5a6f3f;font-weight:normal;border-bottom:1px solid #e5e0d0;padding-bottom:8px;">Your order</h3>
              <div style="font-size:14px;line-height:1.8;">
                {{ params.orderItemsHtml }}
              </div>
              <p style="margin:16px 0 0;font-size:16px;text-align:right;border-top:1px solid #e5e0d0;padding-top:12px;">
                <strong>Total: {{ params.total }}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h3 style="margin:16px 0 8px;font-size:16px;color:#5a6f3f;font-weight:normal;">Delivery method</h3>
              <p style="margin:0;font-size:14px;line-height:1.6;">{{ params.deliveryInfo }}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#888;">
                Track your order status in <a href="https://komora.ua/account" style="color:#5a6f3f;">your account</a>
              </p>
              <p style="margin:0;font-size:12px;color:#888;">© Komora · family farm</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### DE version

**Subject:** `Bestellung Nr. {{ params.orderNumber }} eingegangen — Komora`

**Preview text:** `Vielen Dank für Ihre Bestellung`

**HTML:**
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

⚠ **Параметр `total`** змінюється — тепер містить валюту (наприклад `"5.00 €"` або `"$5.00"`), а не просто число. Форматування робиться на стороні коду через `Intl.NumberFormat` перед передачею в template params. Те ж стосується цін у `orderItemsHtml`.

---

## Templates 4-7 — Order Status Changes

Усі чотири статусних шаблони мають однакову HTML-структуру. Зміни лише subject і `statusMessage` (передається через params).

### Спільний HTML — EN

```html
<!DOCTYPE html>
<html lang="en">
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
              <h2 style="margin:0 0 8px;font-size:22px;color:#3a3a3a;font-weight:normal;">{{ params.customerName }}, an update!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#888;">Order #{{ params.orderNumber }}</p>

              <p style="margin:16px 0;padding:16px;background-color:#f7f1e3;border-left:4px solid #5a6f3f;font-size:16px;line-height:1.6;">
                {{ params.statusMessage }}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://komora.ua/account/orders/{{ params.orderId }}" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">
                View order
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">© Komora · family farm</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Спільний HTML — DE

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

              <p style="margin:16px 0;padding:16px;background-color:#f7f1e3;border-left:4px solid #5a6f3f;font-size:16px;line-height:1.6;">
                {{ params.statusMessage }}
              </p>
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

### Subject + statusMessage за статусом

| Status | EN Subject | EN statusMessage (передається у params) |
|--------|-----------|------------------------------------------|
| Confirmed (T4) | `Order #{{ params.orderNumber }} confirmed` | `We've confirmed your order and are preparing it now. We'll get in touch as soon as it's ready for delivery or pickup.` |
| In Transit (T5) | `Order #{{ params.orderNumber }} is on its way` | `Your order has been handed over for delivery. It will be with you soon.` |
| Delivered (T6) | `Order #{{ params.orderNumber }} delivered` | `Your order has been delivered. Thank you for choosing Komora! We'd appreciate your feedback.` |

| Status | DE Subject | DE statusMessage |
|--------|-----------|-------------------|
| Confirmed (T4) | `Bestellung Nr. {{ params.orderNumber }} bestätigt` | `Wir haben Ihre Bestellung bestätigt und bereiten sie nun vor. Wir melden uns, sobald sie zur Lieferung oder Abholung bereit ist.` |
| In Transit (T5) | `Bestellung Nr. {{ params.orderNumber }} ist unterwegs` | `Ihre Bestellung wurde an die Lieferung übergeben. Sie wird bald bei Ihnen sein.` |
| Delivered (T6) | `Bestellung Nr. {{ params.orderNumber }} zugestellt` | `Ihre Bestellung wurde zugestellt. Vielen Dank, dass Sie Komora gewählt haben! Wir würden uns über Ihr Feedback freuen.` |

---

## Template 7 — Order Cancelled (спеціальний)

Цей шаблон використовує модифікований HTML-блок з причиною скасування і червоною стилістикою.

### EN version

**Subject:** `Order #{{ params.orderNumber }} cancelled`

**HTML:** взяти спільний EN HTML (вище), але замінити блок `<p style="...">{{ params.statusMessage }}</p>` на:

```html
<p style="margin:16px 0;padding:16px;background-color:#fff3f3;border-left:4px solid #9c2b3f;font-size:16px;line-height:1.6;">
  Unfortunately, your order has been cancelled.<br><br>
  <strong>Reason:</strong> {{ params.cancelReason }}<br><br>
  If you have any questions, just reply to this email.
</p>
```

### DE version

**Subject:** `Bestellung Nr. {{ params.orderNumber }} storniert`

**HTML:** взяти спільний DE HTML, замінити аналогічний блок на:

```html
<p style="margin:16px 0;padding:16px;background-color:#fff3f3;border-left:4px solid #9c2b3f;font-size:16px;line-height:1.6;">
  Leider wurde Ihre Bestellung storniert.<br><br>
  <strong>Grund:</strong> {{ params.cancelReason }}<br><br>
  Bei Fragen antworten Sie einfach auf diese E-Mail.
</p>
```

---

## Підсумок налаштувань `.env.local`

```
# UA (з brevo-templates.md)
VITE_BREVO_DOI_CONFIRM_UK=1
VITE_BREVO_DOI_WELCOME_UK=2
VITE_BREVO_ORDER_PLACED_UK=3
VITE_BREVO_ORDER_CONFIRMED_UK=4
VITE_BREVO_ORDER_IN_TRANSIT_UK=5
VITE_BREVO_ORDER_DELIVERED_UK=6
VITE_BREVO_ORDER_CANCELLED_UK=7

# EN
VITE_BREVO_DOI_CONFIRM_EN=8
VITE_BREVO_DOI_WELCOME_EN=9
VITE_BREVO_ORDER_PLACED_EN=10
VITE_BREVO_ORDER_CONFIRMED_EN=11
VITE_BREVO_ORDER_IN_TRANSIT_EN=12
VITE_BREVO_ORDER_DELIVERED_EN=13
VITE_BREVO_ORDER_CANCELLED_EN=14

# DE
VITE_BREVO_DOI_CONFIRM_DE=15
VITE_BREVO_DOI_WELCOME_DE=16
VITE_BREVO_ORDER_PLACED_DE=17
VITE_BREVO_ORDER_CONFIRMED_DE=18
VITE_BREVO_ORDER_IN_TRANSIT_DE=19
VITE_BREVO_ORDER_DELIVERED_DE=20
VITE_BREVO_ORDER_CANCELLED_DE=21
```

(Реальні ID будуть інші — Brevo генерує їх послідовно при створенні.)

---

## Тестування

У Brevo `Preview & test` → `Send a test` для кожного шаблону з тестовими params. Тестові значення `confirmUrl`, `customerName`, `orderNumber` тощо вводяться у формі test.

**Чек-перевірка кожного:**
- [ ] Subject рендериться з підставленим `{{ params.X }}`
- [ ] Кнопки CTA працюють, ведуть на правильний URL (з твоїм продакшн-доменом)
- [ ] У DE-шаблонах — німецький `Sie` всюди, без перемішування з `Du`
- [ ] У EN-шаблонах — Order # (з решіткою) у subject, не "Order No."
- [ ] HTML-параметр `orderItemsHtml` (для Template 3) рендериться як HTML, не як текст
- [ ] `{{ unsubscribe }}` у Template 2 показує реальний лінк відписки
- [ ] Cancelled-шаблон використовує червоний колір `#9c2b3f`, не зелений
