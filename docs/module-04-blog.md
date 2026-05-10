# Module 04 — Блог

> Завантажити разом з `main.md`. Залежить від Modules 00, 03 (для inline product card).

---

## Що будуємо
1. Список статей `/blog` з фільтрацією по тегах.
2. Сторінку статті `/blog/:id` з рендером rich text і вбудованими картками продуктів.
3. Блок "Інші рецепти" знизу статті.

---

## Файли що створюються

### Components
- `src/features/blog/components/ArticleCard.jsx`
- `src/features/blog/components/TagFilter.jsx`
- `src/features/blog/components/ArticleBody.jsx`
- `src/features/blog/components/InlineProductCard.jsx`
- `src/features/blog/components/RelatedArticles.jsx`

### Pages
- `src/features/blog/pages/BlogPage.jsx`
- `src/features/blog/pages/ArticlePage.jsx`

### Hooks
- `src/features/blog/hooks/useArticles.js`
- `src/features/blog/hooks/useArticle.js`
- `src/features/blog/hooks/useRelatedArticles.js`

---

## Деталі реалізації

### BlogPage (`/blog`)
**Layout:**
- Заголовок "Рецепти".
- `TagFilter` — горизонтальний ряд тег-кнопок зверху (всі унікальні теги з опублікованих статей). Активний тег підсвічений `farm-green`.
- Сітка `ArticleCard` — 3 колонки на десктопі, 1 на мобільному.

**Хук `useArticles({ tag })`:**
```js
// Базовий запит:
let q = query(
  collection(db, 'articles'),
  where('published', '==', true),
  orderBy('createdAt', 'desc')
);
if (tag) {
  q = query(q, where('tags', 'array-contains', tag));
}
// onSnapshot
```

**Стани:**
- `loading: true` — 6 скелетонів.
- Порожньо — `<EmptyState>` з текстом "Поки що немає рецептів" або "За цим тегом нічого не знайдено".

### ArticleCard
- Головне фото зверху (16:9, `object-cover`)
- Заголовок
- Ряд тегів (бейджі)
- Дата (`createdAt` форматована як `15 квітня 2026`)
- Excerpt (2-3 рядки з ellipsis через `line-clamp-3`)
- Кнопка "Читати рецепт" → `/blog/:id`

---

### ArticlePage (`/blog/:id`)
**Layout (контейнер `max-w-3xl mx-auto`):**
- Кнопка "Назад до блогу" зверху.
- Заголовок (h1, великий).
- Метадані: дата + теги.
- Головне фото (`imageUrl`) на повну ширину контейнера.
- `ArticleBody` — рендер `body` (HTML з TipTap).
- `RelatedArticles` — блок "Інші рецепти" знизу.

---

### Вбудовані картки продуктів — критичний механізм

У TipTap (модуль 07) додаються кастомні ноди `<product-mention data-product-id="...">`. У збереженому HTML вони виглядають як:
```html
<p>...звичайний текст рецепту...</p>
<product-mention data-product-id="abc123"></product-mention>
<p>...продовження тексту...</p>
```

**`ArticleBody` рендер-стратегія:**
1. Парсити HTML через `DOMParser` або React HTML parser (`html-react-parser`).
2. При зустрічі ноди `<product-mention>` — підставити React-компонент `<InlineProductCard productId={id} />`.
3. Решта HTML рендериться напряму (через `dangerouslySetInnerHTML` або серіалізацію через парсер).

Рекомендований шлях — `html-react-parser` з custom replacer:
```js
const options = {
  replace: (domNode) => {
    if (domNode.name === 'product-mention') {
      return <InlineProductCard productId={domNode.attribs['data-product-id']} />;
    }
  },
};
return <div className="prose">{parse(article.body, options)}</div>;
```

Tailwind plugin `@tailwindcss/typography` дає клас `prose` для красивого рендеру стандартного HTML (h2, p, ul, blockquote і т.д.).

---

### InlineProductCard
- Завантажує продукт через `useProduct(productId)` (хук з Module 03).
- Поки `loading` — скелетон висотою ~120px.
- Якщо продукт не знайдений (видалений) — нічого не рендерити.
- Layout (горизонтальна картка, виділена бордером і відступами):
  - Ліворуч (30%): фото продукту.
  - Праворуч (70%): назва (h3), ціна, два кнопки в ряд:
    - "До товару" → `/shop/:id` (secondary)
    - "Додати до кошика" — та сама мікровзаємодія що у `ProductCard` (primary)

Стиль картки візуально відрізняється від оточуючого тексту — фон `farm-cream`, тонкий бордер, padding, rounded.

---

### RelatedArticles
**Хук `useRelatedArticles(article)`:**
- Шукає до 3 статей з перетином тегів, виключаючи поточну.
- Стратегія: `query(collection(db, 'articles'), where('tags', 'array-contains-any', article.tags), where('published', '==', true), limit(4))`. Потім фільтрувати локально щоб виключити `article.id` і обрізати до 3.
- Якщо результатів менше 3 → fallback на `where('published', '==', true), orderBy('createdAt', 'desc'), limit(3)` без тегів.

Layout: горизонтальний ряд 3 карток.

---

## Критерії готовності
Див. блок `Module 04 — Блог` у `progress.md`.

**Перевірка вручну:**
Цей модуль повноцінно тестується тільки після Module 07 (де адмін створює статтю з `<product-mention>`). На цьому етапі можна вручну створити документ у Firestore з body виду:
```html
<h2>Тест</h2><p>Текст рецепту.</p><product-mention data-product-id="ID_ІСНУЮЧОГО_ПРОДУКТУ"></product-mention><p>Кінець.</p>
```
і перевірити що `InlineProductCard` рендериться коректно.
