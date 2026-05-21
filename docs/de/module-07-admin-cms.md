# Modul 07 — Admin-Bereich: Produkte & Artikel (CMS)

> Zusammen mit `main.md` laden. Hängt von Modul 00, 03, 04 ab.

---

## Was wir bauen
1. Verzeichnis der Produkte `/admin/products` + Erstellungs-/Bearbeitungsformular `/admin/products/new` und `/admin/products/:id`.
2. Liste der Rezepte `/admin/blog` + Erstellungs-/Bearbeitungsformular `/admin/blog/new` und `/admin/blog/:id`.
3. Image-Uploader per Drag & Drop in Firebase Storage (bis zu 5 Fotos für Produkte, 1 Hauptbild für Artikel).
4. Verknüpfungsmechanismus: Auswahl, welche Produkte zu einem Rezept gehören, und welche Rezepte unter einem bestimmten Produkt angezeigt werden.
5. Integration eines konfigurierbaren **TipTap** Rich-Text-Editors mit unserer anwendungsspezifischen Node-Erweiterung `<product-mention>`.

---

## Zu erstellende Dateien
- `src/features/admin/pages/ProductsPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/pages/ProductFormPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/ProductForm.jsx`
- `src/features/admin/components/ImageUploader.jsx`
- `src/features/admin/components/RecipeSectionLinker.jsx` (Auswahl verknüpfter Rezepte für ein Produkt)
- `src/features/admin/pages/BlogPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/pages/ArticleFormPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/ArticleForm.jsx`
- `src/features/admin/components/ProductSectionLinker.jsx` (Auswahl verknüpfter Produkte für einen Artikel)
- `src/features/admin/components/Editor/TipTapEditor.jsx`
- `src/features/admin/components/Editor/Extensions/ProductMention.js`

---

## Details zur Implementierung

### Produktverwaltung list (`/admin/products`)
- Liste in Rasterform mit Produktfotos, Namen, Kategorien, Lagerstatus-Badges (`Auf Lager` / `Nicht auf Lager`), Preisen und "Bearbeiten"-Buttons.
- Button "Produkt hinzufügen" → führt zu `/admin/products/new`.
- Sucheingabe zur Schnellsuche nach Name.

### Produkt-Formular (Erstellen/Bearbeiten)
- **Formularfelder:**
  - Name *, Kategorie * (Auswahlfeld: `jam` | `sauce` | `preserve`).
  - Preis * (Nummernfeld, Mindestwert `0.01`).
  - Lagerstatus * (Checkbox oder Auswahl: `Auf Lager` / `Nicht auf Lager`).
  - Beschreibung (Textbereich).
  - Tags (Komma-separiert oder als Chips-Liste).
  - Verknüpfte Rezepte (`linkedArticleIds` Mehrfachauswahlliste).
  - Fotos (über die Komponente `ImageUploader`).
- Standard-Validierungen, Löschen-Button mit Sicherheitsabfrage (nur im Bearbeitungsmodus).

---

### ImageUploader (Drag & Drop)
- Bereich mit gestricheltem Rahmen: *"Fotos hierher ziehen oder klicken zum Hochladen"*.
- Verarbeitet das Drop-Event und wandelt Dateien in `uploadBytesResumable`-Tasks um: `/products/{productId}/{filename}_{timestamp}`.
- Zeigt den echten Ladefortschritt in Balkenform über jedem Miniaturbild an.
- Bilder-Vorschau-Raster mit Möglichkeit zur Umsortierung und Löschfunktion (Abfrage).
- Beschränkung: Dateigröße Max 5MB, nur gängige Bildformate, maximale Gesamtzahl von 5 Fotos.

---

### Artikelverwaltung (`/admin/blog`)
- Liste aller Rezepte/Artikel mit Titel, Vorschaubild, Tags, Status-Badge (`Veröffentlicht` / `Entwurf`) und Bearbeitungsbutton.
- Button "Rezept schreiben" → führt zu `/admin/blog/new`.

### Artikel-Formular (Erstellen/Bearbeiten)
- **Formularfelder:** Titel *, Teaser/Auszug * (Kurzzusammenfassung), Hauptfoto (Drag & Drop in `/articles/{id}`), Tags, Status (`Veröffentlicht` / `Entwurf`), Featured-Status (`Hervorgehoben` anzeigen), Verknüpfte Produkte (`linkedProductIds` Mehrfachauswahlliste).
- Rich-Text-Editor für das Textkörper-Feld.

---

### Tiptap-Rich-Text-Editor mit Produkt-Mentions

Wir erstellen eine konfigurierbare TipTap-Komponente. Sie erweitert die Standards (`StarterKit`, `Underline`, `Link` usw.) und fügt die Node-Erweiterung `ProductMention` hinzu.

#### 1. Node-Erweiterung (`ProductMention.js`)
Bestimmt, wie eingebettete Produktkarten im Editor und im fertigen HTML gerendert werden.

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

#### 2. Editor-Toolbar & Auswahldialog
- Toolbar-Optionen (Überschrift, Fett, Kursiv, Listen, Link einfügen, Unterstreichen).
- Spezifischer Button: **"Produkt einbetten"**.
- Aktion: Klick öffnet ein Modal mit der Suche nach allen Produkten auf Lager. Der Administrator wählt das gewünschte Produkt aus.
- Nach der Auswahl wird die benutzerdefinierte Node `productMention` an der Cursorposition eingefügt. Im Editor wird sie als Blockkarte gerendert.
- Gespeichertes HTML: Enthält den Block `<product-mention data-product-id="..."></product-mention>`, der unverschlüsselt in das Feld `body` der Kollektion `/articles/{id}` gespeichert wird.

---

## Kriterien für die Fertigstellung
Siehe Block `Module 07 — Admin Products & Articles (CMS)` in `progress.md`.
