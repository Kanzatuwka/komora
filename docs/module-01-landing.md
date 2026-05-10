# Module 01 — Landing Page + Newsletter

> Завантажити разом з `main.md`. Залежить від Module 00.

---

## Що будуємо
1. Лендінг (`/`) з 6 секціями зверху вниз.
2. Newsletter форма з double opt-in flow через Brevo.
3. Сторінку `/subscription-confirmed` для завершення опт-іна.

---

## Файли що створюються
- `src/features/landing/pages/LandingPage.jsx` (замінити placeholder)
- `src/features/landing/components/HeroSection.jsx`
- `src/features/landing/components/AboutSection.jsx`
- `src/features/landing/components/FeaturedProducts.jsx`
- `src/features/landing/components/FeaturedArticles.jsx`
- `src/features/landing/components/Footer.jsx`
- `src/features/newsletter/components/SubscribeForm.jsx`
- `src/features/newsletter/hooks/useSubscribe.js`
- `src/features/newsletter/pages/SubscriptionConfirmedPage.jsx` (замінити placeholder)

---

## Деталі реалізації

### LandingPage — секції зверху вниз

#### 1. Hero
- Підтягує `/settings/landing.hero` через хук `useLandingSettings()` (читає документ один раз через `getDoc`, повертає `{ hero, about, loading }`).
- Поля: `title`, `subtitle`, `ctaText`, `imageUrl`.
- Фонове зображення на повну ширину, текст і CTA-кнопка зверху.
- Кнопка веде на `/shop`.
- Поки `loading: true` — показати скелетон висотою 80vh.

#### 2. Про нас
- Той самий хук, поле `about: { text, imageUrl }`.
- Двоколонковий layout: текст ліворуч, фото праворуч (на мобільному — стек).

#### 3. Наші продукти
- Хук `useFeaturedProducts(limit = 4)` → запит до `/products` з `where('featured', '==', true)`, `limit(4)`.
- Сітка 4 карток (на мобільному — 2 колонки).
- Кнопка "Всі продукти" → `/shop`.
- Поки `loading: true` — 4 скелетони карток.
- Картка тут — спрощена (фото, назва, ціна, лінк на сторінку продукту). Повну `ProductCard` з кошиком — у Module 03.

#### 4. Рецепти
- Хук `useFeaturedArticles(limit = 3)` → запит до `/articles` з `where('featured', '==', true)`, `where('published', '==', true)`, `limit(3)`.
- Сітка 3 карток.
- Кнопка "Всі рецепти" → `/blog`.

#### 5. Newsletter
Окремий блок з `SubscribeForm`. Текст-заклик зліва, форма справа.

#### 6. Footer
- Колонки: Навігація (Магазин, Блог, Про нас), Контакти (email, телефон), Соцмережі (іконки lucide-react).
- Рядок копірайту: "© 2026 Комора".

---

### Newsletter — Double Opt-In Flow

#### `useSubscribe.js`
```js
export function useSubscribe() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const subscribe = async (email) => {
    setLoading(true);
    try {
      // 1. Перевірити чи вже існує підписник
      const existing = await getDocs(query(
        collection(db, 'subscribers'),
        where('email', '==', email)
      ));
      if (!existing.empty) {
        const status = existing.docs[0].data().status;
        if (status === 'confirmed') {
          showToast({ message: 'Ви вже підписані', type: 'info' });
        } else {
          showToast({ message: 'Лист підтвердження вже надіслано — перевірте пошту', type: 'info' });
        }
        return;
      }

      // 2. Створити документ зі статусом pending
      await addDoc(collection(db, 'subscribers'), {
        email,
        status: 'pending',
        subscribedAt: serverTimestamp(),
      });

      // 3. Тригернути Brevo confirmation template
      await brevoSubscribe(email);

      showToast({
        message: 'Перевірте пошту — ми надіслали листа для підтвердження',
        type: 'success',
        duration: 5000,
      });
    } catch (err) {
      showToast({ message: 'Не вдалося підписатися. Спробуйте пізніше.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
}
```

#### Brevo confirmation template
У Brevo console template містить лінк виду:
```
https://[твій-домен]/subscription-confirmed?email={{contact.EMAIL}}
```
(Brevo підставляє email в `{{contact.EMAIL}}` автоматично.)

#### `SubscriptionConfirmedPage`
- Читає `email` з `useSearchParams`.
- При монтуванні викликає `confirmSubscription(email)`:
  1. Знайти документ у `/subscribers` де `email === email`.
  2. Оновити `status: 'confirmed'`.
  3. Викликати Brevo welcome template (`sendTransactional`).
- Стан компонента: `loading | success | error`.
- Success: великий заголовок "Підписку підтверджено", текст подяки, кнопка "На головну" → `/`.
- Error (email не знайдено / вже підтверджений): показати відповідне повідомлення.

#### `SubscribeForm`
- Поле email + кнопка "Підписатися".
- Валідація формату email перед відправкою.
- Під час `loading` — кнопка disabled + spinner всередині.
- Після успіху — форма очищається.

---

## Критерії готовності
Див. блок `Module 01 — Landing + Newsletter` у `progress.md`.
