# Komora — Hofprodukte mit Seele hergestellt 🍓

Dies ist eine voll funktionsfähige E-Commerce-Plattform für den Familien-Bauernhof "Komora", basierend auf einem modernen **React + Firebase** Stack. Das Projekt bietet einen vollständigen Zyklus der Kundeninteraktion: vom Kennenlernen der Marke über den Blog bis hin zur Bestellung und der Verwaltung des persönlichen Kundenkontos.

## 🌟 Hauptmerkmale

### 🌍 Globalisierung & UX
- **Mehrsprachigkeit (i18n):** Volle Unterstützung für drei Sprachen (**Ukrainisch, Englisch, Deutsch**). Automatische Erkennung der Browsersprache und Speicherung der Benutzerauswahl.
- **Mehrere Währungen:** Anzeige von Preisen in **UAH, USD, EUR** mit automatischer Umrechnung.
- **Responsive Design:** Optimiert für alle Endgeräte. Navbar mit dynamischer Höhe und durchdachter Typografie im "Modern Farm"-Stil.

### 🛒 Shop & Bestellungen
- **Produktkatalog:** Filterung nach Kategorien, Suche, Sortierung und detaillierte Produktseiten.
- **Warenkorb & Checkout:** Flexibles Warenkorb-Management und ein strukturierter, mehrstufiger Bestellprozess.
- **Persönliches Konto:** Bestellhistorie, Lieferstatus, Profilverwaltung und Einstellungen für Sprache und Währung.

### 📝 Inhalte & Blog
- **Rich-Text-Blog:** Artikel und Rezepte mit Multimedia-Unterstützung und eingebetteten Produkt-Highlight-Karten.
- **Verknüpfte Inhalte:** Produkte werden automatisch in Rezepten/Artikeln angezeigt, in denen sie erwähnt oder verlinkt sind.

### 🔐 Sicherheit & Authentifizierung
- **Global AuthContext:** Sichere Authentifizierung über Firebase Auth (Google Login).
- **Automatisches Profiling:** Automatische Erstellung eines Benutzerdokuments in Firestore bei Erstanmeldung mit Standardpräferenzen.
- **Firestore-Sicherheitsregeln:** Strikte Zugriffsregeln zum Schutz von Benutzerdaten und zur Gewährleistung der Inhaltsintegrität.

### 🛡 Admin-Bereich (The Hub)
- **Dashboard:** Bestellanalysen, Umsatzdiagramme und Überwachung beliebter Produkte.
- **CMS:** Vollständiges CRUD-Management für Produkte, Kategorien und Blog-Artikel über den **TipTap**-Editor.
- **Marketing:** Integration mit **Brevo (Sendinblue)** zur Verwaltung von Abonnenten und zur Orchestrierung von Transaktions- oder automatisierten Newsletter-Kampagnen.
- **Systemwerkzeuge:** Datensicherungs-Manager, Datenbankmigrations-Utilities und Layout-Editoren für die Startseite (Hero & Über uns).

## 🛠 Technologie-Stack

- **Core:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS 4.0
- **State/Auth:** Firebase (Firestore, Auth, Storage)
- **Animationen:** Framer Motion (über `motion/react`)
- **UI-Komponenten:** Lucide-Icons, Headless UI/Radix-ähnliche Muster
- **Editoren:** TipTap (Rich Text)
- **Datenvisualisierung:** Recharts (Umsatzdiagramme im Admin-Bereich)
- **Internationalisierung:** i18next + react-i18next

## ⚙️ Erste Schritte

1. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

2. **Umgebung konfigurieren:** Kopieren Sie `.env.example` nach `.env.local` und tragen Sie Ihre Firebase- und Brevo-Zugangsdaten ein.

3. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

## 📂 Projektstruktur

- `/src/features` — Modulare Architektur (Shop, Blog, Admin, Konto, Authentifizierung).
- `/src/shared` — Kontexte, gemeinsame UI-Komponenten, Lokalisierungen (i18n), Bibliotheken.
- `/src/db` — Datenschemadokumentation (Blueprint) und Sicherheitsregel-Definitionen.

## 📝 Entwicklungsstand

Das Projekt befindet sich in aktiver Entwicklung. Der aktuelle Fortschritt und die modulbezogene Dokumentation sind im Ordner `/docs` zu finden.

---
© 2024-2026 Komora. Entwickelt für Menschen, die das Echte schätzen. 🌿
