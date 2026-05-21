# Lokalisierung — vollständiges Schlüssel-Schema

> Starten Sie dies **vor** der Lokalisierung einzelner Komponenten. Diese Datei = vollständiges Referenz-Schema der Schlüssel für alle Locale-Dateien. Sobald die Wörterbücher gefüllt sind, verwenden die Komponenten einfach die fertigen Schlüssel.

---

## Anweisungen für Gemini (Einzelne Session)

> Füllen Sie alle Locale-Dateien in `src/i18n/locales/uk/`, `src/i18n/locales/en/` und `src/i18n/locales/de/` gemäß dem folgenden Schema aus.
>
> Regeln:
> 1. **Löschen Sie keine** bestehenden Schlüssel — fügen Sie nur neue hinzu und ergänzen Sie bestehende verschachtelte Objekte.
> 2. UA — Original aus dieser Datei. EN/DE — hochwertige Übersetzungen, verwenden Sie im Deutschen das höfliche `Sie`, nicht `Du`.
> 3. Wenn ein Schlüssel in den Zieldateien bereits existiert — überspringen Sie ihn (nicht überschreiben).
> 4. Behalten Sie die Struktur verschachtelter Objekte genau wie gezeigt bei.

---

## common.json (Gemeinsame UI-Strings)

```json
{
  "nav": {
    "shop": "Shop",
    "blog": "Blog",
    "about": "Über uns",
    "cart": "Warenkorb",
    "account": "Konto",
    "admin": "Admin",
    "login": "Anmelden",
    "logout": "Abmelden",
    "register": "Registrieren"
  },
  "actions": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "add": "Hinzufügen",
    "back": "Zurück",
    "continue": "Weiter",
    "confirm": "Bestätigen",
    "close": "Schließen",
    "submit": "Absenden",
    "search": "Suchen",
    "loading": "Laden...",
    "saving": "Speichern...",
    "tryAgain": "Erneut versuchen"
  },
  "toasts": {
    "saved": "Gespeichert",
    "deleted": "Gelöscht",
    "updated": "Aktualisiert",
    "error": "Ein Fehler ist aufgetreten",
    "tryAgain": "Erneut versuchen"
  },
  "validation": {
    "required": "Pflichtfeld",
    "emailInvalid": "Ungültiges E-Mail-Format",
    "passwordMin": "Das Passwort muss mindestens {{count}} Zeichen lang sein",
    "passwordsNoMatch": "Passwörter stimmen nicht überein",
    "phoneInvalid": "Ungültiges Telefonnummernformat"
  },
  "languages": {
    "uk": "Українська",
    "en": "English",
    "de": "Deutsch"
  },
  "currencies": {
    "UAH": "Hrywnja",
    "EUR": "Euro",
    "USD": "Dollar"
  },
  "footer": {
    "navigation": "Navigation",
    "contacts": "Kontakte",
    "social": "Soziale Netzwerke",
    "language": "Sprache",
    "currency": "Währung",
    "copyright": "© 2026 Komora · Familienbetrieb"
  },
  "notFound": {
    "title": "Nicht gefunden",
    "back": "Zur Startseite"
  }
}
```

---

## shop.json (Shop, Warenkorb, Kasse)

```json
{
  "title": "Shop",
  "categories": {
    "jam": "Marmelade",
    "sauce": "Saucen",
    "preserve": "Konserven"
  },
  "sort": {
    "label": "Sortierung",
    "newest": "Neueste",
    "priceAsc": "Preis ↑",
    "priceDesc": "Preis ↓"
  },
  "filter": {
    "category": "Kategorie",
    "tag": "Tag",
    "all": "Alle"
  },
  "product": {
    "addToCart": "In den Warenkorb",
    "added": "In den Warenkorb gelegt",
    "outOfStock": "Vorübergehend nicht auf Lager",
    "featured": "Beliebt",
    "linkedRecipes": "Rezepte mit diesem Produkt",
    "notFound": "Produkt nicht gefunden"
  },
  "cart": {
    "title": "Warenkorb",
    "empty": "Ihr Warenkorb ist leer",
    "emptyDescription": "Es sieht so aus, als hätten Sie noch nichts hinzugefügt. Besuchen Sie unseren Shop, um etwas Leckeres zu finden.",
    "toShop": "Zum Shop",
    "continueShopping": "Weiter einkaufen",
    "itemsCount": "{{count}} Artikel in Ihrer Liste",
    "summary": "Zusammenfassung",
    "items": "Artikel",
    "delivery": "Lieferung",
    "deliveryCalculated": "Wird als nächstes berechnet",
    "total": "Gesamtbetrag",
    "checkout": "Zur Kasse"
  },
  "checkout": {
    "title": "Bestellung aufgeben",
    "deliveryMethod": "Versandart",
    "delivery": "Lieferung per Kurier",
    "pickup": "Selbstabholung",
    "contactInfo": "Kontaktinformationen",
    "name": "Ihr Name",
    "phone": "Telefonnummer",
    "email": "E-Mail-Adresse",
    "deliveryAddress": "Lieferadresse",
    "selectSavedAddress": "Gespeicherte Adresse auswählen:",
    "street": "Straße und Hausnummer",
    "city": "Stadt",
    "postalCode": "Postleitzahl",
    "pickupPoint": "Abholstelle",
    "pickupSchedule": "Öffnungszeiten:",
    "noPickupPoints": "Es wurden noch keine Abholstellen hinzugefügt.",
    "comment": "Bestellkommentar",
    "yourOrder": "Ihre Bestellung",
    "placeOrder": "Jetzt kostenpflichtig bestellen",
    "terms": "Mit dem Klicken auf den Button stimmen Sie den Nutzungsbedingungen von Komora zu.",
    "newOrderToast": "Neue Bestellung!",
    "successToast": "Bestellung erfolgreich aufgegeben!",
    "errorToast": "Bei der Bestellung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
  },
  "orderConfirmation": {
    "thanks": "Vielen Dank für Ihre Bestellung!",
    "received": "erfolgreich empfangen",
    "info": "Bestellinformationen",
    "deliveryAndPayment": "Lieferung und Zahlung",
    "courierDelivery": "Lieferung per Kurier",
    "pickup": "Selbstabholung",
    "pickupPoint": "Abholstelle",
    "total": "Gesamtsumme",
    "emailNote": "Wir haben eine E-Mail mit den Bestelldetails an Ihre Adresse gesendet. Sie können den Status in Ihrem persönlichen Bereich verfolgen.",
    "notFound": "Bestellung nicht gefunden",
    "toShop": "Zum Shop",
    "toAccount": "Zum Konto"
  }
}
```

---

## blog.json

```json
{
  "title": "Blog",
  "subtitle": "Interessante Geschichten, Rezepte und Neuigkeiten von unserem Bauernhof",
  "filter": {
    "all": "Alle"
  },
  "card": {
    "readMore": "Weiterlesen"
  },
  "article": {
    "notFound": "Artikel nicht gefunden",
    "backToList": "Zur Übersicht",
    "tryIngredients": "Probieren Sie Zutaten aus unserer Speisekammer",
    "share": "Teilen:",
    "allArticles": "Alle Artikel"
  }
}
```

---

## auth.json

```json
{
  "login": {
    "title": "Anmelden",
    "emailLabel": "E-Mail-Adresse",
    "passwordLabel": "Passwort",
    "submit": "Anmelden",
    "or": "oder",
    "google": "Über Google anmelden",
    "noAccount": "Kein Konto vorhanden?",
    "registerLink": "Registrieren",
    "errorInvalid": "Ungültige E-Mail-Adresse oder Passwort",
    "errorGeneric": "Fehler beim Anmelden. Bitte versuchen Sie es erneut."
  },
  "register": {
    "title": "Registrieren",
    "nameLabel": "Name",
    "emailLabel": "E-Mail-Adresse",
    "passwordLabel": "Passwort",
    "confirmPasswordLabel": "Passwort bestätigen",
    "submit": "Registrieren",
    "hasAccount": "Haben Sie bereits ein Konto?",
    "loginLink": "Anmelden",
    "passwordMin": "Das Passwort muss mindestens 8 Zeichen lang sein",
    "passwordsNoMatch": "Passwörter stimmen nicht überein",
    "welcomeToast": "Willkommen bei Komora!"
  }
}
```

---

## account.json

```json
{
  "title": "Persönlicher Bereich",
  "tabs": {
    "orders": "Meine Bestellungen",
    "addresses": "Meine Adressen",
    "profile": "Profil"
  },
  "user": "Benutzer",
  "logout": "Abmelden",
  "delivery": "Lieferung",
  "pickup": "Selbstabholung",
  "orders": {
    "title": "Bestellverlauf",
    "empty": "Sie haben noch keine Bestellungen aufgegeben",
    "toShop": "Zum Shop"
  },
  "orderDetails": {
    "notFound": "Bestellung nicht gefunden",
    "backToAccount": "Zurück zum Konto",
    "orderNumber": "Bestellung",
    "inTransitNote": "Ihre Bestellung befindet sich bereits auf dem Weg!",
    "recipientInfo": "Empfängerdaten",
    "deliveryInfo": "Lieferung",
    "courierDelivery": "Lieferung per Kurier",
    "pickup": "Selbstabholung",
    "items": "Bestellinhalt",
    "totalToPay": "Gesamtbetrag:"
  },
  "orderStatus": {
    "new": "Neu",
    "confirmed": "Bestätigt",
    "in_transit": "Unterwegs",
    "delivered": "Zugestellt",
    "cancelled": "Storniert"
  },
  "profile": {
    "title": "Ihr Profil",
    "edit": "Bearbeiten",
    "fullName": "Vollständiger Name",
    "phone": "Telefonnummer",
    "notSpecified": "Nicht angegeben",
    "saving": "Wird gespeichert...",
    "save": "Speichern",
    "security": "Sicherheit",
    "googleAuthNote": "Sie sind über Google angemeldet. Ihr Passwort wird in den Einstellungen Ihres Google-Kontos verwaltet.",
    "changePassword": "Passwort ändern"
  },
  "passwordChange": {
    "title": "Passwort ändern",
    "currentPassword": "Aktuelles Passwort",
    "newPassword": "Neues Passwort",
    "confirmPassword": "Passwort bestätigen",
    "update": "Aktualisieren",
    "cancel": "Abbrechen",
    "passwordsNoMatch": "Passwörter stimmen nicht überein",
    "passwordMin": "Das Passwort muss mindestens 6 Zeichen lang sein",
    "successToast": "Passwort erfolgreich aktualisiert",
    "currentInvalid": "Das aktuelle Passwort ist falsch",
    "updateError": "Fehler beim Aktualisieren des Passworts"
  },
  "addresses": {
    "title": "Meine Adressen",
    "addNew": "Neue hinzufügen",
    "empty": "Keine gespeicherten Adressen",
    "delete": "Löschen",
    "newAddressTitle": "Neue Adresse",
    "labelPlaceholder": "Bezeichnung (z. B. Zuhause, Arbeit)",
    "streetPlaceholder": "Straße, Hausnummer",
    "cityPlaceholder": "Stadt",
    "postalCodePlaceholder": "Postleitzahl",
    "deleteConfirmTitle": "Adresse löschen?",
    "deleteConfirmDescription": "Diese Aktion kann nicht rückgängig gemacht werden."
  }
}
```

---

## landing.json

```json
{
  "about": {
    "title": "Über unseren Bauernhof"
  }
}
```

---

## newsletter.json

```json
{
  "subscribe": {
    "title": "Treten Sie unserer Speisekammer bei",
    "description": "Abonnieren Sie unseren Newsletter, um als Erster neue Rezepte und Neuigkeiten vom Bauernhof zu erhalten.",
    "emailPlaceholder": "Ihre E-Mail-Adresse",
    "submit": "Abonnieren",
    "checkEmailToast": "Überprüfen Sie Ihren Posteingang — wir haben eine Bestätigungs-E-Mail gesendet",
    "alreadySubscribedToast": "Sie haben sich bereits angemeldet",
    "pendingToast": "Eine Bestätigungs-E-Mail wurde bereits gesendet — überprüfen Sie Ihren Posteingang",
    "errorToast": "Abonnement fehlgeschlagen. Bitte versuchen Sie es später noch einmal."
  },
  "confirmed": {
    "title": "Abonnement bestätigt",
    "description": "Vielen Dank! Ab jetzt erfahren Sie als Erster von neuen Rezepten und Produkten.",
    "toHome": "Zur Startseite"
  }
}
```

---

## admin.json

```json
{
  "orderStatus": {
    "newMessage": "Eine neue Bestellung wartet auf Bestätigung.",
    "confirmedMessage": "Wir haben Ihre Bestellung bestätigt und bereiten sie vor.",
    "in_transitMessage": "Ihre Bestellung wurde dem Versand übergeben.",
    "deliveredMessage": "Bestellung zugestellt. Vielen Dank, dass Sie sich für Komora entschieden haben!"
  },
  "newsletter": {
    "subject": "Neues Rezept: {{title}}"
  }
}
```
