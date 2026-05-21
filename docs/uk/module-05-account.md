# Module 05 — Особистий кабінет

> Завантажити разом з `main.md`. Залежить від Modules 00, 02, 03.

---

## Що будуємо
Сторінку `/account` з трьома вкладками:
1. **Мої замовлення** — історія замовлень клієнта.
2. **Профіль** — редагування імені, телефону, пароля.
3. **Адреси** — CRUD збережених адрес доставки.

Плюс — `/account/orders/:id` з деталями замовлення для клієнта.

---

## Файли що створюються

### Components
- `src/features/account/components/AccountTabs.jsx`
- `src/features/account/components/OrderListItem.jsx`
- `src/features/account/components/OrderStatusBadge.jsx`
- `src/features/account/components/ProfileForm.jsx`
- `src/features/account/components/AddressList.jsx`
- `src/features/account/components/AddressForm.jsx`

### Pages
- `src/features/account/pages/AccountPage.jsx`
- `src/features/account/pages/OrderDetailsPage.jsx`

### Hooks
- `src/features/account/hooks/useUserOrders.js`
- `src/features/account/hooks/useOrder.js`
- `src/features/account/hooks/useUserProfile.js`
- `src/features/account/hooks/useUserAddresses.js`

---

## Деталі реалізації

### AccountPage
**Layout:**
- Заголовок "Особистий кабінет".
- `AccountTabs` — три вкладки. Стан активної вкладки в URL: `/account?tab=orders|profile|addresses` (default: `orders`).
- Контент вкладки нижче.

---

### Вкладка "Мої замовлення"
**Хук `useUserOrders()`:**
```js
const { user } = useAuth();
const q = query(
  collection(db, 'orders'),
  where('userId', '==', user.uid),
  orderBy('createdAt', 'desc')
);
// onSnapshot
```

**Список:**
- Список `OrderListItem`. Кожен:
  - Номер замовлення (короткий id або `order.createdAt` форматована як `№ 20260415-1423`)
  - Дата
  - Сума
  - `OrderStatusBadge` — кольорова мітка
  - Кнопка "Деталі" → `/account/orders/:id`

**Empty state:** "Ви ще не зробили жодного замовлення" + кнопка "До магазину".

### OrderStatusBadge
Мапа статусів і кольорів (з main.md схеми + UX-спеки):
```js
const statusConfig = {
  new:        { label: 'Нове',         className: 'bg-blue-100 text-blue-800' },
  confirmed:  { label: 'Підтверджено', className: 'bg-yellow-100 text-yellow-800' },
  in_transit: { label: 'В дорозі',     className: 'bg-orange-100 text-orange-800' },
  delivered:  { label: 'Доставлено',   className: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Скасовано',    className: 'bg-red-100 text-red-800' },
};
```

### OrderDetailsPage (`/account/orders/:id`)
**Захист:** показати тільки якщо `order.userId === user.uid` (або `role === 'admin'`). Інакше → редірект на `/account`.

**Контент:**
- Заголовок з номером замовлення і `OrderStatusBadge`.
- Дата створення.
- Список товарів (фото, назва, кількість, ціна, сума).
- Загальна сума.
- Спосіб отримання + адреса / точка самовивозу.
- Коментар клієнта (якщо є).
- Якщо `status === 'cancelled'` — блок з причиною скасування (`cancelReason`) виділеним червоним.
- Контактний блок знизу: *"Для зміни або скасування замовлення — зв'яжіться з нами"* + email/телефон ферми.

---

### Вкладка "Профіль"
**Поля:**
- Ім'я (editable)
- Телефон (editable, з тією ж маскою що в checkout)
- Email (readonly, з `user.email`)
- Кнопка "Зберегти зміни"

**Зміна пароля:**
- Окрема кнопка "Змінити пароль" → відкриває модалку.
- Поля: Поточний пароль, Новий пароль, Підтвердження.
- Реалізація: `reauthenticateWithCredential` потім `updatePassword`.
- Якщо ввійшов через Google — показати текст: "Пароль керується Google. Змініть його у налаштуваннях акаунта Google."

**`useUserProfile()`:**
- Читає `/users/{uid}` через `onSnapshot`.
- `updateProfile({ name, phone })` → `updateDoc(doc(db, 'users', uid), {...})`.
- Toast підтвердження після збереження.

---

### Вкладка "Адреси"
**`useUserAddresses()`:**
```js
const q = query(collection(db, 'addresses'), where('userId', '==', user.uid));
// onSnapshot
// Повертає { addresses, loading, addAddress, updateAddress, deleteAddress }
```

**`AddressList`:**
- Сітка карток адрес. Кожна:
  - Мітка зверху ("Дім", "Робота")
  - Адреса в одному рядку: `street, city, postalCode`
  - Кнопки: "Редагувати" / "Видалити"
- Кнопка "+ Додати адресу" зверху → відкриває `AddressForm` у модалці.

**`AddressForm`:**
- Поля: Мітка (плейсхолдер: "Дім"), Вулиця, Місто, Індекс.
- Всі обов'язкові.
- Кнопки: "Скасувати" / "Зберегти".

**Видалення:**
- Підтвердження через модалку: *"Видалити адресу [мітка]?"*
- При підтвердженні → toast "Адресу видалено".

---

## Інтеграція з Module 03 (Checkout)
У формі checkout, якщо `useUserAddresses` повертає не порожній список — показати dropdown "Вибрати збережену адресу". Вибір → автозаповнення полів `street`, `city`, `postalCode`. Користувач все ще може редагувати поля.

---

## Критерії готовності
Див. блок `Module 05 — Особистий кабінет` у `progress.md`.

**Перевірка вручну:**
1. Зробити кілька замовлень → з'являються у вкладці "Мої замовлення" зі статусом "Нове".
2. Спробувати відкрити чуже замовлення `/account/orders/CHUZHIY_ID` → редірект на `/account`.
3. Змінити ім'я в профілі → перезавантажити сторінку → зберігається.
4. Додати адресу → з'являється у списку → у checkout вона у dropdown.
5. Видалити адресу → з підтвердженням.
