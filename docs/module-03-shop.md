# Module 03 — Магазин (каталог → checkout)

> Завантажити разом з `main.md`. Залежить від Modules 00, 02.

---

## Що будуємо
1. Каталог `/shop` з фільтрами і сортуванням.
2. Сторінку продукту `/shop/:id`.
3. Кошик `/cart`.
4. Оформлення замовлення `/checkout`.
5. Підтвердження `/order/:id`.
6. Глобальний `Navbar` з лічильником кошика.

---

## Файли що створюються

### Components
- `src/shared/components/Navbar.jsx`
- `src/features/shop/components/ProductCard.jsx`
- `src/features/shop/components/ProductGallery.jsx`
- `src/features/shop/components/CategoryFilter.jsx`
- `src/features/shop/components/SortDropdown.jsx`
- `src/features/shop/components/CartItem.jsx`
- `src/features/shop/components/QuantityCounter.jsx`
- `src/features/shop/components/CheckoutForm.jsx`
- `src/features/shop/components/OrderSummary.jsx`
- `src/features/shop/components/PickupAddressList.jsx`

### Pages
- `src/features/shop/pages/ShopPage.jsx`
- `src/features/shop/pages/ProductPage.jsx`
- `src/features/shop/pages/CartPage.jsx`
- `src/features/shop/pages/CheckoutPage.jsx`
- `src/features/shop/pages/OrderConfirmationPage.jsx`

### Hooks
- `src/features/shop/hooks/useProducts.js`
- `src/features/shop/hooks/useProduct.js`
- `src/features/shop/hooks/useLinkedArticles.js`
- `src/features/shop/hooks/usePickupAddresses.js`
- `src/features/shop/hooks/useCreateOrder.js`

---

## Деталі реалізації

### Navbar (shared)
- Лого "Комора" → `/`.
- Меню: Магазин, Блог, Про нас (anchor на лендінгу).
- Праворуч: іконка кошика з лічильником `count` з `useCart()`. Клік → `/cart`.
- Auth-блок (див. Module 02).
- На мобільному: hamburger menu.

---

### ShopPage (`/shop`)
**Layout:**
- Зліва (на десктопі) — `CategoryFilter`. На мобільному — collapsible зверху.
- Зверху — `SortDropdown` (`Найновіші`, `Ціна ↑`, `Ціна ↓`).
- Сітка `ProductCard` (3 колонки на десктопі, 2 на планшеті, 1 на мобільному).

**Фільтри:**
- Категорії: `Варення` (`jam`), `Соуси` (`sauce`), `Консерви` (`preserve`).
- Під кожною категорією — список тегів (підкатегорій). Теги беруться з усіх продуктів категорії.
- Стан фільтра — у URL search params: `/shop?category=jam&tag=berry&sort=price-asc`. Це дає shareable links і коректний back-navigation.

**Хук `useProducts`:**
```js
function useProducts({ category, tag, sortBy }) {
  // Будує query до /products
  // category → where('category', '==', category)
  // tag → where('tags', 'array-contains', tag)
  // sortBy:
  //   'newest' → orderBy('createdAt', 'desc')
  //   'price-asc' → orderBy('price', 'asc')
  //   'price-desc' → orderBy('price', 'desc')
  // Повертає { products, loading, error }
  // Використовує onSnapshot для real-time
}
```

**Стани:**
- `loading: true` — показати 9 скелетонів карток.
- `products.length === 0` — `<EmptyState>` з текстом "За цим фільтром товарів немає".

---

### ProductCard
**Layout:**
- Фото зверху (квадратне, `aspect-square`, `object-cover`).
- Назва (clickable → `/shop/:id`).
- Ціна.
- `QuantityCounter` (мін. 1).
- Кнопка "Додати до кошика" на повну ширину.

**Мікровзаємодія "Додати до кошика":**
1. Клік → `addItem(product, quantity)` з `useCart`.
2. Кнопка миттєво змінює стан: іконка ✓ + текст "Додано" протягом 1.5 сек.
3. Toast: `{ message: '${product.name} додано до кошика', type: 'success', action: { label: 'Переглянути кошик', onClick: () => navigate('/cart') } }`.
4. Лічильник кошика в Navbar анімовано збільшується (CSS `transition: transform`).
5. Через 1.5 сек кнопка повертається у початковий стан.

**Якщо `inStock: false`:**
- Кнопка disabled, текст "Немає в наявності".
- `QuantityCounter` приховано.

---

### ProductPage (`/shop/:id`)
**Layout (на десктопі — 2 колонки):**
- **Ліва:** `ProductGallery` — велике активне фото + горизонтальний ряд мініатюр знизу. Клік на мініатюру → змінює активне.
- **Права:** Назва, ціна, опис, `QuantityCounter`, кнопка "Додати до кошика" (та сама мікровзаємодія).

**Знизу (на повну ширину):**
- Блок "Рецепти з цим продуктом" — горизонтальний ряд карток статей з `linkedArticleIds`.

**Хук `useLinkedArticles(linkedArticleIds)`:**
- Якщо масив порожній → повертає `[]`.
- Інакше — `query(collection(db, 'articles'), where('__name__', 'in', linkedArticleIds), where('published', '==', true))`.
- Firestore обмежує `in` до 10 елементів — для блогу під продуктом цього достатньо.

---

### CartPage (`/cart`)
**Layout:**
- Зліва — список `CartItem` (фото, назва, ціна, `QuantityCounter`, кнопка видалити з іконкою).
- Праворуч — блок підсумку: кількість позицій, загальна сума, кнопка "Оформити замовлення" → `/checkout`.

**Поведінка:**
- Зміна кількості → миттєвий перерахунок суми (з `CartContext`).
- Видалення позиції → toast "Видалено з кошика".
- Якщо `items.length === 0` → `<EmptyState>` з текстом "Кошик порожній" і кнопкою "До магазину" → `/shop`.

---

### CheckoutPage (`/checkout`)
**Захист:** якщо `!user` → редірект на `/login` зі `state.from = /checkout`.
**Захист:** якщо `items.length === 0` → редірект на `/shop`.

**Layout (на десктопі — 2 колонки):**
- **Ліва (60%):** `CheckoutForm`.
- **Права (40%):** `OrderSummary` (sticky на десктопі, в кінці на мобільному).

#### CheckoutForm
**Поля:**
- Ім'я та прізвище * (передзаповнені з `user.displayName` / `users/{uid}.name`)
- Телефон * (передзаповнений з `users/{uid}.phone`)
- Email * (передзаповнений з `user.email`, readonly)
- Радіо: **Доставка / Самовивіз**
- Якщо Доставка:
  - Вулиця *, Місто *, Індекс *
  - Якщо в `/addresses` є записи цього користувача — показати dropdown "Вибрати збережену адресу" зверху форми.
- Якщо Самовивіз:
  - `PickupAddressList` — радіо-список з `/pickupAddresses`. Кожна точка: назва, адреса, години.
- Коментар (textarea, optional)

**Валідація:**
- Обов'язкові поля при submit з порожнім значенням → червона рамка + текст помилки під полем.
- Телефон — маска (наприклад, `+38 (___) ___-__-__`).
- Email — формат.
- Submit-кнопка disabled поки форма не валідна.

#### `useCreateOrder`
```js
const { createOrder, loading } = useCreateOrder();
// При submit:
// 1. Створити документ у /orders зі статусом 'new'
// 2. Викликати brevo.sendTransactional з template для підтвердження замовлення
// 3. clearCart()
// 4. navigate(`/order/${orderId}`)
```

---

### OrderConfirmationPage (`/order/:id`)
- Читає `id` з URL, завантажує документ через `useOrder(id)`.
- Захист: показувати тільки якщо `order.userId === user.uid` (або `role === 'admin'`).
- Контент:
  - Великий заголовок: "Замовлення №[коротка форма id] прийнято"
  - Список товарів з кількостями і сумами
  - Адреса доставки або точка самовивозу
  - Текст: *"Ми надіслали підтвердження на [email]. Слідкувати за статусом можна в особистому кабінеті."*
  - Кнопка "Повернутися до магазину" → `/shop`.

---

## Критерії готовності
Див. блок `Module 03 — Магазин` у `progress.md`.

**Перевірка вручну:**
1. Додати товар у кошик → лічильник у Navbar +1, тост з'явився.
2. Перезавантажити сторінку → кошик зберігся.
3. Оформити замовлення → перевірити `/orders/{id}` у Firestore створено зі статусом `new`.
4. Email підтвердження прийшов на пошту клієнта.
5. Кошик очистився.
6. Сторінка `/order/:id` доступна тільки власнику замовлення.
