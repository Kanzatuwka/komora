# Komora — Entwicklungsfortschritt

> Nach jeder Session aktualisieren. Markieren Sie `[x]` erst, nachdem Sie die Funktion im AI Studio Preview manuell getestet haben.
> Jedes Modul besteht aus zwei Bereichen: **Implementierung** (zu entwickeln) und **Überprüfung** (manuelle Testschritte).

---

## Vorbereitung (vom Benutzer durchgeführt)
- [ ] Firebase-Projekt in der Firebase Console erstellt
- [ ] Authentifizierung aktiviert (E-Mail/Passwort + Google)
- [ ] Firestore-Datenbank aktiviert
- [ ] Cloud Storage aktiviert
- [ ] `firebaseConfig` kopiert
- [ ] Brevo-Konto erstellt, API-Schlüssel kopiert
- [ ] Brevo-Bestätigungs- und Willkommens-E-Mail-Vorlagen erstellt (Double-Opt-in)
- [ ] 5 Transaktions-E-Mail-Vorlagen für Bestellstatus erstellt (new → confirmed → in_transit → delivered, cancelled)
- [ ] Brevo-Abonnentenliste erstellt
- [ ] `.env.local` mit allen Schlüsseln ausgefüllt

---

## Module 00 — Initialisierung

### Implementierung
- [x] React + Vite initialisiert, Tailwind integriert
- [x] Ordnerstruktur `features/` + `shared/` angelegt
- [x] `shared/lib/firebase.js` funktioniert (Auth, DB, Storage werden exportiert)
- [x] `shared/lib/brevo.js` enthält die Funktionen `subscribe`, `confirmSubscription`, `sendTransactional`, `sendCampaign`
- [x] `AuthContext` überwacht `onAuthStateChanged` und lädt die Rollen
- [x] `CartContext` speichert Daten im `localStorage`
- [x] `ToastContext` + `useToast` einsatzbereit
- [x] `ProtectedRoute` leitet Benutzer basierend auf ihrer Rolle weiter
- [x] `AppRouter` enthält alle Routen aus `main.md` als Platzhalterseiten
- [x] Sicherheitsregeln (Security Rules) aus `main.md` auf Firestore und Storage angewendet
- [x] Erster Administrator manuell in Firestore erstellt (users/{uid}.role = 'admin')

### Überprüfung
- [x] Navigation zu Standard-Routen aus `main.md` rendert Platzhalterseiten
- [x] Ohne Login leitet `/account` direkt zu `/login` weiter
- [x] Ohne Admin-Rechte (`role: 'admin'`) leitet `/admin` zu `/` weiter
- [x] Administrator kann erfolgreich auf `/admin` zugreifen
- [x] Toast-Dienst funktioniert: Aufruf von `showToast` zeigt Benachrichtigung, die nach 3 Sekunden ausgeblendet wird
- [x] Der Einkaufswagen behält Testartikel im `localStorage` nach Seitenneuladung bei

---

## Module 01 — Landing + Newsletter

### Implementierung
- [x] Hero-Bereich lädt `/settings/landing.hero` aus Firestore
- [x] "Über uns" lädt `/settings/landing.about`
- [x] "Unsere Produkte" — 4 vorgestellte Artikel (`featured: true`) aus `/products`
- [x] "Rezepte" — 3 vorgestellte Artikel (`featured: true`) aus `/articles`
- [x] Newsletter-Formular speichert Abonnenten mit Status `pending`
- [x] Brevo versendet Bestätigungs-E-Mail
- [x] `/subscription-confirmed` aktualisiert den Status auf `confirmed`
- [x] Fußzeile (Footer) mit Navigation

### Überprüfung
- [x] Dokument `/settings/landing` mit Testdaten anlegen → Hero/"Über uns" korrekt dargestellt
- [x] Produkt als `featured: true` in Firestore markieren → erscheint auf der Startseite
- [x] Newsletter End-to-End-Test: E-Mail eingeben → Bestätigungs-E-Mail erhalten → Link anklicken → `/subscription-confirmed` zeigt Erfolg → Status in Firestore ändert sich zu `confirmed` → Willkommens-E-Mail empfangen
- [x] Erneuter Anmeldeversuch mit gleicher E-Mail → Toast "Sie sind bereits angemeldet"
- [x] Anmeldeversuch mit E-Mail im Status `pending` → Toast "Bestätigungslink wurde bereits versendet"

---

## Module 02 — Auth

### Implementierung
- [x] Anmeldung: E-Mail/Passwort + Google
- [x] Registrierung: Erstellt `/users/{uid}` mit der Rolle `role: 'user'`
- [x] Weiterleitung nach erfolgreicher Anmeldung zu `state.from` oder `/`
- [x] Fehlermeldungen formgerecht unter dem Formular anzeigen (keine globalen Alerts)

### Überprüfung
- [x] Registrierung mit neuer E-Mail-Adresse → `/users/{uid}` erfolgreich mit Rolle `role: 'user'` erstellt
- [x] Abmelden → Erneut Anmelden → funktioniert
- [x] Erste Google-Anmeldung → Benutzerdokument in `/users` wird angelegt
- [x] Falsches Passwort eingegeben → Fehlermeldung wird unter dem Eingabefeld eingeblendet
- [x] Falsche Angaben bei Registrierung → Submit-Button blockiert, Fehlermeldungen bei den Feldern
- [x] Zugriff auf `/account` ohne Anmeldung → Weiterleitung zu `/login` mit `state.from` = `/account`
- [x] Nach Anmeldung → automatische Rückleitung zu `/account`

---

## Module 03 — Shop

### Implementierung
- [x] `/shop` — Filterung nach Kategorie und Tags, Sortierung
- [x] Ladeplatzhalter (Skeleton-Loader), leere Zustände (Empty States)
- [x] Produktkarte mit Feedback-Mikrointeraktion beim Hinzufügen
- [x] `/shop/:id` — Bildergalerie, verlinkte Rezepte
- [x] `/cart` — Menge anpassen, löschen, persistente Speicherung
- [x] `/checkout` — Lieferung/Abholung, Formularvalidierung
- [x] Bestellung wird mit Status `new` in Firestore angelegt
- [x] Brevo versendet automatische Bestellbestätigung an Kunden
- [x] `/order/:id` — Bestätigungsseite
- [x] Einkaufswagen wird nach Bestellanforderung geleert

### Überprüfung
- [x] Artikel hinzufügen → Einkaufswagen-Zähler im Navigationsbereich steigt, Toast erscheint
- [x] Seite neu laden → Artikel bleiben im Einkaufswagen erhalten
- [x] Kategorie- und Tag-Filter — URL-Synchronisation, Zurück-Navigieren funktioniert
- [x] Inkompatible Filterkombination → Seite mit Hinweis auf leeren Zustand wird angezeigt
- [x] Artikel mit `inStock: false` → Button "Hinzufügen" ist deaktiviert
- [x] Produktseite — Bildergalerie reagiert auf Klicks auf Miniaturansichten
- [x] Kasse (Checkout) ohne Anmeldung → Weiterleitung zu `/login`
- [x] Checkout mit leerem Warenkorb → Weiterleitung zu `/shop`
- [x] Checkout mit fehlenden Pflichtfeldern abschicken → rote Rahmenzeiger und Meldungen
- [x] Bestellung abschließen → `/orders/{id}` mit Status `new` dokumentiert, E-Mail empfangen, Warenkorb geleert, Weiterleitung zu `/order/:id`
- [x] Fremde Bestätigungsseiten `/order/:id` aufrufen → Zugriff verweigert

---

## Module 04 — Blog

### Implementierung
- [x] `/blog` — Tag-Filter, Beitragsübersicht, Lade-Skeletons
- [x] `/blog/:id` — HTML Rich-Text Darstellung
- [x] Eingebundene Produktkarten in Beiträgen werden unterstützt
- [x] "Andere Rezepte" — 3 ähnliche Beiträge basierend auf gemeinsamen Tags

### Überprüfung
> Vollständiger Test nach Abschluss von Module 07. Momentan: Dokument im Firestore unter `/articles` manuell anlegen mit folgendem Inhalt (HTML-Format):
> ```html
> <h2>Test</h2><p>Rezept-Text.</p><product-mention data-product-id="EXISTIERENDE_PRODUKT_ID"></product-mention><p>Ende.</p>
> ```
> und überprüfen Sie die ersten drei Schritte. Den Rest nach Fertigstellung von Module 07 verifizieren.

- [x] `/blog` — Artikelliste lädt, Tag-Filter funktioniert
- [x] `/blog/:id` — Beitragsdarstellung lädt, Element `<product-mention>` wird durch die InlineProductCard ersetzt
- [x] Entwürfe (`published: false`) erscheinen nicht in der Liste und sind über direkte URLs unzugänglich
- [x] (nach Module 07) Artikel hinzufügen aus der InlineProductCard im Rezept funktioniert
- [x] (nach Module 07) Empfehlungen zeigen verwandte Beiträge basierend auf Tags

---

## Module 05 — Persönlicher Bereich

### Implementierung
- [x] `/account` — 3 Registerkarten im Dashboard
- [x] Bestellungen: Übersicht aller Aufträge, Details, Stornierungsgründe
- [x] Profil: Kontaktdaten anpassen, Passwort aktualisieren
- [x] Adressen: Adressverwaltung (CRUD) mit Sicherheitsabfrage vor Löschvorgängen

### Überprüfung
- [x] Einige Bestellungen abschicken → diese füllen das Register "Bestellungen"
- [x] Bestelldetails — alle erfassten Punkte werden exakt aufgeführt
- [x] Zugriff auf unberechtigte Bestelllinks `/account/orders/<fremde_id>` → leitet zu `/account` weiter
- [x] Namen und Telefonnummer bearbeiten → speichern → neu laden → Änderungen bleiben
- [x] Passwort eines E-Mail-Kontos ändern → funktioniert (Anmeldung nur noch mit neuem Passwort möglich)
- [x] Passwort eines Google-Kontos ändern → Erläuterung zum Google-Schnittstellen-Reset angezeigt
- [x] Neue Versandadresse anlegen → erscheint in der Liste und im Checkout-Menü
- [x] Adresse löschen → Dialog-Bestätigung erscheint und entfernt die Adresse
- [x] Vorhandene Lieferadresse an der Kasse anklicken → Adressdaten werden automatisch ausgefüllt

---

## Module 06 — Admin Core

### Implementierung
- [x] Admin-Bereich mit linkem Navigationspanel
- [x] Dashboard: Statistikdaten, administrative Schnellaktionen
- [x] `/admin/orders` — Liste der Bestellungen, Statusfilter
- [x] `/admin/orders/:id` — Bestellstatus anpassen, Stornogrund angeben
- [x] Status-Updates senden automatische E-Mail-Statusberichte über Brevo an Kunden

### Überprüfung
- [x] Zugriff auf `/admin` als normaler Nutzer → umleiten zu `/`
- [x] Administrator meldet sich an → Dashboard visualisiert reale Datenpunkte aus Firestore
- [x] Klick auf "Neue Bestellungen" → leitet weiter zu `/admin/orders?status=new`
- [x] Schnellzugriffe leiten zu den passenden Zielseiten weiter
- [x] Bestellung im Shop tätigen → wird unter `/admin/orders` im Filter "Neu" gelistet
- [x] Status auf `confirmed` ändern → Bestätigungs-E-Mail über Brevo-Vorlage kommt an
- [x] Status auf `cancelled` ändern ohne Angabe eines Stornogrunds → Absenden blockiert
- [x] Stornieren mit Begründung → Kunde liest Begründung unter `/account/orders/:id`
- [x] Status-Kreislauf durch lufen: new → confirmed → in_transit → delivered → 4 E-Mails empfangen

---

## Module 07 — Admin CMS

### Implementierung
- [x] `/admin/products` — CRUD, Dateiverwaltung über Storage, Positionierung per Drag-and-Drop
- [x] Artikel mit Produkten verknüpfen
- [x] `/admin/blog` — CRUD, TipTap-Editor, Einbuchen-Schnittstelle für Produktblöcke
- [x] Produkte mit Artikeln (Rezepten) verknüpfen

### Überprüfung

**Produkte:**
- [x] Produkt mit 3 Bildern anlegen → Reihenfolge per Drag-and-Drop ändern → speichern → Firestore `images` zeigt neue Reihenfolge
- [x] Status `featured: true` aktivieren → Produkt erscheint in "Unsere Produkte" auf der Startseite
- [x] Schalter `inStock` (Lagerbestand) in Tabelle schalten → ändert Bestand ohne Formularaufruf
- [x] Artikel mit Produkt verknüpfen → Artikel bearbeiten → Produkt wird im Feld `linkedProductIds` erfasst (bidirektionale Verknüpfung)
- [x] Produkt löschen → Datensatz und hochgeladene Storage-Bilder werden rückstandsfrei gelöscht

**Blog:**
- [x] Artikel verfassen, Titelbild hochladen, Content eintragen und veröffentlichen
- [x] Im Editor `<product-mention>` mittels Produktauswahl hinzufügen → Vorschau rendert die Produktkarte
- [x] Speichern und Rezept aufrufen `/blog/:id` → InlineProductCard wird fehlerfrei im Textkörper dargestellt
- [x] Auf "In den Warenkorb" im Artikel klicken → Produkt wird hinzugefügt, Toast erscheint
- [x] Verknüpftes Produkt löschen → Rezept aufrufen → Karte wird stillschweigend ausgeblendet (keine Fehlermeldungen)
- [x] Unveröffentlichte Entwürfe erscheinen nicht im Blog

---

## Module 08 — Newsletter, Abonnenten, Einstellungen, Deployment

### Implementierung
- [x] `/admin/newsletter` — Erstellung, Vorschau, Absenden
- [x] Protokollierte Erfassung versendeter Kampagnen unter `/newsletterHistory`
- [x] Verlauf gesendeter Newsletter mit HTML-Vorschau
- [x] `/admin/subscribers` — Übersichtstabelle, Abonnent löschen
- [x] `/admin/settings` — Layoutanpassung, Selbstabholer-Standorte
- [ ] **Hosting-Plattform ausgewählt und konfiguriert**
- [ ] **Produktions-Build veröffentlicht**
- [x] **README.md verfasst**

### Überprüfung

**Newsletter:**
- [x] Erstellung: Rezeptartikel wählen → Formular füllt sich automatisch aus (Titel, Vorschau, Cover, Produktreferenzen)
- [x] E-Mail-Anzeige im Iframe-Widget gleicht exact der Empfängeransicht
- [x] Klick auf "Senden" → Dialog zeigt die Anzahl der Empfänger mit bestätigtem Status (`confirmed`)
- [x] Bestätigen → Kampagne landet im Ziel-Postfach, Log wird unter `/newsletterHistory` vermerkt
- [x] Verlauf: Klick auf "Vorschau" → öffnet Iframe-Lightbox mit historischem Kampagnen-HTML

**Abonnenten:**
- [x] Abonnenten-Statistik = Anzahl der Datensätze mit dem Status `confirmed`
- [x] Abonnent löschen → Sicherheitsabfrage bestätigen → Datensatz aus Firestore und Brevo-Empfängerliste (falls verknüpft) entfernt

**Systemeinstellungen:**
- [x] Hero-Titel ändern → abspeichern → `/settings/landing.hero` wird automatisch aktualisiert → Startseite übernimmt neue Headline
- [x] Hero-Hintergrundbild ersetzen → altes Bild wird aus Cloud Storage gelöscht, neues geladen
- [x] Abholstelle hinzufügen → steht an der Kasse zur Abholung bereit (Module 03)
- [x] Abholstelle entfernen → verschwindet aus Checkout-Optionen

**Produktions-Veröffentlichung (Abschluss):**
- [x] Build-Skript (`npm run build`) läuft fehlerfrei durch
- [ ] GitHub-Actions-Pipeline veröffentlicht bei jedem Commit auf `main`
- [ ] Alle zentralen Abläufe laufen auf Live-URL: Kunden-Logins, Einkäufe, Abonnements
- [ ] Benachrichtigungen und Transaktions-E-Mails laufen im Echtbetrieb
- [ ] Bilder und Mediendownloads werden über CDN bereitgestellt, Schreibrechte geschützt
- [x] README is auf aktuellem Stand (Schnittstellen, Systemvariablen, Zugangs-Bereitstellung)
- [ ] Administrativer Erstzugang eingerichtet und für den Kunden freigegeben
