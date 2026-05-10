# Module 07 — Admin CMS (Товари + Блог)

> Завантажити разом з `main.md`. Залежить від Modules 00, 03, 04, 06.

---

## Що будуємо
1. CRUD товарів `/admin/products` з галереєю в Firebase Storage.
2. CRUD статей `/admin/blog` з TipTap rich text editor.
3. Кастомний node TipTap `<product-mention>` для вставки картки продукту в текст.
4. Двосторонню прив'язку статей ↔ продуктів.

---

## Файли що створюються

### Товари
- `src/features/admin/components/ProductTable.jsx`
- `src/features/admin/components/ProductForm.jsx`
- `src/features/admin/components/ImageUploader.jsx`
- `src/features/admin/components/TagMultiSelect.jsx`
- `src/features/admin/components/ArticlePicker.jsx`
- `src/features/admin/pages/AdminProductsPage.jsx`
- `src/features/admin/pages/ProductFormPage.jsx`
- `src/features/admin/hooks/useAdminProducts.js`
- `src/features/admin/hooks/useUploadImage.js`

### Блог
- `src/features/admin/components/ArticleTable.jsx`
- `src/features/admin/components/ArticleForm.jsx`
- `src/features/admin/components/RichTextEditor.jsx`
- `src/features/admin/components/ProductPicker.jsx`
- `src/features/admin/pages/AdminBlogPage.jsx`
- `src/features/admin/pages/ArticleFormPage.jsx`
- `src/features/admin/hooks/useAdminArticles.js`

---

## Деталі реалізації — Товари

### AdminProductsPage (`/admin/products`)

**Зверху:** кнопка "+ Додати товар" → `/admin/products/new` + фільтр по категоріях.

**`ProductTable`:**
Колонки: фото (мала превʼю), назва, категорія, ціна, статус (`inStock` як перемикач), `featured` (як іконка ⭐), дії (Редагувати → `/admin/products/:id`, Видалити → з підтвердженням).

Перемикач `inStock` працює в таблиці без переходу на форму — швидке inline-редагування.

### ProductFormPage (`/admin/products/new` і `/admin/products/:id`)

**Поля:**
- Назва (text, обов'язкове)
- Категорія (radio: Варення / Соуси / Консерви)
- Теги — `TagMultiSelect`: показує існуючі теги цієї категорії з `/products`, дозволяє вибрати кілька + додати новий тег вручну (натиснути Enter)
- Ціна (number, мін. 0.01)
- Опис (textarea, обов'язкове)
- **Галерея** — `ImageUploader` (див. нижче)
- Перемикач "В наявності" (`inStock`)
- Прапорець "Показувати на головній" (`featured`)
- **Прив'язані статті** — `ArticlePicker`: пошук по заголовках з `/articles`, мультивибір. Зберігається у `linkedArticleIds`.

**Кнопки:**
- "Скасувати" → `/admin/products`
- "Зберегти" — створює або оновлює документ

#### `ImageUploader`
- Drag-and-drop зона + кнопка "Вибрати файли".
- Прев'ю завантажених фото (вертикальний/горизонтальний ряд).
- Кожне фото:
  - Кнопка видалення (хрестик).
  - Drag-handle для зміни порядку.
- Реалізація drag-and-drop: `@dnd-kit/sortable`.

#### `useUploadImage`
```js
const uploadImage = async (file, folder = 'products') => {
  const ext = file.name.split('.').pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
```
Повертає URL який зберігається у масив `images` у документі продукту.

⚠ При видаленні продукту або фото з галереї — додатково видалити файл зі Storage:
```js
import { ref, deleteObject } from 'firebase/storage';
// з URL отримуємо ref:
const fileRef = ref(storage, url);
await deleteObject(fileRef);
```

#### Двостороння прив'язка `linkedArticleIds`
Коли адмін додає продукт у `linkedArticleIds` статті (з боку Module 04 / тут — з боку статті), потрібно також додати `articleId` у `linkedArticleIds` продукту і навпаки.

**Простіший підхід:** використати batch:
```js
const batch = writeBatch(db);
batch.update(doc(db, 'products', productId), { linkedArticleIds: [...newArticleIds] });
// Для кожної доданої статті:
addedArticleIds.forEach(articleId => {
  batch.update(doc(db, 'articles', articleId), {
    linkedProductIds: arrayUnion(productId)
  });
});
// Для кожної видаленої:
removedArticleIds.forEach(articleId => {
  batch.update(doc(db, 'articles', articleId), {
    linkedProductIds: arrayRemove(productId)
  });
});
await batch.commit();
```

---

## Деталі реалізації — Блог

### AdminBlogPage (`/admin/blog`)

**Зверху:** кнопка "+ Написати статтю" + фільтр по статусу (Усі / Опубліковані / Чернетки).

**`ArticleTable`:**
Колонки: фото, заголовок, теги, дата, статус (`published` як перемикач), `featured` (⭐), дії.

### ArticleFormPage (`/admin/blog/new` і `/admin/blog/:id`)

**Поля:**
- Заголовок (text)
- Теги — `TagMultiSelect` (з усіх існуючих тегів статей)
- Excerpt (textarea, обмежений 200 символами)
- Головне фото — одиничний `ImageUploader` (один файл) → `imageUrl`
- **Тіло статті** — `RichTextEditor` (TipTap)
- **Прив'язані продукти** — `ProductPicker`: пошук по назвах продуктів, мультивибір. Зберігається у `linkedProductIds`.
- Перемикач "Опублікувати" (`published`)
- Прапорець "Показувати на головній" (`featured`)

---

### `RichTextEditor` — TipTap

**Базовий setup:**
```js
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ProductMention } from './ProductMention'; // кастомний

const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    Link.configure({ openOnClick: false }),
    ProductMention,
  ],
  content: article?.body || '',
});
```

**Toolbar (зверху редактора):**
- Bold, Italic, Strike
- H2, H3
- Bullet list, Ordered list
- Blockquote
- Link (модалка з URL input)
- Image (відкриває диалог завантаження → Storage → вставляє `<img>`)
- **Insert Product Card** — відкриває `ProductPicker` модалку → при виборі вставляє `<product-mention data-product-id="ID">`

#### Кастомний node `ProductMention`
```js
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { InlineProductCard } from '@/features/blog/components/InlineProductCard';

const ProductMentionView = ({ node, deleteNode }) => (
  <NodeViewWrapper>
    <div className="relative group">
      <InlineProductCard productId={node.attrs.productId} />
      <button
        onClick={deleteNode}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  </NodeViewWrapper>
);

export const ProductMention = Node.create({
  name: 'productMention',
  group: 'block',
  atom: true,
  addAttributes() {
    return { productId: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'product-mention' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['product-mention', mergeAttributes({
      'data-product-id': HTMLAttributes.productId
    })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ProductMentionView);
  },
});
```

**Команда вставки:**
```js
editor.commands.insertContent({
  type: 'productMention',
  attrs: { productId: selectedProduct.id },
});
```

**Збереження:** `editor.getHTML()` → у поле `body` Firestore.
**Завантаження:** `editor.commands.setContent(article.body)` при відкритті форми.

#### Двостороння прив'язка
Та сама логіка `writeBatch` що для продуктів — тільки тут оновлюємо `linkedProductIds` статті і `linkedArticleIds` продуктів.

⚠ Важливо: продукти, вставлені через `<product-mention>` в тілі — НЕ автоматично у `linkedProductIds`. Це різні речі:
- `linkedProductIds` — для блоку "Інші рецепти" і двосторонньої прив'язки.
- `<product-mention>` — для inline-вставок у тексті.

Адмін сам вирішує що куди.

---

## Критерії готовності
Див. блок `Module 07 — Admin CMS` у `progress.md`.

**Перевірка вручну:**
1. Створити продукт з 3 фото → переставити порядок → зберегти.
2. Перевірити `/products/{id}.images` у Firestore — порядок збережено.
3. Зробити продукт `featured` → з'являється на лендінгу.
4. Створити статтю з вставленим `<product-mention>` → опублікувати.
5. Відкрити `/blog/:id` → картка продукту рендериться у тілі статті.
6. Натиснути "Додати до кошика" з картки в статті → працює.
7. Видалити продукт зі Storage → файл зник з bucket.
8. Зайти на сторінку статті де посилається на видалений продукт — `InlineProductCard` нічого не рендерить.
