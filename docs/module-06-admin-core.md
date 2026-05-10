# Module 06 — Admin Core (Dashboard + Замовлення)

> Завантажити разом з `main.md`. Залежить від Modules 00, 02, 03.

---

## Що будуємо
1. `AdminLayout` — спільна оболонка адмін-панелі з бічною навігацією.
2. Dashboard `/admin` зі статистикою і швидкими діями.
3. Список замовлень `/admin/orders` з фільтром статусів.
4. Деталі замовлення `/admin/orders/:id` зі зміною статусу.
5. Тригер email клієнту при зміні статусу.

---

## Файли що створюються

### Components
- `src/features/admin/components/AdminSidebar.jsx`
- `src/features/admin/components/StatCard.jsx`
- `src/features/admin/components/QuickActionButton.jsx`
- `src/features/admin/components/AdminOrderTable.jsx`
- `src/features/admin/components/StatusFilter.jsx`
- `src/features/admin/components/StatusChanger.jsx`
- `src/features/admin/components/CancelReasonModal.jsx`

### Pages
- `src/features/admin/pages/AdminLayout.jsx`
- `src/features/admin/pages/DashboardPage.jsx`
- `src/features/admin/pages/AdminOrdersPage.jsx`
- `src/features/admin/pages/AdminOrderDetailsPage.jsx`

### Hooks
- `src/features/admin/hooks/useAdminStats.js`
- `src/features/admin/hooks/useAdminOrders.js`
- `src/features/admin/hooks/useUpdateOrderStatus.js`

---

## Деталі реалізації

### AdminLayout (`/admin/*`)
**Layout:**
- Зліва — `AdminSidebar` (фіксована ширина 240px, на мобільному — collapsible).
- Праворуч — контентна область з `<Outlet />`.

**`AdminSidebar`:**
- Лого "Комора · Admin".
- Ссилки на: Dashboard (`/admin`), Замовлення (`/admin/orders`), Товари (`/admin/products`), Блог (`/admin/blog`), Newsletter (`/admin/newsletter`), Підписники (`/admin/subscribers`), Налаштування (`/admin/settings`).
- Активний пункт підсвічено `farm-green`.
- Внизу: ім'я адміна + кнопка "Вийти" (з useAuthActions).
- Окрема ссилка "Перейти на сайт" → `/`.

---

### DashboardPage (`/admin`)

**Хук `useAdminStats()`:**
Збирає статистику кількома паралельними запитами:
```js
// Нові замовлення
const newOrdersQ = query(collection(db, 'orders'), where('status', '==', 'new'));
// Замовлення за місяць
const monthAgo = Timestamp.fromDate(new Date(Date.now() - 30*24*60*60*1000));
const monthOrdersQ = query(collection(db, 'orders'), where('createdAt', '>=', monthAgo));
// Підписників
const subsQ = query(collection(db, 'subscribers'), where('status', '==', 'confirmed'));
// Опубліковані статті
const articlesQ = query(collection(db, 'articles'), where('published', '==', true));
// Активні продукти (inStock)
const productsQ = query(collection(db, 'products'), where('inStock', '==', true));
```
Кожен — через `onSnapshot` для real-time. Повертає `{ newOrders, monthOrders, subscribers, articles, products, loading }`.

**Layout:**

**Ряд статистики (4 картки `StatCard`):**
1. 🔴 **Нові замовлення** — клікабельна, веде до `/admin/orders?status=new`.
2. **Замовлень за місяць**
3. **Підписників**
4. **Статей · Продуктів** (комбінована картка)

`StatCard`: іконка + велике число + лейбл. Якщо `clickable` → hover-ефект і курсор pointer.

**Швидкі дії (3 кнопки):**
- "Написати статтю" → `/admin/blog/new`
- "Додати продукт" → `/admin/products/new`
- "Надіслати розсилку" → `/admin/newsletter`

---

### AdminOrdersPage (`/admin/orders`)

**`StatusFilter`** — горизонтальний ряд табів:
- Усі / Нові / Підтверджені / В дорозі / Доставлені / Скасовані
- Стан в URL: `?status=new`. За замовчуванням — `new`.
- Біля "Нові" показувати лічильник в дужках (з `useAdminStats`).

**`useAdminOrders({ status })`:**
```js
let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
if (status && status !== 'all') {
  q = query(q, where('status', '==', status));
}
// onSnapshot
```

**`AdminOrderTable`:**
Колонки: Номер, Дата, Клієнт (ім'я + телефон), Сума, Статус (бейдж), Дії (кнопка "Деталі" → `/admin/orders/:id`).

**Empty state:** "Замовлень з таким статусом немає".

---

### AdminOrderDetailsPage (`/admin/orders/:id`)

**Layout (2 колонки на десктопі):**

**Ліва (інфо):**
- Заголовок з номером замовлення + поточний `OrderStatusBadge`.
- Інформація про клієнта: ім'я, телефон (з кнопкою "Подзвонити" — `tel:` лінк), email (з `mailto:`).
- Спосіб отримання + адреса / точка самовивозу.
- Список товарів (фото, назва, кількість, ціна, сума).
- Загальна сума (виділено).
- Коментар клієнта (якщо є, у виділеному блоці).
- Дати: створено, останнє оновлення.

**Права (дії):**
- `StatusChanger` — dropdown зі всіма статусами + кнопка "Зберегти статус".
- При виборі `cancelled` — показати textarea "Причина скасування" (обов'язкова).

#### `useUpdateOrderStatus`
```js
const updateStatus = async (orderId, newStatus, cancelReason = null) => {
  const updates = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (newStatus === 'cancelled') updates.cancelReason = cancelReason;

  await updateDoc(doc(db, 'orders', orderId), updates);

  // Тригер email клієнту
  await brevo.sendTransactional({
    to: order.userEmail,
    templateId: STATUS_CHANGE_TEMPLATES[newStatus],
    params: {
      orderNumber: orderId.slice(0, 8),
      status: STATUS_LABELS[newStatus],
      cancelReason,
      customerName: order.userName,
    },
  });

  showToast({ message: 'Статус оновлено, клієнт отримає email', type: 'success' });
};
```

**Brevo templates (створює користувач):**
Окремий transactional template для кожного статусу (5 шт.):
- Підтвердження замовлення (`new` → `confirmed`)
- Передано в доставку (`in_transit`)
- Доставлено (`delivered`)
- Скасовано (з `cancelReason` параметром)

ID шаблонів — у `.env.local`.

---

## Критерії готовності
Див. блок `Module 06 — Admin Core` у `progress.md`.

**Перевірка вручну:**
1. Зайти на `/admin` без ролі admin → редірект на `/`.
2. З роллю admin — Dashboard показує реальну статистику.
3. Створити замовлення з клієнтського акаунта → з'являється в `/admin/orders` з фільтром "Нові".
4. Змінити статус на "Підтверджено" → клієнт отримує email.
5. Скасувати замовлення без причини → submit-кнопка disabled.
6. Скасувати з причиною → клієнт бачить причину в `/account/orders/:id`.
