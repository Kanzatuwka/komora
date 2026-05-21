# Module 09 — Localization (UA / EN / DE) + Multi-currency

> Affects all previous modules. Executed retroactively on the already implemented project.

---

## What Changes

1. UI via `react-i18next`, translated database keys in JSON files.
2. Content in Firestore: fields `name`, `description`, `title`, `body`, `excerpt` → `{ uk, en, de }`.
3. Prices: `price` → `{ UAH, EUR, USD }`.
4. Admin forms gain tabs `[UK] [EN] [DE]` via `<LocalizedField>`.
5. Language and Currency switchers in Navbar, Footer, Profile, Admin Sidebar.
6. Fields `language` and `preferredCurrency` added to `/users/{uid}`.
7. Fields `userLanguage` and `currency` added to `/orders/{id}`.
8. Field `language` added to `/subscribers/{id}`.
9. Email — 21 templates in Brevo (7 types × 3 languages).
10. Newsletter split into three custom-language campaigns.
11. Migration script converts existing single-language Firestore entries.

---

## Libraries

```bash
npm install i18next react-i18next
```

---

## Setup i18next

### `src/i18n/config.js`
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ukCommon from './locales/uk/common.json';
import ukShop from './locales/uk/shop.json';
import ukBlog from './locales/uk/blog.json';
import ukAuth from './locales/uk/auth.json';
import ukAccount from './locales/uk/account.json';
import ukAdmin from './locales/uk/admin.json';
import ukLanding from './locales/uk/landing.json';

import enCommon from './locales/en/common.json';
import enShop from './locales/en/shop.json';
import enBlog from './locales/en/blog.json';
import enAuth from './locales/en/auth.json';
import enAccount from './locales/en/account.json';
import enAdmin from './locales/en/admin.json';
import enLanding from './locales/en/landing.json';

import deCommon from './locales/de/common.json';
import deShop from './locales/de/shop.json';
import deBlog from './locales/de/blog.json';
import deAuth from './locales/de/auth.json';
import deAccount from './locales/de/account.json';
import deAdmin from './locales/de/admin.json';
import deLanding from './locales/de/landing.json';

export const SUPPORTED_LANGUAGES = ['uk', 'en', 'de'];
export const DEFAULT_LANGUAGE = 'uk';

i18n.use(initReactI18next).init({
  resources: {
    uk: { common: ukCommon, shop: ukShop, blog: ukBlog, auth: ukAuth, account: ukAccount, admin: ukAdmin, landing: ukLanding },
    en: { common: enCommon, shop: enShop, blog: enBlog, auth: enAuth, account: enAccount, admin: enAdmin, landing: enLanding },
    de: { common: deCommon, shop: deShop, blog: deBlog, auth: deAuth, account: deAccount, admin: deAdmin, landing: deLanding },
  },
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'shop', 'blog', 'auth', 'account', 'admin', 'landing'],
  interpolation: { escapeValue: false },
});

export default i18n;
```

Import `./i18n/config` in `main.jsx` right after React imports.

---

## Locale Files

```
src/i18n/locales/
├── uk/  common.json  shop.json  blog.json  auth.json  account.json  admin.json  landing.json
├── en/  (same structure)
└── de/  (same structure)
```

### Example `uk/common.json`
```json
{
  "nav": { "shop": "Магазин", "blog": "Блог", "cart": "Кошик", "account": "Кабінет", "login": "Увійти", "logout": "Вийти" },
  "actions": { "save": "Зберегти", "cancel": "Скасувати", "delete": "Видалити", "edit": "Редагувати", "add": "Додати" },
  "toasts": { "saved": "Збережено", "deleted": "Видалено", "error": "Сталася помилка" },
  "languages": { "uk": "Українська", "en": "English", "de": "Deutsch" },
  "currencies": { "UAH": "Гривня", "EUR": "Євро", "USD": "Долар" }
}
```

---

## LanguageContext

### `src/shared/contexts/LanguageContext.jsx`
```jsx
import { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { useAuth } from './AuthContext';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/i18n/config';

const STORAGE_KEY = 'komora-language';
const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

function detectInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browser)) return browser;
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const lang = detectInitialLanguage();
    if (lang !== i18n.language) i18n.changeLanguage(lang);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const stored = snap.data()?.language;
      if (stored && SUPPORTED_LANGUAGES.includes(stored) && stored !== i18n.language) {
        i18n.changeLanguage(stored);
        localStorage.setItem(STORAGE_KEY, stored);
      }
    })();
  }, [user?.uid]);

  const changeLanguage = async (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    await i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    if (user) await updateDoc(doc(db, 'users', user.uid), { language: lang });
  };

  return (
    <LanguageContext.Provider value={{ language: i18n.language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
```

---

## CurrencyContext

### `src/shared/contexts/CurrencyContext.jsx`
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export const SUPPORTED_CURRENCIES = ['UAH', 'EUR', 'USD'];
const STORAGE_KEY = 'komora-currency';
const DEFAULT_BY_LANGUAGE = { uk: 'UAH', en: 'USD', de: 'EUR' };

const CurrencyContext = createContext();
export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [currency, setCurrency] = useState('UAH');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_CURRENCIES.includes(stored)) {
      setCurrency(stored);
    } else {
      setCurrency(DEFAULT_BY_LANGUAGE[language] || 'UAH');
    }
  }, [language]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const stored = snap.data()?.preferredCurrency;
      if (stored && SUPPORTED_CURRENCIES.includes(stored)) {
        setCurrency(stored);
        localStorage.setItem(STORAGE_KEY, stored);
      }
    })();
  }, [user?.uid]);

  const changeCurrency = async (c) => {
    if (!SUPPORTED_CURRENCIES.includes(c)) return;
    setCurrency(c);
    localStorage.setItem(STORAGE_KEY, c);
    if (user) await updateDoc(doc(db, 'users', user.uid), { preferredCurrency: c });
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}
```

Provider composition in `App.jsx`: `AuthProvider → LanguageProvider → CurrencyProvider → CartProvider → ToastProvider`.

---

## Switchers

### `src/shared/components/LanguageSwitcher.jsx`
```jsx
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

export function LanguageSwitcher({ variant = 'dropdown' }) {
  const { language, changeLanguage } = useLanguage();

  if (variant === 'inline') {
    return (
      <div className="flex gap-2">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <button key={lng} onClick={() => changeLanguage(lng)}
            className={`px-2 py-1 text-sm uppercase ${language === lng ? 'font-bold text-farm-green' : 'text-gray-500'}`}>
            {lng}
          </button>
        ))}
      </div>
    );
  }

  return (
    <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="bg-transparent text-sm uppercase">
      {SUPPORTED_LANGUAGES.map((lng) => <option key={lng} value={lng}>{lng}</option>)}
    </select>
  );
}
```

### `src/shared/components/CurrencySwitcher.jsx`
Similar structure with `useCurrency()` and `SUPPORTED_CURRENCIES`.

**Placement of both:** Navbar (dropdown), Footer (inline), Profile tab (inline), Admin Sidebar (dropdown).

---

## Firestore — New Schema

```
/products/{id}
  name: { uk, en, de }
  description: { uk, en, de }
  category: 'jam' | 'sauce' | 'preserve'
  tags: string[]
  price: { UAH, EUR, USD }
  images: string[]
  inStock: boolean

/articles/{id}
  title: { uk, en, de }
  body: { uk, en, de }
  excerpt: { uk, en, de }
  tags: string[]
  imageUrl: string
  published: boolean
  featured: boolean

/settings/landing
  hero: { title: {uk,en,de}, subtitle: {uk,en,de}, ctaText: {uk,en,de}, imageUrl }
  about: { text: {uk,en,de}, imageUrl }

/pickupAddresses/{id}
  label: { uk, en, de }
  address: { uk, en, de }
  workingHours: { uk, en, de }

/tags/{slug}
  slug: string
  name: { uk, en, de }
  scope: 'product' | 'article' | 'both'

/users/{uid}
  language: 'uk' | 'en' | 'de'
  preferredCurrency: 'UAH' | 'EUR' | 'USD'

/orders/{id}
  userLanguage: 'uk' | 'en' | 'de'
  currency: 'UAH' | 'EUR' | 'USD'
  items: [{ productId, name, price, quantity }]   // name and price are written in the order's language & currency
  total: number

/subscribers/{id}
  language: 'uk' | 'en' | 'de'
```

Categories and tags are slugs (`jam`, `berry`). Localization of categories is handled via `t('shop:categories.jam')`. Localization of tags is handled via the `/tags` collection.

---

## Helpers

### `src/shared/lib/i18nContent.js`
```js
export function pickLocale(field, language, fallback = 'uk') {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[language] || field[fallback] || Object.values(field).find(Boolean) || '';
}

export function pickPrice(priceField, currency, fallback = 'UAH') {
  if (typeof priceField === 'number') return priceField;
  return priceField?.[currency] ?? priceField?.[fallback] ?? 0;
}
```

### `src/shared/lib/format.js`
```js
const LOCALE_BY_LANG = { uk: 'uk-UA', en: 'en-US', de: 'de-DE' };

export function formatDate(date, language, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate();
  return new Intl.DateTimeFormat(LOCALE_BY_LANG[language], opts).format(d);
}

export function formatPrice(amount, currency, language) {
  return new Intl.NumberFormat(LOCALE_BY_LANG[language], { style: 'currency', currency }).format(amount);
}
```

---

## LocalizedField

### `src/features/admin/components/LocalizedField.jsx`
```jsx
import { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

export function LocalizedField({ label, value, onChange, type = 'text', required = false }) {
  const [activeTab, setActiveTab] = useState('uk');

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-1 mb-2 border-b border-gray-200">
        {SUPPORTED_LANGUAGES.map((lng) => {
          const filled = value?.[lng]?.trim().length > 0;
          return (
            <button key={lng} type="button" onClick={() => setActiveTab(lng)}
              className={`px-3 py-1 text-sm uppercase ${activeTab === lng ? 'border-b-2 border-farm-green font-bold' : 'text-gray-500'}`}>
              {lng} {filled ? '●' : '○'}
            </button>
          );
        })}
      </div>

      {type === 'textarea' ? (
        <textarea value={value?.[activeTab] || ''} onChange={(e) => onChange({ ...value, [activeTab]: e.target.value })}
          className="w-full border rounded p-2" rows={4} />
      ) : (
        <input type="text" value={value?.[activeTab] || ''} onChange={(e) => onChange({ ...value, [activeTab]: e.target.value })}
          className="w-full border rounded p-2" />
      )}
    </div>
  );
}
```

**Validation:** UK is required (default + fallback). EN/DE are optional.

**TipTap for Article Body:** Three separate editors are initialized; the one matching `activeTab` is rendered. The state is saved under `body: { uk, en, de }`.

---

## Migration Script

### `scripts/migrate-to-i18n.js`
```js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service-account.json' assert { type: 'json' };

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function migrateProducts() {
  const snap = await db.collection('products').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const updates = {};
    if (typeof data.name === 'string') updates.name = { uk: data.name, en: '', de: '' };
    if (typeof data.description === 'string') updates.description = { uk: data.description, en: '', de: '' };
    if (typeof data.price === 'number') updates.price = { UAH: data.price, EUR: 0, USD: 0 };
    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Migrated product ${doc.id}`);
    }
  }
}

async function migrateArticles() {
  const snap = await db.collection('articles').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const updates = {};
    if (typeof data.title === 'string') updates.title = { uk: data.title, en: '', de: '' };
    if (typeof data.body === 'string') updates.body = { uk: data.body, en: '', de: '' };
    if (typeof data.excerpt === 'string') updates.excerpt = { uk: data.excerpt, en: '', de: '' };
    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      console.log(`Migrated article ${doc.id}`);
    }
  }
}

async function migrateSettings() {
  const ref = db.doc('settings/landing');
  const snap = await ref.get();
  const data = snap.data();
  const updates = {};
  if (data.hero) {
    updates.hero = {
      ...data.hero,
      title: typeof data.hero.title === 'string' ? { uk: data.hero.title, en: '', de: '' } : data.hero.title,
      subtitle: typeof data.hero.subtitle === 'string' ? { uk: data.hero.subtitle, en: '', de: '' } : data.hero.subtitle,
      ctaText: typeof data.hero.ctaText === 'string' ? { uk: data.hero.ctaText, en: '', de: '' } : data.hero.ctaText,
    };
  }
  if (data.about) {
    updates.about = {
      ...data.about,
      text: typeof data.about.text === 'string' ? { uk: data.about.text, en: '', de: '' } : data.about.text,
    };
  }
  await ref.update(updates);
}

async function migratePickupAddresses() {
  const snap = await db.collection('pickupAddresses').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const updates = {};
    if (typeof data.label === 'string') updates.label = { uk: data.label, en: '', de: '' };
    if (typeof data.address === 'string') updates.address = { uk: data.address, en: '', de: '' };
    if (typeof data.workingHours === 'string') updates.workingHours = { uk: data.workingHours, en: '', de: '' };
    if (Object.keys(updates).length > 0) await doc.ref.update(updates);
  }
}

async function createTagsCollection() {
  const productSnap = await db.collection('products').get();
  const articleSnap = await db.collection('articles').get();
  const tagSet = new Map();
  productSnap.docs.forEach(d => (d.data().tags || []).forEach(t => tagSet.set(t, 'product')));
  articleSnap.docs.forEach(d => (d.data().tags || []).forEach(t => {
    tagSet.set(t, tagSet.has(t) ? 'both' : 'article');
  }));
  for (const [slug, scope] of tagSet) {
    await db.doc(`tags/${slug}`).set({ slug, name: { uk: slug, en: '', de: '' }, scope });
  }
}

async function main() {
  await migrateProducts();
  await migrateArticles();
  await migrateSettings();
  await migratePickupAddresses();
  await createTagsCollection();
  console.log('Migration complete');
}
main();
```

### Execution
1. Firestore Console → Project Settings → Service accounts → Generate new private key → save as `scripts/service-account.json`.
2. **Backup:** `gcloud firestore export gs://<bucket>/komora-backup-pre-i18n` or export via Firebase Console.
3. `npm install firebase-admin`.
4. `node --experimental-vm-modules scripts/migrate-to-i18n.js`.
5. Check entries randomly in the Firestore Console.

---

## Email Templates

7 types × 3 languages = 21 templates in Brevo. HTML and texts are located in `brevo-templates.md` (UA) and `brevo-templates-i18n.md` (EN, DE).

### `src/shared/lib/brevoTemplates.js`
```js
const env = import.meta.env;

export const TEMPLATES = {
  doi_confirm:      { uk: env.VITE_BREVO_DOI_CONFIRM_UK,      en: env.VITE_BREVO_DOI_CONFIRM_EN,      de: env.VITE_BREVO_DOI_CONFIRM_DE },
  doi_welcome:      { uk: env.VITE_BREVO_DOI_WELCOME_UK,      en: env.VITE_BREVO_DOI_WELCOME_EN,      de: env.VITE_BREVO_DOI_WELCOME_DE },
  order_placed:     { uk: env.VITE_BREVO_ORDER_PLACED_UK,     en: env.VITE_BREVO_ORDER_PLACED_EN,     de: env.VITE_BREVO_ORDER_PLACED_DE },
  order_confirmed:  { uk: env.VITE_BREVO_ORDER_CONFIRMED_UK,  en: env.VITE_BREVO_ORDER_CONFIRMED_EN,  de: env.VITE_BREVO_ORDER_CONFIRMED_DE },
  order_in_transit: { uk: env.VITE_BREVO_ORDER_IN_TRANSIT_UK, en: env.VITE_BREVO_ORDER_IN_TRANSIT_EN, de: env.VITE_BREVO_ORDER_IN_TRANSIT_DE },
  order_delivered:  { uk: env.VITE_BREVO_ORDER_DELIVERED_UK,  en: env.VITE_BREVO_ORDER_DELIVERED_EN,  de: env.VITE_BREVO_ORDER_DELIVERED_DE },
  order_cancelled:  { uk: env.VITE_BREVO_ORDER_CANCELLED_UK,  en: env.VITE_BREVO_ORDER_CANCELLED_EN,  de: env.VITE_BREVO_ORDER_CANCELLED_DE },
};

export const getTemplateId = (type, lang) => Number(TEMPLATES[type][lang] || TEMPLATES[type].uk);
```

### Triggers

| Trigger Location | Template Type | Language |
|-------|-------------|------|
| `useSubscribe` | `doi_confirm` | `i18n.language` |
| `SubscriptionConfirmedPage` | `doi_welcome` | `lang` parameter retrieved from URL |
| `useCreateOrder` | `order_placed` | `order.userLanguage` (= `i18n.language` at checkout moment) |
| `useUpdateOrderStatus` | `order_${newStatus}` | `order.userLanguage` |

### Parameter Contracts
Passed over to Brevo API as generic custom params.

**`doi_confirm`**
```js
{
  confirmUrl: `${origin}/subscription-confirmed?email=${encodeURIComponent(email)}&lang=${language}`
}
```

**`doi_welcome`** — none required.

**`order_placed`**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderItemsHtml: order.items.map(i => `<div>${i.name} × ${i.quantity} — ${formatPrice(i.price * i.quantity, order.currency, order.userLanguage)}</div>`).join(''),
  total: formatPrice(order.total, order.currency, order.userLanguage),
  deliveryInfo: order.deliveryMethod === 'delivery'
    ? `${t('account:delivery', { lng: order.userLanguage })}: ${order.address}`
    : `${t('account:pickup', { lng: order.userLanguage })}: ${pickLocale(pickupAddress.label, order.userLanguage)}, ${pickLocale(pickupAddress.address, order.userLanguage)}`
}
```

**`order_confirmed`, `order_in_transit`, `order_delivered`**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderId: orderId,
  statusMessage: t(`admin:orderStatus.${newStatus}Message`, { lng: order.userLanguage })
}
```

Locales configured under:
- `admin:orderStatus.confirmedMessage`
- `admin:orderStatus.in_transitMessage`
- `admin:orderStatus.deliveredMessage`

**`order_cancelled`**
```js
{
  customerName: order.userName,
  orderNumber: orderId.slice(0, 8).toUpperCase(),
  orderId: orderId,
  cancelReason: order.cancelReason   // administrative comments written manually
}
```

---

## Newsletter Three-way Split

```js
import { SUPPORTED_LANGUAGES } from '@/i18n/config';

async function sendCampaign({ articleId, introText }) {
  const article = await getDoc(doc(db, 'articles', articleId));
  const subsSnap = await getDocs(query(collection(db, 'subscribers'), where('status', '==', 'confirmed')));

  const byLang = { uk: [], en: [], de: [] };
  subsSnap.docs.forEach(d => {
    const lang = d.data().language || 'uk';
    byLang[lang].push(d.data().email);
  });

  for (const lang of SUPPORTED_LANGUAGES) {
    if (byLang[lang].length === 0) continue;
    const html = buildEmailHtml(article.data(), introText, lang);
    const subject = t(`admin:newsletter.subject`, { lng: lang, title: pickLocale(article.data().title, lang) });
    await brevo.sendCampaign({ subject, htmlContent: html, recipientEmails: byLang[lang] });
  }

  await addDoc(collection(db, 'newsletterHistory'), {
    articleId,
    articleTitle: article.data().title,
    introText,
    recipientsCount: subsSnap.size,
    sentAt: serverTimestamp(),
    previewHtmlByLang: { /* saved language variations */ },
  });
}
```

---

## What to Modify in Existing Code

| Location | Scope of Change |
|------|-------|
| `App.jsx` | Import configuration from `/i18n/config`. Wrap providers matching order of contexts. |
| `Navbar` | Inject layout switches. Wrap interactive buttons with `t()`. |
| Layout / Pages | Localize static text representations using `useTranslation`. |
| Core Hook layers | Intercept Firebase models and compile using `pickLocale` and `pickPrice`. |
| `useCreateOrder` | Write parameters mapping lang and currencies on checkout. |
| Forms CMS editors | Shift default `<input>` fields onto `<LocalizedField>` with tabs selectors. |

---

## Ready Criteria
See the `Module 09 — Localization` section in `progress.md`.
