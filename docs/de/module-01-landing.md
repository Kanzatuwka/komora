# Modul 01 — Landingpage + Newsletter

> Zusammen mit `main.md` laden. Hängt von Modul 00 ab.

---

## Was wir bauen
1. Landingpage (`/`) mit 6 Abschnitten von oben nach unten.
2. Newsletter-Formular mit Double-Opt-In-Ablauf über Brevo.
3. Bestätigungsseite `/subscription-confirmed` zum Abschluss des Opt-In.

---

## Zu erstellende Dateien
- `src/features/landing/pages/LandingPage.jsx` (Platzhalter ersetzen)
- `src/features/landing/components/HeroSection.jsx`
- `src/features/landing/components/AboutSection.jsx`
- `src/features/landing/components/FeaturedProducts.jsx`
- `src/features/landing/components/FeaturedArticles.jsx`
- `src/features/landing/components/Footer.jsx`
- `src/features/newsletter/components/SubscribeForm.jsx`
- `src/features/newsletter/hooks/useSubscribe.js`
- `src/features/newsletter/pages/SubscriptionConfirmedPage.jsx` (Platzhalter ersetzen)

---

## Details zur Implementierung

### LandingPage — Abschnitte von oben nach unten

#### 1. Hero-Abschnitt
- Ruft `/settings/landing.hero` über den Hook `useLandingSettings()` ab (liest das Dokument einmal über `getDoc` und gibt `{ hero, about, loading }` zurück).
- Felder: `title` (Titel), `subtitle` (Untertitel), `ctaText` (CTA-Button-Text), `imageUrl` (Bild-URL).
- Hintergrundbild über die volle Breite, Text und CTA-Button davor zentriert/ausgerichtet.
- Der Button führt zu `/shop`.
- Wenn `loading: true` — ein Skeleton-Platzhalter mit einer Höhe von 80vh anzeigen.

#### 2. Über uns (About Section)
- Verwendet denselben Hook, Feld `about: { text, imageUrl }`.
- Zweispaltiges Layout: Text links, Foto rechts (auf Mobilgeräten untereinander).

#### 3. Unsere Produkte (Featured Products)
- Hook `useFeaturedProducts(limit = 4)` → Abfrage an `/products` mit `where('featured', '==', true)` und `limit(4)`.
- Raster aus 4 Produktkarten (auf Mobilgeräten 2 Spalten).
- Button "Alle Produkte" → `/shop`.
- Wenn `loading: true` — Skeletons für 4 Produktkarten anzeigen.
- Karte hier in vereinfachter Form (Foto, Name, Preis, Link zur Produktdetailseite). Die vollwertige `ProductCard` mit Warenkorb-Funktionalität folgt in Modul 03.

#### 4. Rezepte (Featured Articles)
- Hook `useFeaturedArticles(limit = 3)` → Abfrage an `/articles` mit `where('featured', '==', true)`, `where('published', '==', true)` und `limit(3)`.
- Raster aus 3 Artikelkarten.
- Button "Alle Rezepte" → `/blog`.

#### 5. Newsletter
- Eigenständiger Block mit `SubscribeForm`. Aufrufttext links, Formular rechts.

#### 6. Fußzeile (Footer)
- Spalten: Navigation (Shop, Blog, Über uns), Kontakte (E-Mail, Telefonnummer), Soziale Netzwerke (Symbole aus lucide-react).
- Copyright-Zeile: "© 2026 Komora".

---

### Newsletter — Double-Opt-In-Ablauf

#### `useSubscribe.js`
```js
export function useSubscribe() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const subscribe = async (email) => {
    setLoading(true);
    try {
      // 1. Prüfen, ob der Abonnent bereits existiert
      const existing = await getDocs(query(
        collection(db, 'subscribers'),
        where('email', '==', email)
      ));
      if (!existing.empty) {
        const status = existing.docs[0].data().status;
        if (status === 'confirmed') {
          showToast({ message: 'Sie sind bereits angemeldet', type: 'info' });
        } else {
          showToast({ message: 'Eine Bestätigungs-E-Mail wurde bereits gesendet – bitte prüfen Sie Ihr Postfach', type: 'info' });
        }
        return;
      }

      // 2. Dokument mit Status "pending" erstellen
      await addDoc(collection(db, 'subscribers'), {
        email,
        status: 'pending',
        subscribedAt: serverTimestamp(),
      });

      // 3. Brevo-Bestätigungsvorlage auslösen
      await brevoSubscribe(email);

      showToast({
        message: 'Bitte prüfen Sie Ihr E-Mail-Postfach — wir haben Ihnen einen Bestätigungslink gesendet',
        type: 'success',
        duration: 5000,
      });
    } catch (err) {
      showToast({ message: 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es später noch einmal.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
}
```

#### Brevo-Bestätigungsvorlage
In der Brevo-Konsole enthält die Vorlage einen Link der Form:
```
https://[deine-domain]/subscription-confirmed?email={{contact.EMAIL}}
```
(Brevo fügt die E-Mail-Adresse in `{{contact.EMAIL}}` automatisch ein.)

#### `SubscriptionConfirmedPage`
- Liest `email` aus `useSearchParams` aus.
- Beim Mounten wird `confirmSubscription(email)` aufgerufen:
  1. Sucht nach dem Dokument in `/subscribers`, bei dem `email === email` ist.
  2. Aktualisiert den Status auf `status: 'confirmed'`.
  3. Ruft die Brevo-Willkommensvorlage auf (`sendTransactional`).
- Komponentenzustand: `loading | success | error`.
- Erflogsfall (Success): Große Überschrift "Abonnement bestätigt", Danksagung, Button "Zur Startseite" → `/`.
- Fehlerfall (Error) (E-Mail nicht gefunden oder bereits bestätigt): Entsprechende Fehlermeldung anzeigen.

#### `SubscribeForm`
- E-Mail-Feld + Button "Abonnieren".
- Überprüfung des E-Mail-Formats auf dem Client vor dem Absenden.
- Während `loading` ist der Button deaktiviert und zeigt einen Spinner an.
- Nach erfolgreicher Anmeldung wird das Formular geleert.

---

## Kriterien für die Fertigstellung
Siehe Block `Module 01 — Landing + Newsletter` in `progress.md`.
