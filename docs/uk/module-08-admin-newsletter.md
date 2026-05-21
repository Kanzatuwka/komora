# Module 08 — Newsletter, Підписники, Налаштування, Деплой

> Завантажити разом з `main.md`. Залежить від всіх попередніх модулів. **Фінальний модуль проєкту.**

---

## Що будуємо
1. `/admin/newsletter` — compose, preview, send, history.
2. `/admin/subscribers` — таблиця підписників.
3. `/admin/settings` — лендінг, про нас, точки самовивозу.
4. **Вибір хостингу і production-деплой.**
5. README.md.

---

## Файли що створюються

### Newsletter
- `src/features/admin/components/CampaignComposer.jsx`
- `src/features/admin/components/CampaignPreview.jsx`
- `src/features/admin/components/CampaignHistory.jsx`
- `src/features/admin/pages/AdminNewsletterPage.jsx`
- `src/features/admin/hooks/useSendCampaign.js`
- `src/features/admin/hooks/useNewsletterHistory.js`

### Підписники
- `src/features/admin/components/SubscribersTable.jsx`
- `src/features/admin/pages/AdminSubscribersPage.jsx`
- `src/features/admin/hooks/useSubscribers.js`

### Налаштування
- `src/features/admin/components/HeroEditor.jsx`
- `src/features/admin/components/AboutEditor.jsx`
- `src/features/admin/components/PickupAddressManager.jsx`
- `src/features/admin/pages/AdminSettingsPage.jsx`
- `src/features/admin/hooks/useSettings.js`
- `src/features/admin/hooks/usePickupAddresses.js`

---

## Newsletter

### AdminNewsletterPage
**Дві вкладки:**
1. **Нова розсилка** (за замовчуванням)
2. **Історія**

### Вкладка "Нова розсилка"

**Крок 1 — Вибір статті:**
- Dropdown зі списком опублікованих статей (`published: true`), сортовано по `createdAt desc`.

**Крок 2 — Автозаповнення:**
Як тільки стаття обрана, система автоматично готує дані для листа:
- Заголовок статті
- Excerpt
- `imageUrl`
- Картки прив'язаних продуктів (з `linkedProductIds`)

**Крок 3 — Вступне слово:**
- Простий textarea (не rich text). Лімит 300 символів.
- Підказка: *"Коротке вступне слово від ферми, що з'явиться зверху листа"*

**Крок 4 — Прев'ю:**
- `CampaignPreview` показує як лист виглядатиме у клієнта.
- HTML-шаблон листа:
  - Заголовок ферми "Комора"
  - Вступне слово (з форми)
  - Велике фото статті
  - Заголовок статті
  - Excerpt
  - Кнопка "Читати рецепт" → `https://[домен]/blog/:id`
  - Блок "Продукти з рецепту" — картки прив'язаних продуктів з лінками на `/shop/:id`
  - Footer з лінком "Відписатися" (Brevo додає автоматично)
- Прев'ю — iframe з рендереним HTML (щоб стилі листа не впливали на адмінку).

**Крок 5 — Відправка:**
- Кнопка "Надіслати всім підписникам".
- Клік → модалка з підтвердженням: *"Надіслати [N] підписникам?"*. `N` — кількість документів у `/subscribers` зі статусом `confirmed`.
- Підтвердження → `useSendCampaign`.

#### `useSendCampaign`
```js
const sendCampaign = async ({ articleId, introText, previewHtml }) => {
  const article = ...; // з обраної статті

  // 1. Брати всіх confirmed підписників
  const subsSnap = await getDocs(query(
    collection(db, 'subscribers'),
    where('status', '==', 'confirmed')
  ));
  const recipients = subsSnap.docs.map(d => d.data().email);

  // 2. Brevo: створити кампанію або надіслати через transactional
  await brevo.sendCampaign({
    subject: `Новий рецепт: ${article.title}`,
    htmlContent: previewHtml,
    recipientEmails: recipients,
  });

  // 3. Записати в /newsletterHistory
  await addDoc(collection(db, 'newsletterHistory'), {
    articleId,
    articleTitle: article.title,
    introText,
    recipientsCount: recipients.length,
    sentAt: serverTimestamp(),
    previewHtml,
  });

  showToast({
    message: `Розсилку надіслано ${recipients.length} підписникам`,
    type: 'success'
  });
};
```

⚠ Brevo має ліміти на Free плані (300 листів/день). При перевищенні Brevo поверне помилку — обробити це в catch і показати чітке повідомлення.

### Вкладка "Історія"

**`useNewsletterHistory`:**
```js
const q = query(collection(db, 'newsletterHistory'), orderBy('sentAt', 'desc'));
// onSnapshot
```

**`CampaignHistory`:**
Список рядків (не таблиця): дата, назва статті, кількість отримувачів, кнопка "Прев'ю" → відкриває модалку з збереженим `previewHtml` в iframe.

---

## Підписники

### AdminSubscribersPage (`/admin/subscribers`)

**Зверху:** загальна кількість активних (статус `confirmed`) великими цифрами.

**`useSubscribers`:**
```js
const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
// onSnapshot
```

**`SubscribersTable`:**
Колонки: Email, Дата підписки, Статус (бейдж: `confirmed` зелений, `pending` сірий), Дії (Видалити з підтвердженням).

При видаленні з Firestore — паралельно видалити підписника з Brevo списку через API.

---

## Налаштування

### AdminSettingsPage (`/admin/settings`)

Три секції на одній сторінці (зі своїми кнопками "Зберегти"):

#### Секція "Лендінг — Hero"
**`HeroEditor`** — поля:
- Заголовок (text)
- Слоган (textarea)
- Текст CTA-кнопки (text)
- Фонове фото (`ImageUploader` з Module 07, single-file)
- Кнопка "Зберегти"

Зберігає у `/settings/landing.hero` через `setDoc({ merge: true })`.

#### Секція "Про нас"
**`AboutEditor`** — поля:
- Текст (textarea, ~500-1000 символів)
- Фото (single-file `ImageUploader`)
- Кнопка "Зберегти"

Зберігає у `/settings/landing.about`.

#### Секція "Адреси самовивозу"
**`PickupAddressManager`:**
- Список карток точок видачі.
- Кожна — назва, адреса, години роботи + кнопки Редагувати / Видалити.
- Кнопка "+ Додати точку" → модалка з формою.

CRUD для колекції `/pickupAddresses`.

---

## Деплой і README

### Вибір хостингу
Можливі варіанти на безкоштовних планах:
- **Firebase Hosting** — нативна інтеграція з рештою стеку, SSL, CDN. GitHub Actions для авто-деплою при push до `main`.
- **Vercel** — простіший CI/CD, добре працює з Vite. Безкоштовний план обмежений по комерційному використанню.
- **Cloudflare Pages** — швидкий, без обмежень по комерції на Free плані.

**Рекомендація:** Firebase Hosting для уникнення фрагментації (вся інфраструктура в одному проєкті).

### Налаштування Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: dist
# Single-page app: Yes
# Set up automatic builds with GitHub: No (зробимо вручну через workflow)
firebase deploy --only hosting
```

### GitHub Actions workflow
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [main]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          # ... решта env vars
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: <your-project-id>
```

Користувач створює `FIREBASE_SERVICE_ACCOUNT` через Firebase Console → Project Settings → Service accounts → Generate new private key.

### Домен (опційно)
Firebase Hosting → Custom domain → додати домен → налаштувати DNS records (A або CNAME).

---

## README.md
Структура для передачі клієнту:

```
# Комора

## Стек
[список з main.md]

## Локальний запуск
1. Клонувати репо
2. npm install
3. Створити .env.local за зразком .env.local.example
4. npm run dev

## Структура проєкту
[коротко: features/ + shared/]

## Firestore — структура
[посилання на main.md розділ 5]

## Як додати нового адміна
Firestore Console → /users/{uid} → role: 'admin'

## Деплой
git push origin main → GitHub Actions автоматично деплоїть на Firebase Hosting

## Brevo — налаштування
- Створити confirmation і welcome templates
- Створити 5 статусних templates (new, confirmed, in_transit, delivered, cancelled)
- API ключ і template ID в .env.local

## Ліміти безкоштовних планів
- Firebase Spark: 1 GB Firestore, 5 GB Storage, 10 GB/month bandwidth
- Brevo Free: 300 листів/день
- Firebase Hosting: 10 GB storage, 360 MB/day transfer

## Контакт
[ваші дані]
```

---

## Критерії готовності
Див. блок `Module 08` у `progress.md`.

**Фінальна перевірка перед передачею клієнту:**
1. Усі сценарії з критичних шляхів проходять у production-білді на хостингу.
2. Емейли з Brevo приходять (newsletter confirmation, order confirmation, status changes).
3. Storage файли доступні через CDN, security rules не дають записувати не-адмінам.
4. README актуальний.
5. Адмін-доступ передано клієнту, перший адмін створений.
