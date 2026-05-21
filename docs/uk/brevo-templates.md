# Brevo — Transactional Templates для Комори

> Готові шаблони для DOI і order emails. Створюються у **Transactional → Templates → New template**, не Marketing.

---

## Перед стартом

### 1. Domain authentication
**Senders, Domains & Dedicated IPs → Domains → Authenticate a domain.**
Brevo дасть DNS записи (DKIM, SPF, Brevo code). Додаєш у DNS-провайдера домену, чекаєш ~30 хв, тиснеш "Authenticate".

Поки не зроблено — `from` буде замінений на `@brevosend.com`. Для розробки в AI Studio це OK, але перед production-деплоєм (Module 08) обов'язково.

### 2. Sender
Створити sender з адресою на твоєму домені (наприклад `noreply@komora.ua` або `hello@komora.ua`) у **Senders → Add a sender**. Усі шаблони використовуватимуть цей sender.

### 3. Спільні налаштування для всіх 7 шаблонів
- **Sender email:** твій верифікований sender
- **Sender name:** `Комора`
- **Reply-to:** живий email ферми (куди клієнти можуть писати)
- **Tracking:** Activate Google Analytics tracking — ні (Privacy/GDPR; вмикай тільки якщо реально аналізуєш кампанії)

---

## Шаблони

Brevo дає вибір редактора при створенні шаблону. **Обери HTML editor** (раз "Code editor" / "Paste your code") — drag-and-drop редактор робить додатковий wrapper-HTML і ускладнює правки.

---

### Template 1 — DOI Confirmation

Викликається з `useSubscribe` (Module 01) одразу після створення документа `subscribers/{id}` зі статусом `pending`.

**Subject line:**
```
Підтвердьте підписку на Комору
```

**Preview text:**
```
Залишився один клік
```

**HTML body:**
```html
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Підтвердьте підписку</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;letter-spacing:0.5px;">Комора</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#3a3a3a;font-weight:normal;">Залишився один крок</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Дякуємо що цікавитеся Коморою! Підтвердьте свою електронну адресу, щоб ми могли надсилати вам нові рецепти та новинки з ферми.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#888;">
                Якщо ви не підписувалися — просто проігноруйте цей лист.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 32px;text-align:center;">
              <a href="{{ params.confirmUrl }}" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:16px;">
                Підтвердити підписку
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;line-height:1.5;">
                Якщо кнопка не працює, скопіюйте посилання у браузер:<br>
                <a href="{{ params.confirmUrl }}" style="color:#5a6f3f;word-break:break-all;">{{ params.confirmUrl }}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">
                © Комора · сімейна ферма
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

**Параметри (params з API):**
```js
{
  confirmUrl: `https://komora.ua/subscription-confirmed?email=${encodeURIComponent(email)}`
}
```

---

### Template 2 — DOI Welcome

Викликається з `/subscription-confirmed` сторінки (Module 01) після оновлення статусу на `confirmed`.

**Subject line:**
```
Ласкаво просимо до Комори!
```

**Preview text:**
```
Ваша підписка активна
```

**HTML body:**
```html
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;">Комора</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#3a3a3a;font-weight:normal;">Ласкаво просимо!</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Підписку підтверджено. Тепер ви будете першими дізнаватися про нові рецепти, сезонні новинки та поради з нашої комори.
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                А поки що — загляньте до нас:
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://komora.ua/blog" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;margin:4px;">
                Читати рецепти
              </a>
              <a href="https://komora.ua/shop" style="display:inline-block;background-color:#8b6f47;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;margin:4px;">
                До магазину
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">
                © Комора · сімейна ферма<br>
                <a href="{{ unsubscribe }}" style="color:#888;">Відписатися</a>
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

**Параметри:** не потрібні.

⚠ **`{{ unsubscribe }}`** — Brevo замінює автоматично. Цей лінк обов'язковий за GDPR.

---

### Template 3 — Order Placed

Викликається з `useCreateOrder` (Module 03) одразу після створення замовлення.

**Subject line:**
```
Замовлення №{{ params.orderNumber }} прийнято — Комора
```

**Preview text:**
```
Дякуємо за замовлення
```

**HTML body:**
```html
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;">Комора</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#3a3a3a;font-weight:normal;">Дякуємо за замовлення, {{ params.customerName }}!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#888;">Замовлення №{{ params.orderNumber }}</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                Ми отримали ваше замовлення і скоро зв'яжемося з підтвердженням.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 16px;">
              <h3 style="margin:0 0 12px;font-size:16px;color:#5a6f3f;font-weight:normal;border-bottom:1px solid #e5e0d0;padding-bottom:8px;">Ваше замовлення</h3>
              <div style="font-size:14px;line-height:1.8;">
                {{ params.orderItemsHtml }}
              </div>
              <p style="margin:16px 0 0;font-size:16px;text-align:right;border-top:1px solid #e5e0d0;padding-top:12px;">
                <strong>Сума: {{ params.total }} грн</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <h3 style="margin:16px 0 8px;font-size:16px;color:#5a6f3f;font-weight:normal;">Спосіб отримання</h3>
              <p style="margin:0;font-size:14px;line-height:1.6;">{{ params.deliveryInfo }}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#888;">
                Слідкуйте за статусом у <a href="https://komora.ua/account" style="color:#5a6f3f;">особистому кабінеті</a>
              </p>
              <p style="margin:0;font-size:12px;color:#888;">© Комора · сімейна ферма</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Параметри:**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderItemsHtml: order.items
    .map(i => `<div>${i.name} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} грн</div>`)
    .join(''),
  total: order.total.toFixed(2),
  deliveryInfo: order.deliveryMethod === 'delivery'
    ? `Доставка: ${order.address}`
    : `Самовивіз: ${pickupAddress.label}, ${pickupAddress.address}`
}
```

⚠ Brevo підтримує HTML у params — `orderItemsHtml` рендериться як HTML (без екранування).

---

### Templates 4-7 — Status Changes

Усі чотири мають однакову структуру. Створюй один за іншим, змінюючи лише **subject** і **statusMessage** у HTML.

**Спільний HTML (підстав свій subject і statusMessage):**

```html
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f7f1e3;font-family:Georgia,serif;color:#3a3a3a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f1e3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 16px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#5a6f3f;font-weight:normal;">Комора</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 40px 24px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#3a3a3a;font-weight:normal;">{{ params.customerName }}, є новина!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#888;">Замовлення №{{ params.orderNumber }}</p>

              <!-- ⬇ ЦЕЙ БЛОК ЗМІНЮЄТЬСЯ ДЛЯ КОЖНОГО СТАТУСУ -->
              <p style="margin:16px 0;padding:16px;background-color:#f7f1e3;border-left:4px solid #5a6f3f;font-size:16px;line-height:1.6;">
                {{ params.statusMessage }}
              </p>
              <!-- ⬆ -->
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://komora.ua/account/orders/{{ params.orderId }}" style="display:inline-block;background-color:#5a6f3f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;">
                Переглянути замовлення
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background-color:#f7f1e3;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;">© Комора · сімейна ферма</p>
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
- **Subject:** `Замовлення №{{ params.orderNumber }} підтверджено`
- **statusMessage** (передається через params):
  ```
  Ми підтвердили ваше замовлення і починаємо його готувати. Ми зв'яжемося з вами щойно воно буде готове до доставки або самовивозу.
  ```

#### Template 5 — In Transit
- **Subject:** `Замовлення №{{ params.orderNumber }} вирушило до вас`
- **statusMessage:**
  ```
  Ваше замовлення передано в доставку. Скоро буде у вас.
  ```

#### Template 6 — Delivered
- **Subject:** `Замовлення №{{ params.orderNumber }} доставлено`
- **statusMessage:**
  ```
  Замовлення доставлено. Дякуємо що обрали Комору! Будемо вдячні за ваш відгук.
  ```

#### Template 7 — Cancelled
- **Subject:** `Замовлення №{{ params.orderNumber }} скасовано`
- **statusMessage:** для скасування доцільно вставити причину окремим параметром. **Зміни блок у HTML:**
  ```html
  <p style="margin:16px 0;padding:16px;background-color:#fff3f3;border-left:4px solid #9c2b3f;font-size:16px;line-height:1.6;">
    На жаль, ваше замовлення скасовано.<br><br>
    <strong>Причина:</strong> {{ params.cancelReason }}<br><br>
    Якщо у вас є питання — напишіть нам у відповідь на цей лист.
  </p>
  ```

**Параметри для Templates 4-7:**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderId: orderId,
  statusMessage: '...', // текст з відповідного шаблона вище (не для cancelled)
  cancelReason: order.cancelReason // тільки для template 7
}
```

---

## Як отримати template ID

Після створення шаблону Brevo показує його ID у списку **Transactional → Templates**. Скопіюй у `.env.local`:

```
VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID=1
VITE_BREVO_DOI_WELCOME_TEMPLATE_ID=2
VITE_BREVO_ORDER_PLACED_TEMPLATE_ID=3
VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID=4
VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID=5
VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID=6
VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID=7
```

---

## Виклик з коду (для shared/lib/brevo.js)

```js
const BREVO_API = 'https://api.brevo.com/v3';

async function sendTransactional({ to, templateId, params }) {
  const response = await fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': import.meta.env.VITE_BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: to }],
      templateId: Number(templateId),
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo send failed: ${response.status}`);
  }
  return response.json();
}
```

**Приклади викликів з модулів:**

```js
// Module 01 — DOI confirmation
await sendTransactional({
  to: email,
  templateId: import.meta.env.VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID,
  params: {
    confirmUrl: `${window.location.origin}/subscription-confirmed?email=${encodeURIComponent(email)}`
  }
});

// Module 03 — Order placed
await sendTransactional({
  to: order.userEmail,
  templateId: import.meta.env.VITE_BREVO_ORDER_PLACED_TEMPLATE_ID,
  params: {
    customerName: order.userName,
    orderNumber: orderId.slice(0, 8).toUpperCase(),
    orderItemsHtml: order.items.map(i => `<div>${i.name} × ${i.quantity} — ${(i.price * i.quantity).toFixed(2)} грн</div>`).join(''),
    total: order.total.toFixed(2),
    deliveryInfo: order.deliveryMethod === 'delivery'
      ? `Доставка: ${order.address}`
      : `Самовивіз: ${pickupLabel}`
  }
});

// Module 06 — Status changed (на прикладі confirmed)
const STATUS_TEMPLATES = {
  confirmed: import.meta.env.VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID,
  in_transit: import.meta.env.VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID,
  delivered: import.meta.env.VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID,
  cancelled: import.meta.env.VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID,
};

const STATUS_MESSAGES = {
  confirmed: 'Ми підтвердили ваше замовлення і починаємо його готувати...',
  in_transit: 'Ваше замовлення передано в доставку...',
  delivered: 'Замовлення доставлено. Дякуємо що обрали Комору!',
};

await sendTransactional({
  to: order.userEmail,
  templateId: STATUS_TEMPLATES[newStatus],
  params: {
    customerName: order.userName,
    orderNumber: orderId.slice(0, 8).toUpperCase(),
    orderId: orderId,
    statusMessage: STATUS_MESSAGES[newStatus] || '',
    cancelReason: cancelReason || '',
  }
});
```

---

## Тестування шаблонів у Brevo

У редакторі шаблону кнопка **Preview & test** (зверху справа на твоєму скріншоті). Можна:
1. Натиснути **Preview** — побачити рендер з тестовими даними.
2. **Send a test** — Brevo надішле тестовий лист з підставленими params на твій email.

⚠ Якщо в preview бачиш `{{ params.customerName }}` буквально (не підставлено) — це означає що шаблон потрапив у Marketing замість Transactional. Marketing-шаблони не підтримують `{{ params.X }}` — лише `{{ contact.X }}`.

---

## GDPR і обов'язкові елементи

- **DOI Confirmation і Welcome** — обов'язково мати `{{ unsubscribe }}` лінк (Brevo додає сам у footer marketing-листів, але в transactional треба явно).
- **Order emails** — не потребують unsubscribe (це сервісні листи, не маркетингові).
- **Footer** — назва і контакт організації. Для повної відповідності додай адресу ферми.
