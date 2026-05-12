# Локалізація — повна схема ключів

> Запустити **перед** локалізацією окремих компонентів. Цей файл = повний референс ключів для всіх locale-файлів. Після наповнення словників — компоненти просто використовують готові ключі.

---

## Інструкція для Gemini (одна сесія)

> Наповни всі locale-файли у `src/i18n/locales/uk/`, `src/i18n/locales/en/` і `src/i18n/locales/de/` за схемою нижче.
>
> Правила:
> 1. **Не видаляй** існуючі ключі — лише додавай нові і доповнюй існуючі вкладені обʼєкти.
> 2. UA — оригінал з цього файлу. EN/DE — переклади якісні, у DE використовуй `Sie` (ввічливе ви), не `Du`.
> 3. Якщо в існуючих файлах якийсь ключ уже є — пропусти його (не перезаписуй).
> 4. Зберігай структуру вкладених обʼєктів як показано.

---

## common.json (спільні UI-рядки)

```json
{
  "nav": {
    "shop": "Магазин",
    "blog": "Блог",
    "about": "Про нас",
    "cart": "Кошик",
    "account": "Кабінет",
    "admin": "Адмін",
    "login": "Увійти",
    "logout": "Вийти",
    "register": "Зареєструватися"
  },
  "actions": {
    "save": "Зберегти",
    "cancel": "Скасувати",
    "delete": "Видалити",
    "edit": "Редагувати",
    "add": "Додати",
    "back": "Назад",
    "continue": "Продовжити",
    "confirm": "Підтвердити",
    "close": "Закрити",
    "submit": "Відправити",
    "search": "Пошук",
    "loading": "Завантаження...",
    "saving": "Збереження...",
    "tryAgain": "Спробуйте ще раз"
  },
  "toasts": {
    "saved": "Збережено",
    "deleted": "Видалено",
    "updated": "Оновлено",
    "error": "Сталася помилка",
    "tryAgain": "Спробуйте ще раз"
  },
  "validation": {
    "required": "Обовʼязкове поле",
    "emailInvalid": "Невірний формат email",
    "passwordMin": "Пароль має бути не менше {{count}} символів",
    "passwordsNoMatch": "Паролі не співпадають",
    "phoneInvalid": "Невірний формат телефону"
  },
  "languages": {
    "uk": "Українська",
    "en": "English",
    "de": "Deutsch"
  },
  "currencies": {
    "UAH": "Гривня",
    "EUR": "Євро",
    "USD": "Долар"
  },
  "footer": {
    "navigation": "Навігація",
    "contacts": "Контакти",
    "social": "Соцмережі",
    "language": "Мова",
    "currency": "Валюта",
    "copyright": "© 2026 Комора · сімейна ферма"
  },
  "notFound": {
    "title": "Не знайдено",
    "back": "На головну"
  }
}
```

---

## shop.json (магазин, кошик, checkout)

```json
{
  "title": "Магазин",
  "categories": {
    "jam": "Варення",
    "sauce": "Соуси",
    "preserve": "Консервація"
  },
  "sort": {
    "label": "Сортування",
    "newest": "Найновіші",
    "priceAsc": "Ціна ↑",
    "priceDesc": "Ціна ↓"
  },
  "filter": {
    "category": "Категорія",
    "tag": "Тег",
    "all": "Всі"
  },
  "product": {
    "addToCart": "До кошика",
    "added": "Додано до кошика",
    "outOfStock": "Тимчасово немає в наявності",
    "featured": "Популярне",
    "linkedRecipes": "Рецепти з цим продуктом",
    "notFound": "Товар не знайдено"
  },
  "cart": {
    "title": "Кошик",
    "empty": "Ваш кошик порожній",
    "emptyDescription": "Схоже, ви ще нічого не додали. Завітайте до нашого магазину, щоб знайти щось смачненьке.",
    "toShop": "До магазину",
    "continueShopping": "Продовжити покупки",
    "itemsCount": "{{count}} товарів у вашому списку",
    "summary": "Підсумок",
    "items": "Товари",
    "delivery": "Доставка",
    "deliveryCalculated": "Рахується далі",
    "total": "Всього до сплати",
    "checkout": "Оформити"
  },
  "checkout": {
    "title": "Оформлення замовлення",
    "deliveryMethod": "Спосіб отримання",
    "delivery": "Доставка курʼєром",
    "pickup": "Самовивіз",
    "contactInfo": "Контактні дані",
    "name": "Ваше імʼя",
    "phone": "Телефон",
    "email": "Email",
    "deliveryAddress": "Адреса доставки",
    "selectSavedAddress": "Вибрати збережену:",
    "street": "Вулиця та номер будинку",
    "city": "Місто",
    "postalCode": "Поштовий індекс",
    "pickupPoint": "Точка самовивозу",
    "pickupSchedule": "Графік:",
    "noPickupPoints": "Точки самовивозу поки що не додані.",
    "comment": "Коментар до замовлення",
    "yourOrder": "Ваше замовлення",
    "placeOrder": "Замовити зараз",
    "terms": "Натискаючи на кнопку, ви погоджуєтесь з умовами обслуговування Комори.",
    "newOrderToast": "Нове замовлення!",
    "successToast": "Замовлення успішно оформлено!",
    "errorToast": "Сталася помилка при оформленні. Спробуйте ще раз."
  },
  "orderConfirmation": {
    "thanks": "Дякуємо за замовлення!",
    "received": "успішно прийнято",
    "info": "Інформація про замовлення",
    "deliveryAndPayment": "Доставка та оплата",
    "courierDelivery": "Курʼєрська доставка",
    "pickup": "Самовивіз",
    "pickupPoint": "Точка самовивозу",
    "total": "Сума",
    "emailNote": "Ми надіслали лист із деталями замовлення на вашу пошту. Ви можете відстежувати статус у особистому кабінеті.",
    "notFound": "Замовлення не знайдено",
    "toShop": "До магазину",
    "toAccount": "В кабінет"
  }
}
```

---

## blog.json

```json
{
  "title": "Блог",
  "subtitle": "Цікаві історії, рецепти та новини з нашої ферми",
  "filter": {
    "all": "Всі"
  },
  "card": {
    "readMore": "Читати далі"
  },
  "article": {
    "notFound": "Статтю не знайдено",
    "backToList": "До всіх статей",
    "tryIngredients": "Спробуйте інгредієнти з нашої комори",
    "share": "Поділитися:",
    "allArticles": "Усі статті"
  }
}
```

---

## auth.json

```json
{
  "login": {
    "title": "Вхід",
    "emailLabel": "Email",
    "passwordLabel": "Пароль",
    "submit": "Увійти",
    "or": "або",
    "google": "Увійти через Google",
    "noAccount": "Немає акаунту?",
    "registerLink": "Зареєструватися",
    "errorInvalid": "Невірний email або пароль",
    "errorGeneric": "Помилка входу. Спробуйте ще раз."
  },
  "register": {
    "title": "Реєстрація",
    "nameLabel": "Імʼя",
    "emailLabel": "Email",
    "passwordLabel": "Пароль",
    "confirmPasswordLabel": "Підтвердіть пароль",
    "submit": "Зареєструватися",
    "hasAccount": "Вже є акаунт?",
    "loginLink": "Увійти",
    "passwordMin": "Пароль має бути не менше 8 символів",
    "passwordsNoMatch": "Паролі не співпадають",
    "welcomeToast": "Вітаємо в Коморі!"
  }
}
```

---

## account.json

```json
{
  "title": "Особистий кабінет",
  "tabs": {
    "orders": "Мої замовлення",
    "addresses": "Мої адреси",
    "profile": "Профіль"
  },
  "user": "Користувач",
  "logout": "Вийти",
  "delivery": "Доставка",
  "pickup": "Самовивіз",
  "orders": {
    "title": "Історія замовлень",
    "empty": "У вас ще немає замовлень",
    "toShop": "До магазину"
  },
  "orderDetails": {
    "notFound": "Замовлення не знайдено",
    "backToAccount": "Назад до кабінету",
    "orderNumber": "Замовлення",
    "inTransitNote": "Ваше замовлення вже їде до вас!",
    "recipientInfo": "Дані отримувача",
    "deliveryInfo": "Доставка",
    "courierDelivery": "Курʼєрська доставка",
    "pickup": "Самовивіз",
    "items": "Склад замовлення",
    "totalToPay": "Разом до сплати:"
  },
  "orderStatus": {
    "new": "Нове",
    "confirmed": "Підтверджено",
    "in_transit": "В дорозі",
    "delivered": "Доставлено",
    "cancelled": "Скасовано"
  },
  "profile": {
    "title": "Ваш профіль",
    "edit": "Редагувати",
    "fullName": "Повне імʼя",
    "phone": "Телефон",
    "notSpecified": "Не вказано",
    "saving": "Збереження...",
    "save": "Зберегти",
    "security": "Безпека",
    "googleAuthNote": "Ви увійшли через Google. Пароль керується у налаштуваннях акаунта Google.",
    "changePassword": "Змінити пароля"
  },
  "passwordChange": {
    "title": "Зміна пароля",
    "currentPassword": "Поточний пароль",
    "newPassword": "Новий пароль",
    "confirmPassword": "Підтвердіть пароль",
    "update": "Оновити",
    "cancel": "Скасувати",
    "passwordsNoMatch": "Паролі не співпадають",
    "passwordMin": "Пароль має бути не менше 6 символів",
    "successToast": "Пароль успішно оновлено",
    "currentInvalid": "Поточний пароль невірний",
    "updateError": "Помилка оновлення пароля"
  },
  "addresses": {
    "title": "Мої адреси",
    "addNew": "Додати нову",
    "empty": "Збережених адрес немає",
    "delete": "Видалити",
    "newAddressTitle": "Нова адреса",
    "labelPlaceholder": "Назва (напр. Дім, Робота)",
    "streetPlaceholder": "Вулиця, будинок",
    "cityPlaceholder": "Місто",
    "postalCodePlaceholder": "Поштовий індекс",
    "deleteConfirmTitle": "Видалити адресу?",
    "deleteConfirmDescription": "Цю дію неможливо скасувати."
  }
}
```

---

## landing.json

```json
{
  "about": {
    "title": "Про нашу ферму"
  }
}
```

(Інші секції лендінгу — Hero, Featured Products, Featured Articles — використовують контент з Firestore через `pickLocale`, не з locale-файлів. Тому тут мінімум.)

---

## newsletter.json (новий namespace — додати в config.ts і всі три мови)

```json
{
  "subscribe": {
    "title": "Приєднуйтесь до нашої комори",
    "description": "Підпишіться на нашу розсилку, щоб першими отримувати нові рецепти та новинки з ферми.",
    "emailPlaceholder": "Ваш email",
    "submit": "Підписатися",
    "checkEmailToast": "Перевірте пошту — ми надіслали листа для підтвердження",
    "alreadySubscribedToast": "Ви вже підписані",
    "pendingToast": "Лист підтвердження вже надіслано — перевірте пошту",
    "errorToast": "Не вдалося підписатися. Спробуйте пізніше."
  },
  "confirmed": {
    "title": "Підписку підтверджено",
    "description": "Дякуємо, тепер ви будете першими дізнаватися про нові рецепти та новинки.",
    "toHome": "На головну"
  }
}
```

⚠ Якщо namespace `newsletter` ще не зареєстровано — додати в `src/i18n/config.ts` у масив `ns: [...]` і у `resources` для трьох мов.

---

## admin.json (для майбутньої адмін-сесії — наразі заповнити мінімум)

```json
{
  "orderStatus": {
    "newMessage": "Нове замовлення очікує підтвердження.",
    "confirmedMessage": "Ми підтвердили ваше замовлення і починаємо його готувати.",
    "in_transitMessage": "Ваше замовлення передано в доставку.",
    "deliveredMessage": "Замовлення доставлено. Дякуємо що обрали Комору!"
  },
  "newsletter": {
    "subject": "Новий рецепт: {{title}}"
  }
}
```

Ключі для emails — критичні (використовуються у Brevo template params). Адмін-форми чіпатимемо окремою сесією — туди ж і доповнимо решту admin.json.

---

## Перевірка після наповнення

Після того як Gemini оновить всі locale-файли:

1. `npm run build` — щоб переконатися що JSON валідний.
2. Відкрити будь-який locale-файл вручну в IDE і поглянути на структуру — чи всі вкладені обʼєкти на місці.
3. Перевірити що **немає дублів** ключів — IDE підсвітить.

---

## Шаблон prompt для локалізації окремого компонента (післяя наповнення)

> Локалізуй файл `src/features/shop/pages/CartPage.tsx`.
>
> Усі потрібні ключі вже є в locale-файлах. Знайди хардкодені рядки і заміни на `t('namespace:key')`.
>
> Відповідність рядок → ключ:
> - "Ваш кошик порожній" → `t('shop:cart.empty')`
> - "Схоже, ви ще нічого не додали..." → `t('shop:cart.emptyDescription')`
> - "До магазину" → `t('shop:cart.toShop')`
> - "Кошик" → `t('shop:cart.title')`
> - "{{count}} товарів у вашому списку" → `t('shop:cart.itemsCount', { count: items.length })`
> - "Продовжити покупки" → `t('shop:cart.continueShopping')`
> - "грн" та інші згадки валюти → замінити число + "грн" на `formatPrice(amount, currency, language)` з `@/shared/lib/format`. Імпортувати `useCurrency` і `useLanguage` якщо ще не імпортовані.
> - "Підсумок" → `t('shop:cart.summary')`
> - "Товари" → `t('shop:cart.items')`
> - "Доставка" → `t('shop:cart.delivery')`
> - "Рахується далі" → `t('shop:cart.deliveryCalculated')`
> - "Всього до сплати" → `t('shop:cart.total')`
> - "Оформити" → `t('shop:cart.checkout')`
> - "Натискаючи на кнопку, ви погоджуєтесь..." → `t('shop:checkout.terms')`
>
> Імпортувати `useTranslation` з `react-i18next`, отримати `t` через `const { t } = useTranslation(['shop', 'common']);`.
>
> Не змінюй логіку, лише string-и.

(Аналогічно для решти файлів — це механічна робота.)
