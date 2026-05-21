# Modul 08 — Admin-Bereich: Newsletter, Einstellungen, Produktion

> Zusammen mit `main.md` laden. Hängt von Modul 00, 01, 06, 07 ab.

---

## Was wir bauen
1. Newsletter-Kampagnenseite `/admin/newsletter` (Kampagne verfassen, Rezept auswählen, senden, Historie).
2. Einstellungsseite `/admin/settings` mit drei eigenständigen Abschnitten:
   - **Abholstellen-Manager** — CRUD-Liste der physischen Abholorte (Namen, Öffnungszeiten, Adressen).
   - **Hero-Bereich-Editor** — Direktes Bearbeiten von Titeln, Untertiteln, Button-Texten und Teaserbild auf der Landingpage.
   - **Über uns-Bereich-Editor** — Inline-Editor für den Beschreibungstext und das Foto im Über-uns-Abschnitt.
3. Vorbereitung für den Produktionsbetrieb (Sicherheitsregeln für Firestore, Systemaudit, README-Benutzerhandbuch).

---

## Zu erstellende Dateien
- `src/features/admin/pages/NewsletterPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/NewsletterForm.jsx`
- `src/features/admin/components/CampaignHistory.jsx`
- `src/features/admin/pages/SettingsPage.jsx` (Platzhalter ersetzen)
- `src/features/admin/components/PickupAddressManager.jsx`
- `src/features/admin/components/HeroEditor.jsx`
- `src/features/admin/components/AboutEditor.jsx`
- `firestore.rules` (Definition der Zugriffsregeln für die Produktionsdatenbank)
- `README.md` (Systemdokumentation im Stammverzeichnis)

---

## Details zur Implementierung

### NewsletterCampaignForm (`/admin/newsletter`)

**1. Senden-Bedienfeld:**
- Textbereich: **Einleitungstext** (persönliche Begrüßung vor dem Rezeptinhalt).
- Dropdown-Liste: **Rezept-Auswahl** (Liste aller veröffentlichten Artikel/Rezepte).
- Button **"Newsletter-Kampagne senden"** (großer grüner Button).

**2. Kampagnen-Ablauf (`useSendCampaign`):**
1. Lädt den ausgewählten Artikel aus Firestore (`getDoc`).
2. Ruft alle bestätigten Abonnenten ab (`status == 'confirmed'`).
3. Setzt das adaptive HTML-E-Mail-Layout zusammen (siehe unten).
4. Ruft die Brevo `sendCampaign` REST-API auf, um die Kampagne zu versenden.
5. Speichert die Kampagne in `/newsletterHistory` (Einleitungstext, Artikel-Referenz, Anzahl der Empfänger, Sendezeitpunkt und das generierte HTML).
6. Zeigt eine Erfolgsmeldung mit der Anzahl gesendeter E-Mails an und aktualisiert die Historien-Tabelle.

```js
// HTML-Zusammensetzung in useSendCampaign:
const buildEmailHtml = (article, intro) => `
  <!DOCTYPE html>
  <html>
  <body style="font-family:Georgia,serif;background-color:#f7f1e3;color:#3a3a3a;padding:20px;">
    <div style="background:#fff;max-width:560px;margin:10px auto;padding:32px;border-radius:8px;">
      <h1 style="color:#5a6f3f;text-align:center;">Komora</h1>
      <p style="font-size:16px;line-height:1.6;margin-bottom:24px;">${intro}</p>
      
      <div style="border-top:1px solid #e5e0d0;padding-top:24px;margin-top:24px;">
        <img src="${article.imageUrl}" style="width:100%;border-radius:4px;" />
        <h2 style="color:#3a3a3a;font-weight:normal;margin:16px 0 8px;">${article.title}</h2>
        <p style="font-size:14px;color:#888;margin-bottom:12px;">${article.excerpt}</p>
        <a href="https://komora.ua/blog/${article.id}" style="display:inline-block;background:#5a6f3f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">
          Rezept vollständig lesen
        </a>
      </div>
      
      <p style="font-size:11px;color:#999;text-align:center;margin-top:40px;">
        Diese E-Mail wurde an Abonnenten von Komora gesendet.
        <br><a href="{{ unsubscribe }}" style="color:#999;">Abmelden</a>
      </p>
    </div>
  </body>
  </html>
`;
```

**3. Kampagnenhistorie-Tabelle (Campaign History):**
Tabelle mit früher gesendeten Newslettern. Spalten: Datum, Rezeptname, Anzahl Empfänger, Vorschau-Auge-Symbol. Ein Klick auf das Auge öffnet ein Vorschau-Modal mit der vollständigen gerenderten E-Mail in einem gesicherten iFrame.

---

### Inhalts-Editoren und Abholstellen-CRUD (`/admin/settings`)

#### 1. Abholstellen-Manager (Pickup Addresses)
- Liste der Abholstellen aus `/pickupAddresses` als Karten-Raster.
- Bearbeitungskarten mit Eingabefeldern für Name/Bezeichnung, genaue Adresse, Öffnungszeiten und "Löschen"-Funktion.
- Button "Abholstelle hinzufügen" öffnet Eingabe-Modal, Speichern fügt das Dokument zur Firestore-Datenbank hinzu.

#### 2. Hero-Bereich-Editor
- Liest und schreibt in die Kollektion `/settings/landing` (Dokument `landing`, Feld `hero`).
- Felder: Titel, Untertitel, CTA-Button-Text, Drag & Drop-Bild-Upload.
- Nach dem Speichern wird die Landingpage sofort dynamisch aktualisiert und die Benachrichtigung "Hero erfolgreich bearbeitet" ausgegeben.

#### 3. Über uns-Bereich-Editor
- Liest und schreibt in das Dokument `landing` (Feld `about`).
- Editierbereich für den Beschreibungstext (bis 1500 Zeichen), Bild-Uploader für das Familienfoto, speichert Änderungen direkt in Firestore.

---

## Firestore-Sicherheitsregeln (`firestore.rules`)
Verpflichtende Zugriffsdefinitionen für die Firebase-Produktionsumgebung. İm Root-Verzeichnis platzieren.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helfer-Abfragen
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read, write: if isOwner(uid) || isAdmin();
    }
    
    match /users/{uid}/addresses/{addressId} {
      allow read, write: if isOwner(uid) || isAdmin();
    }

    match /products/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /articles/{id} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }

    match /pickupAddresses/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /settings/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /orders/{id} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || isAdmin());
      allow update: if isAdmin();
      allow delete: if false; // Bestellungen können nicht gelöscht werden
    }

    match /subscribers/{id} {
      allow create: if true; // jeder darf das Aboformular ausfüllen
      allow read, update: if isAdmin() || (request.query.limit == 1); // Statusbestätigung erlauben
      allow delete: if isAdmin();
    }

    match /newsletterHistory/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Kriterien für die Fertigstellung
Siehe Block `Module 08 — Admin Panel Newsletter & Settings & Deploy` in `progress.md`.
