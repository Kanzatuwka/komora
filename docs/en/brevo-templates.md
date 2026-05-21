# Brevo — Transactional Templates for Komora

> Ready-made templates for DOI and order emails. Created in **Transactional → Templates → New template**, not Marketing.

---

## Before Starting

### 1. Domain Authentication
**Senders, Domains & Dedicated IPs → Domains → Authenticate a domain.**
Brevo will give DNS records (DKIM, SPF, Brevo code). Add to your domain's DNS provider, wait ~30 min, and click "Authenticate".

Until this is done, the `from` address will be replaced with `@brevosend.com`. For development in AI Studio, this is OK, but mandatory before production deployment (Module 08).

### 2. Sender
Create a sender with an address on your domain (e.g., `noreply@komora.ua` or `hello@komora.ua`) in **Senders → Add a sender**. All templates will use this sender.

### 3. General Settings for All 7 Templates
- **Sender email:** your verified sender
- **Sender name:** `Komora`
- **Reply-to:** the farm's active email (where customers can reply)
- **Tracking:** Activate Google Analytics tracking — no (Privacy/GDPR; enable only if you actually analyze campaigns)

---

## Templates

Brevo offers a choice of editors when creating a template. **Choose the HTML editor** ("Code editor" / "Paste your code") — the drag-and-drop editor adds an extra HTML wrapper and complicates manual edits.

---

### Template 1 — DOI Confirmation

Triggered from `useSubscribe` (Module 01) immediately after creating a `subscribers/{id}` document with `pending` status.

**Subject line:**
```
Confirm your subscription to Komora
```

**Preview text:**
```
One click away
```

**HTML body:**
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

**Parameters (params from API):**
```js
{
  confirmUrl: `https://komora.ua/subscription-confirmed?email=${encodeURIComponent(email)}`
}
```

---

### Template 2 — DOI Welcome

Triggered from `/subscription-confirmed` page (Module 01) after updating status to `confirmed`.

**Subject line:**
```
Welcome to Komora!
```

**Preview text:**
```
Your subscription is active
```

**HTML body:**
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

**Parameters:** none required.

⚠ **`{{ unsubscribe }}`** — Brevo replaces automatically. This link is required under GDPR.

---

### Template 3 — Order Placed

Triggered from `useCreateOrder` (Module 03) immediately after order creation.

**Subject line:**
```
Order #{{ params.orderNumber }} received — Komora
```

**Preview text:**
```
Thank you for your order
```

**HTML body:**
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

**Parameters:**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderItemsHtml: order.items
    .map(i => `<div>${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity, order.currency, order.userLanguage)}</div>`)
    .join(''),
  total: formatPrice(order.total, order.currency, order.userLanguage),
  deliveryInfo: order.deliveryMethod === 'delivery'
    ? `Delivery: ${order.address}`
    : `Pickup: ${pickupAddress.label}, ${pickupAddress.address}`
}
```

---

### Templates 4-7 — Status Changes

All four have the same structure. Create them one by one, changing only the **subject** and **statusMessage** in HTML.

**Shared HTML (insert your subject and statusMessage):**

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

              <!-- ⬇ THIS BLOCK CHANGES FOR EACH STATUS -->
              <p style="margin:16px 0;padding:16px;background-color:#f7f1e3;border-left:4px solid #5a6f3f;font-size:16px;line-height:1.6;">
                {{ params.statusMessage }}
              </p>
              <!-- ⬆ -->
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

#### Template 4 — Confirmed
- **Subject:** `Order #{{ params.orderNumber }} confirmed`
- **statusMessage:**
  ```
  We've confirmed your order and are preparing it now. We'll get in touch as soon as it's ready for delivery or pickup.
  ```

#### Template 5 — In Transit
- **Subject:** `Order #{{ params.orderNumber }} is on its way`
- **statusMessage:**
  ```
  Your order has been handed over for delivery. It will be with you soon.
  ```

#### Template 6 — Delivered
- **Subject:** `Order #{{ params.orderNumber }} delivered`
- **statusMessage:**
  ```
  Your order has been delivered. Thank you for choosing Komora! We'd appreciate your feedback.
  ```

#### Template 7 — Cancelled
- **Subject:** `Order #{{ params.orderNumber }} cancelled`
- **statusMessage:** For cancellation, it is recommended to insert the reason as a separate parameter. **Change the HTML block:**
  ```html
  <p style="margin:16px 0;padding:16px;background-color:#fff3f3;border-left:4px solid #9c2b3f;font-size:16px;line-height:1.6;">
    Unfortunately, your order has been cancelled.<br><br>
    <strong>Reason:</strong> {{ params.cancelReason }}<br><br>
    If you have any questions, just reply to this email.
  </p>
  ```

**Parameters for Templates 4-7:**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderId: orderId,
  statusMessage: '...', // text from the corresponding template above (except for cancelled)
  cancelReason: order.cancelReason // only for template 7
}
```

---

## How to Get Template IDs

After creating a template, Brevo displays its ID in the list under **Transactional → Templates**. Copy them to `.env.local`:

```
VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID=1
VITE_BREVO_DOI_WELCOME_TEMPLATE_ID=2
VITE_BREVO_ORDER_PLACED_TEMPLATE_ID=3
VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID=4
VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID=5
VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID=6
VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID=7
```
