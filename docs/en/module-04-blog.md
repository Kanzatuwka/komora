# Module 04 — Blog

> To be loaded alongside `main.md`. Depends on Modules 00, 03 (for inline product card).

---

## What We Build
1. Recipe list page `/blog` with filtering by tags.
2. Recipe details page `/blog/:id` with rich-text rendering and inline interactive product cards.
3. "Other Recipes" block as a footer of the main article.

---

## Files Created

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

## Implementation Details

### BlogPage (`/blog`)

**Layout:**
- Heading: "Recipes".
- `TagFilter` — row of tag-buttons aligned horizontally at the top (combines all unique tags from currently published articles). The active tag is highlighted with `farm-green`.
- Article Grid — 3 columns on desktop, 1 on mobile.

**Hook `useArticles({ tag })`:**
```js
// Base Query:
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

**States:**
- `loading: true` — 6 skeletons.
- Empty states — `<EmptyState>` with "No recipes yet" or "No recipes found under this tag".

### ArticleCard
- Cover image at the top (16:9 ratio, `object-cover`).
- Heading title.
- Array of tags displayed as badges.
- Date state (`createdAt` formatted as `April 15, 2026`).
- Excerpt (2-3 lines truncated using `line-clamp-3`).
- "Read Recipe" button → `/blog/:id`.

---

### ArticlePage (`/blog/:id`)

**Layout (centered wrapper `max-w-3xl mx-auto`):**
- "Back to Blog" navigation button at the top.
- Title (H1, stylized).
- Article metadata: date + tags.
- Cover photo (`imageUrl`) spanning the full-width of the container.
- `ArticleBody` — parses and renders `body` content (HTML stored by TipTap).
- `RelatedArticles` — footer containing "Other Recipes".

---

### Inline Product Mention Cards — Critical Mechanism

Custom nodes `<product-mention data-product-id="...">` are injected into standard HTML via TipTap editor configuration (Module 07). Stored HTML structure:
```html
<p>...recipe preparation text...</p>
<product-mention data-product-id="abc123"></product-mention>
<p>...instruction continuation text...</p>
```

**`ArticleBody` Render Strategy:**
1. Parse the raw HTML string using `DOMParser` or React HTML parser (`html-react-parser`).
2. When intercepting a `<product-mention>` node, replace it with the custom interactive React component `<InlineProductCard productId={id} />`.
3. Render other standard HTML nodes safely (using `dangerouslySetInnerHTML` or serializing through the parser directly).

Recommended mechanism using `html-react-parser` with custom replacer options:
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

The Tailwind plugin `@tailwindcss/typography` furnishes the `prose` style helper to render default HTML structures elegantly (h2, p, ul, blockquotes, etc.).

---

### InlineProductCard
- Fetches product document via the `useProduct(productId)` hook imported from Module 03.
- While `loading` — show skeleton block of ~120px height.
- If product isn't found (e.g. was deleted) — render nothing (null).
- Layout (horizontal card separated by a sleek border and background paddings):
  - Left panel (30%): Product thumbnail.
  - Right panel (70%): Product name (h3), product price, two buttons side-by-side:
    - "To Product" → `/shop/:id` (secondary button style)
    - "Add to Cart" — triggers same cart micro-interaction as `ProductCard` (primary green button style)

The component style must visibly stand out from normal prose content: styled with a warm `farm-cream` background, a very thin border, elegant paddings, and rounded corners.

---

### RelatedArticles

**Hook `useRelatedArticles(article)`:**
- Retrieves up to 3 articles having overlapping tags, excluding the current active article.
- Query strategy: `query(collection(db, 'articles'), where('tags', 'array-contains-any', article.tags), where('published', '==', true), limit(4))`. Then filter out `article.id` locally and slice to 3.
- If less than 3 results are returned → fallback to returning `where('published', '==', true), orderBy('createdAt', 'desc'), limit(3)` globally.

Layout: Row of 3 card widgets.

---

## Ready Criteria
See the `Module 04 — Blog` section in `progress.md`.
