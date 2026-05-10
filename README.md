# Комора — Фермерські продукти з душею 🍓

Це сучасна e-commerce платформа для сімейної ферми, побудована на стеку React + Firebase. Проєкт дозволяє користувачам купувати натуральні продукти, читати рецепти в блозі та керувати своїми замовленнями, а адмінам — гнучко керувати контентом та маркетингом.

## 🛠 Технологічний стек

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Анімації:** Framer Motion (`motion/react`)
- **Backend:** Firebase (Authentication, Firestore, Cloud Storage)
- **Email/Маркетинг:** Brevo (Sendinblue) API
- **Іконки:** Lucide React
- **Робота з датами:** date-fns

## 🚀 Основні модулі

1. **Магазин:** Фільтрація, сортування, детальні сторінки товарів, кошик, оформлення замовлення.
2. **Блог:** Рецепти зі вбудованими картками продуктів (двосторонні зв'язки).
3. **Особистий кабінет:** Історія замовлень, профілі користувачів, менеджер адрес доставки.
4. **Адмін-панель (Dashboard):**
   - Статистика замовлень та продажів.
   - CRUD управління товарами та статтями блогу.
   - Ультрасучасний редактор контенту (TipTap).
   - Менеджер підписників та розсилок через Brevo.
   - Налаштування лендінгу (Hero, Про нас, Самовивіз).

## ⚙️ Налаштування

Для роботи проєкту необхідні наступні змінні оточення в `.env.local`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Brevo (Email Service)
VITE_BREVO_API_KEY=your_brevo_key
VITE_BREVO_LIST_ID=your_newsletter_list_id
VITE_BREVO_DOI_CONFIRM_TEMPLATE_ID=1
VITE_BREVO_DOI_WELCOME_TEMPLATE_ID=2
VITE_BREVO_ORDER_PLACED_TEMPLATE_ID=3
VITE_BREVO_ORDER_CONFIRMED_TEMPLATE_ID=4
VITE_BREVO_ORDER_IN_TRANSIT_TEMPLATE_ID=5
VITE_BREVO_ORDER_DELIVERED_TEMPLATE_ID=6
VITE_BREVO_ORDER_CANCELLED_TEMPLATE_ID=7
```

## 🔐 Безпека

База даних Firestore та Storage захищені правилами, що дозволяють запис лише автентифікованим користувачам (для їх власних даних) та адмінам (для всього контенту).

Щоб додати першого адміністратора:
1. Зареєструйтеся в додатку.
2. В Firebase Console знайдіть документ користувача в колекції `users`.
3. Додайте/змініть поле `role: "admin"`.

---
© 2024 Комора. Побудовано з любов'ю до природи.
