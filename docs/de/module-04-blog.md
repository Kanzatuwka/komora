# Modul 04 — Blog

> Zusammen mit `main.md` laden. Hängt von Modul 00, 03 ab (für die Inline-Produktkarte).

---

## Was wir bauen
1. Liste der Artikel / Rezepte `/blog` mit Filterung nach Tags.
2. Artikelseite `/blog/:id` mit Rich-Text-Rendering und eingebetteten Produktkarten.
3. Block "Weitere Rezepte" am Ende des Artikels.

---

## Zu erstellende Dateien

### Komponenten
- `src/features/blog/components/ArticleCard.jsx`
- `src/features/blog/components/TagFilter.jsx`
- `src/features/blog/components/ArticleBody.jsx`
- `src/features/blog/components/InlineProductCard.jsx`
- `src/features/blog/components/RelatedArticles.jsx`

### Seiten
- `src/features/blog/pages/BlogPage.jsx`
- `src/features/blog/pages/ArticlePage.jsx`

### Hooks
- `src/features/blog/hooks/useArticles.js`
- `src/features/blog/hooks/useArticle.js`
- `src/features/blog/hooks/useRelatedArticles.js`

---

## Details zur Implementierung

### BlogPage (`/blog`)

**Layout:**
- Überschrift "Rezepte".
- `TagFilter` — eine horizontale Reihe von Tag-Buttons (alle einzigartigen Tags aus den veröffentlichten Artikeln). Der aktive Tag wird mit `farm-green` hervorgehoben.
- Raster von `ArticleCard` — 3 Spalten auf Desktop, 1 auf Mobilgeräten.

**Hook `useArticles({ tag })`:**
```js
// Basisabfrage:
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

**Zustände:**
- `loading: true` — 6 Skeletons anzeigen.
- Keine Artikel vorhanden — `<EmptyState>` mit dem Text "Es gibt noch keine Rezepte" oder "Unter diesem Tag wurde nichts gefunden".

### ArticleCard (Artikelkarte)
- Hauptfoto oben (16:9 Format, `object-cover`).
- Überschrift.
- Reihe von Tags (Badges).
- Erstellungsdatum (`createdAt` formatiert, z.B. `15. April 2026`).
- Teaser / Auszug (Excerpt) (2-3 Zeilen mit Auslassungspunkten über `line-clamp-3`).
- Button "Rezept lesen" → `/blog/:id`.

---

### ArticlePage (`/blog/:id`)

**Layout (Container `max-w-3xl mx-auto`):**
- Button "Zurück zum Blog" oben.
- Überschrift (h1, groß).
- Metadaten: Datum + Tags.
- Hauptbild (`imageUrl`) über die volle Breite des Containers.
- `ArticleBody` — rendert den `body`-Inhalt (HTML aus TipTap).
- `RelatedArticles` — Block "Weitere Rezepte" am Ende.

---

### Eingebettete Produktkarten — Kritischer Mechanismus

In TipTap (Modul 07) werden benutzerdefinierte Nodes `<product-mention data-product-id="...">` hinzugefügt. Im gespeicherten HTML sehen diese wie folgt aus:
```html
<p>...Standardtext des Rezepts...</p>
<product-mention data-product-id="abc123"></product-mention>
<p>...Fortsetzung des Textes...</p>
```

**`ArticleBody` Render-Strategie:**
1. HTML-String über `DOMParser` oder einen React-HTML-Parser (`html-react-parser`) parsen.
2. Wenn eine Node `<product-mention>` gefunden wird — wird diese durch die React-Komponente `<InlineProductCard productId={id} />` ersetzt.
3. Der restliche HTML-Code wird direkt ausgegeben (mittels `dangerouslySetInnerHTML` oder Serialisierung über den Parser).

Empfohlener Weg — `html-react-parser` mit benutzerdefiniertem Ersetzungs-Replacer:
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

Das Tailwind-Plugin `@tailwindcss/typography` bietet die Klasse `prose` für ein sehr ansprechendes Rendering von Standard-HTML (h2, p, ul, blockquote usw.).

---

### InlineProductCard (Inline-Produktkarte)
- Lädt das Produkt über den Hook `useProduct(productId)` (aus Modul 03).
- Während des Ladevorgangs (`loading`) — ein Skeleton mit einer Höhe von ~120px anzeigen.
- Wenn das Produkt nicht vorhanden oder gelöscht ist — nichts rendern (null zurückgeben).
- Layout (horizontale Karte, abgegrenzt durch Rahmen und Abstände):
  - Links (30%): Produktfoto.
  - Rechts (70%): Name (h3), Preis, zwei Buttons nebeneinander:
    - "Hier geht's zum Produkt" → `/shop/:id` (secondary)
    - "In den Warenkorb" — dieselbe Mikro-Interaktion wie in der standardmäßigen `ProductCard` (primary)

Der Stil dieser Karte unterscheidet sich deutlich vom umgebenden Text: Hintergrund `farm-cream`, dünner Rahmen, Innenabstände (Padding), abgerundete Ecken.

---

### RelatedArticles (Verwandte Artikel)

**Hook `useRelatedArticles(article)`:**
- Sucht nach bis zu 3 Artikeln mit überschneidenden Tags, exklusive des aktuellen Artikels.
- Strategie: `query(collection(db, 'articles'), where('tags', 'array-contains-any', article.tags), where('published', '==', true), limit(4))`. Anschließend lokal filtern, um `article.id` auszuschließen, und auf 3 Artikel kürzen.
- Wenn weniger als 3 Ergebnisse vorhanden sind → Fallback auf `where('published', '==', true), orderBy('createdAt', 'desc'), limit(3)` ohne Tags.

Layout: Horizontale Reihe von 3 Karten.

---

## Kriterien für die Fertigstellung
Siehe Block `Module 04 — Blog` in `progress.md`.
