# Module 07 — Admin Panel: Products & Articles (CMS)

> To be loaded alongside `main.md`. Depends on Modules 00, 03, 04.

---

## What We Build
1. Products List page `/admin/products` + Create/Edit form `/admin/products/new` and `/admin/products/:id`.
2. Blog list page `/admin/blog` + Write/Edit form `/admin/blog/new` and `/admin/blog/:id`.
3. Image drag-and-drop uploader to Firebase Storage (up to 5 photos for products, 1 cover for articles).
4. Product attachment mechanisms: selecting which products belong in a recipe, and which recipes reference a product.
5. Integration of a custom **TipTap** Rich-text Editor with our customized `<product-mention>` node extension.

---

## Files Created
- `src/features/admin/pages/ProductsPage.jsx` (replace placeholder)
- `src/features/admin/pages/ProductFormPage.jsx` (replace placeholder)
- `src/features/admin/components/ProductForm.jsx`
- `src/features/admin/components/ImageUploader.jsx`
- `src/features/admin/components/RecipeSectionLinker.jsx` (associates articles with product details)
- `src/features/admin/pages/BlogPage.jsx` (replace placeholder)
- `src/features/admin/pages/ArticleFormPage.jsx` (replace placeholder)
- `src/features/admin/components/ArticleForm.jsx`
- `src/features/admin/components/ProductSectionLinker.jsx` (associates product widgets underneath articles)
- `src/features/admin/components/Editor/TipTapEditor.jsx`
- `src/features/admin/components/Editor/Extensions/ProductMention.js`

---

## Implementation Details

### Products Catalog Management (`/admin/products`)
- Grid list displaying product photos, names, categories, inventory status badges (`In Stock` vs `Out of Stock`), pricing, and "Edit" buttons.
- "Create New Product" button leading to `/admin/products/new`.
- Pagination or search bar input to filter items by name.

### Product EditorForm (Create/Edit)
- **Fields:**
  - Name *, Category * (select element: `jam` | `sauce` | `preserve`).
  - Price * (input field, minimum `0.01`).
  - Inventory status * (checkbox or select: `In Stock` / `Out of Stock`).
  - Description (textarea panel).
  - Tags array (comma-separated or chips list).
  - Attached Article references (`linkedArticleIds` multiselect picker).
  - Images (via the `ImageUploader` component).
- Standard client-side input validations, visual "Delete product" button with confirmation alert (only in edit mode).

---

### ImageUploader Component (Drag & Drop)
- Clean clickable area designated with dotted borders: *"Drag photos here or tap to upload"*.
- Handles drops. Translates file targets into `uploadBytesResumable` jobs: `/products/{productId}/{filename}_{timestamp}`.
- Displays realistic progress state bars above each loading preview indicator.
- List of uploaded thumbnails supporting ordering sorting and simple deletes.
- Safety restriction: Max size 5MB, format limit (images only), total limit of 5.

---

### Blog Posts Management (`/admin/blog`)
- Listing of all news/recipes showing article title, cover image preview, tags list, publication state (`Published` / `Draft`), and edit button.
- "Write New Article" CTA leading to `/admin/blog/new`.

### Article EditorForm (Create/Edit)
- **Fields:** Title *, Excerpt * (short card snippet description), Cover Photo (single file drag-and-drop to `/articles/{id}`), Tags array, Publication status (checkbox: `Published` / `Draft`), Featured status (checkbox: `Featured`), Associated Products (`linkedProductIds` multiselect list).
- Rich-Text Editor core component for the Article body text field.

---

### Custom UI Rich Text Editor — TipTap + Products Embedding

We configure a custom TipTap component. This component extends standard schemas (`StarterKit`, `Underline`, `Link`, etc.) and adds a custom Node Extension called `ProductMention`.

#### 1. Custom Node Extension (`ProductMention.js`)
Builds a custom HTML representation. Renders inside the editor wrapper as a recognizable component showing product card embeds.

```js
import { Node, mergeAttributes } from '@tiptap/core';

export const ProductMention = Node.create({
  name: 'productMention',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      productId: {
        default: null,
        parseHTML: element => element.getAttribute('data-product-id'),
        renderHTML: attributes => ({ 'data-product-id': attributes.productId }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'product-mention' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['product-mention', mergeAttributes(HTMLAttributes), 0];
  },
});
```

#### 2. Editor Toolbar Menu & Embedded Mention Modal
- Toolbar styling options (H2, bold, italic, lists, insert link, underline).
- Unique Button: **"Insert Product Link"**.
- Action: Clicking this inserts custom block element `productMention`. Renders custom Node component representing the respective selected product.
- Editor saved HTML: serializes into raw `<product-mention data-product-id="..."></product-mention>`, saved directly in the `/articles/{id}.body` Firestore field (Module 04 parses and loads this).

---

## Ready Criteria
See the `Module 07 — Admin Products & Articles (CMS)` section in `progress.md`.
```
- [ ] Drag-and-drop uploader uploads files and displays progress indicators.
- [ ] Product images are deleted when clicking trash icon in preview grid.
- [ ] TipTap correctly embeds products as atomic custom block components.
- [ ] Saving an article saves raw <product-mention> tag blocks in DB.
- [ ] Article listing allows drafts and publishing toggles.
- [ ] Product details display linked recipes dynamically.
```
