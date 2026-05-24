# Інструкція з міграції на власний хостинг (Cloudflare Pages) 🚀

Цей посібник містить вичерпний покроковий план міграції нашої платформи **Komora** на власний хостинг **Cloudflare Pages**, а також повний опис усіх необхідних змін у конфігурації та списку **Environment Variables** (змінних оточення).

---

## 📋 1. Загальні вимоги до хостингу Cloudflare

Оскільки додаток побудований як **SPA (Single Page Application)** на базі **Vite + React + TypeScript + Firebase**, хостинг Cloudflare Pages ідеально підходить для нього (він є безкоштовним, швидким та масштабованим).

### Налаштування проєкту в Cloudflare Dashboard:
1. Перейдіть у **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Оберіть ваш репозиторій із кодом.
3. У налаштуваннях збірки (**Build settings**) встановіть:
   - **Framework preset:** `Vite` (або `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js Version:** `18` або вище (можна вказати в змінних оточення Cloudflare `NODE_VERSION: 20`).

---

## 🔀 2. Вирішення проблеми роутингу (Nested Routes)

В SPA-додатках (таких як наш) всі маршрути (`/admin`, `/admin/orders`, `/blog/:id` тощо) обробляються на стороні клієнта за допомогою React Router. Якщо користувач оновить сторінку на вкладеному маршруті, Cloudflare поверне помилку `404 Not Found`, оскільки фізично такого файлу на сервері немає.

### Рішення:
Необхідно створити файл `_redirects` у папці `/public/` (який після білду потрапить в `/dist/_redirects`).
У цьому файлі має бути лише один рядок:
```text
/* /index.html 200
```
Це вкаже Cloudflare перенаправляти всі запити на головний `index.html`, де React Router успішно обробить маршрут клієнтською частиною.

---

## 🔑 3. Конфігурація Firebase при міграції

Зараз додаток зчитує налаштування Firebase локально з автогенерованого файлу `firebase-applet-config.json` (рядок `import firebaseConfig from '../../../firebase-applet-config.json'` всередині `/src/shared/lib/firebase.ts`).

Щоб зробити систему гнучкою, безпечною та незалежною від локальних JSON-файлів при розгортанні, ви можете обрати **один із двох варіантів**:

### Варіант А: Автоматична генерація файлу при білді (Рекомендовано)
Ви можете не змінювати код додатка, а перед збіркою на Cloudflare створювати файл `firebase-applet-config.json` за допомогою системної команди.
Для цього додайте змінну оточення `FIREBASE_JSON_CONFIG` у Cloudflare, яка міститиме повний JSON-рядок конфігурації Firebase:
```json
{"projectId":"your-id","appId":"...","apiKey":"...","authDomain":"...","firestoreDatabaseId":"...","storageBucket":"...","messagingSenderId":"..."}
```
А в полі **Build command** на Cloudflare вкажіть:
```bash
echo $FIREBASE_JSON_CONFIG > firebase-applet-config.json && npm run build
```

### Варіант Б: Перенесення конфігурації у змінні оточення `VITE_`
Ви можете замінити імпорт файлу в `src/shared/lib/firebase.ts` на використання клієнтських змінних оточення Vite. 
Для цього перепишіть ініціалізацію конфігурації:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
};
```
І додайте відповідні змінні `VITE_FIREBASE_*` до панелі керування Cloudflare Pages.

---

## 📁 4. Повний список та значення Environment Variables

Всі приватні змінні оточення в проєкті Vite, які використовуються на клієнті, **обов'язково** повинні мати префікс `VITE_`, щоб Vite вніс їх у збірку.

Додайте наступні ключі у розділі **Settings** -> **Environment variables** вашого проєкту на Cloudflare (у розділах **Production** та **Preview**):

### 📬 Конфігурація розсилок Brevo (Sendinblue)

| Ім'я змінної | Тип значення | Опис / Призначення | Приклад значення |
| :--- | :--- | :--- | :--- |
| `VITE_BREVO_API_KEY` | `string` | Ключ доступу API (v3) з кабінету Brevo. | `xkeysib-c4f5d6g7...` |
| `VITE_BREVO_LIST_ID` | `number` | ID списку контактів у Brevo, куди додаватимуться валідовані підписники. | `3` |
| `VITE_BREVO_SENDER_NAME` | `string` | Ім'я відправника транзакційних та маркетингових листів. | `Комора` |
| `VITE_BREVO_SENDER_EMAIL` | `string` | Верифікований Email у вашому кабінеті Brevo. | `olexandr.prykhodko@gmail.com` |

---

### 📧 Шаблони листів Brevo за мовами (Double Opt-In та Статуси)

Кожен тип листа має по 3 версії відповідно до підтримуваних мов (Українська, Англійська, Німецька).

#### 🇺🇦 Українські шаблони (UK)
| Ім'я змінної | Опис шаблону | Значення |
| :--- | :--- | :--- |
| `VITE_BREVO_DOI_CONFIRM_UK` | Підтвердження підписки (Double Opt-In) | ID шаблону в Brevo (напр. `2`) |
| `VITE_BREVO_DOI_WELCOME_UK` | Привітальний лист після підтвердження підписки | ID шаблону в Brevo (напр. `4`) |
| `VITE_BREVO_ORDER_PLACED_UK` | Замовлення успішно створено клієнтом | ID шаблону в Brevo (напр. `5`) |
| `VITE_BREVO_ORDER_CONFIRMED_UK` | Замовлення підтверджено адміністратором | ID шаблону в Brevo (напр. `6`) |
| `VITE_BREVO_ORDER_IN_TRANSIT_UK` | Замовлення передано в службу доставки / відправлено | ID шаблону в Brevo (напр. `7`) |
| `VITE_BREVO_ORDER_DELIVERED_UK` | Замовлення доставлено отримувачу | ID шаблону в Brevo (напр. `8`) |
| `VITE_BREVO_ORDER_CANCELLED_UK` | Замовлення скасовано (із зазначенням причин) | ID шаблону в Brevo (напр. `9`) |

#### 🇬🇧 Англійські шаблони (EN)
| Ім'я змінної | Опис шаблону | Значення |
| :--- | :--- | :--- |
| `VITE_BREVO_DOI_CONFIRM_EN` | Confirmation of Premium Newsletter subscription (DOI) | ID шаблону в Brevo (напр. `11`) |
| `VITE_BREVO_DOI_WELCOME_EN` | Welcome subscriber notification | ID шаблону в Brevo (напр. `12`) |
| `VITE_BREVO_ORDER_PLACED_EN` | New order placed confirmation | ID шаблону в Brevo (напр. `15`) |
| `VITE_BREVO_ORDER_CONFIRMED_EN`| Order confirmed by Admin | ID шаблону в Brevo (напр. `17`) |
| `VITE_BREVO_ORDER_IN_TRANSIT_EN`| Cargo dispatched/shipped update | ID шаблону в Brevo (напр. `19`) |
| `VITE_BREVO_ORDER_DELIVERED_EN` | Parcel successfully hand-delivered | ID шаблону в Brevo (напр. `21`) |
| `VITE_BREVO_ORDER_CANCELLED_EN` | Order cancellation reason status notification | ID шаблону в Brevo (напр. `23`) |

#### 🇩🇪 Німецькі шаблони (DE)
| Ім'я змінної | Опис шаблону | Значення |
| :--- | :--- | :--- |
| `VITE_BREVO_DOI_CONFIRM_DE` | Newsletter-Abonnement Bestätigung (Double Opt-In) | ID шаблону в Brevo (напр. `13`) |
| `VITE_BREVO_DOI_WELCOME_DE` | Willkommens-E-Mail (Erfolgreiches Abo) | ID шаблону в Brevo (напр. `14`) |
| `VITE_BREVO_ORDER_PLACED_DE` | Bestelleingang bestätigt | ID шаблону в Brevo (напр. `16`) |
| `VITE_BREVO_ORDER_CONFIRMED_DE`| Bestellung wurde durch Admin bestätigt | ID шаблону в Brevo (напр. `18`) |
| `VITE_BREVO_ORDER_IN_TRANSIT_DE`| Bestellung wurde an Versand übergeben / Unterwegs | ID шаблону в Brevo (напр. `20`) |
| `VITE_BREVO_ORDER_DELIVERED_DE` | Bestellung erfolgreich zugestellt | ID шаблону в Brevo (напр. `22`) |
| `VITE_BREVO_ORDER_CANCELLED_DE` | Stornierung der Bestellung status update | ID шаблону в Brevo (напр. `24`) |

---

### 🔥 Налаштування сервісів Firebase (якщо вибрано Варіант Б)

Якщо у файлі `/src/shared/lib/firebase.ts` ви змінили логіку на використання індивідуальних `VITE_` ключів, додайте такі змінні в Cloudflare:

| Ім'я змінної | Тип значення | Опис | Приклад значення |
| :--- | :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `string` | Веб-ключ API Firebase вашого проєкту. | `AIzaSyDDyDX0QV1OLlDsllc...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `string` | Домен авторизації для OAuth. | `komora-d7d96.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `string` | Ідентифікатор проєкту в Google Cloud. | `komora-d7d96` |
| `VITE_FIREBASE_STORAGE_BUCKET`| `string` | Посилання на хмарне сховище завантажених фото. | `komora-d7d96.firebasestorage.app`|
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `string` | ID відправника системних повідомлень. | `380303075032` |
| `VITE_FIREBASE_APP_ID` | `string` | Унікальний ID зареєстрованого веб-додатка. | `1:380303075032:web:509d...` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | `string` | ID використовуваної бази Firestore. Залиште порожнім або `(default)` за замовчуванням. | `ai-studio-fb67e21b-3fe2...` |

---

## 🔒 5. Безпека перед публікацією
1. **Авторизовані домени в Firebase Console:**
   Обов'язково перейдіть у консоль Firebase -> **Authentication** -> **Settings** -> **Authorized Domains** та додайте ваші власні домени від Cloudflare Pages (наприклад, `your-app.pages.dev` та ваш персональний домен `komora.ua`, якщо він підключений). Без цього Google Login повертатиме помилку авторизації.
2. **CORS у Firebase Storage:**
   Якщо ви плануєте завантажувати зображення товарів безпосередньо з вашого нового домену через адмін-панель за допомогою Drag-and-Drop, налаштуйте CORS правила для вашого бакету Google Cloud Storage, дозволивши вашому домену метод `POST` та заголовки `Content-Type`.

---
Розгортання на Cloudflare Pages дасть проєкту неймовірну швидкість завдяки глобальному CDN та повністю зніме навантаження на сервери розробки! 🌾✨
