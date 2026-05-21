# Komora — Farm Products Crafted with Soul 🍓

> 🚀 **Project is live!** The application is currently running within the Google AI Studio environment and is accessible via this link: [**Komora Demo App**](https://ais-pre-u4vjlboq3xz7oo6kyduc5h-13883820133.europe-west2.run.app/)

This is a fully-featured e-commerce platform for the "Komora" family farm, built on a modern **React + Firebase** stack. The project provides a complete cycle of customer interaction: from introducing the brand through the blog to placing orders and managing a personal customer account.

## 🌟 Key Features

### 🌍 Globalization & UX
- **Multilingual Support (i18n):** Full support for three languages (**Ukrainian, English, German**). Automatic browser language detection and preservation of user selection.
- **Multi-currency:** Ability to view prices in **UAH, USD, EUR** with automatic conversion.
- **Adaptive Design:** Optimized for all devices. Navbar with a dynamic height and carefully curated "Modern Farm" style typography.

### 🛒 Shop & Orders
- **Product Catalog:** Category filtering, search, sorting, and rich product detail pages.
- **Cart & Checkout:** Flexible cart item management and a structured multi-step checkout process.
- **Personal Account:** Order history, delivery status, profile management, and preference customizer (language, currency).

### 📝 Content & Blog
- **Rich-Text Blog:** Articles and recipes featuring multimedia support and embedded product showcase cards.
- **Interconnected Content:** Products automatically appear in recipes/articles where they are mentioned or linked.

### 🔐 Security & Authentication
- **Global AuthContext:** Reliable authentication via Firebase Auth (Google Login).
- **Auto-Profiling:** Automated creation of a user document in Firestore on their first login with default preferences.
- **Firestore Security Rules:** Strict access rules protecting user data and ensuring custom content integrity.

### 🛡 Admin Panel (The Hub)
- **Dashboard:** Order analytics, revenue visualizers, and popular items monitoring.
- **CMS:** Complete CRUD management for products, categories, and blog articles powered by the **TipTap** editor.
- **Marketing:** Integration with **Brevo (Sendinblue)** to manage subscribers and orchestrate transactional or automated newsletter dispatch campaigns.
- **System Tools:** Backup manager, database migration utilities, and homepage hero/about layout customizers.

## 🛠 Tech Stack

- **Core:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS 4.0
- **State/Auth:** Firebase (Firestore, Auth, Storage)
- **Animations:** Framer Motion (via `motion/react`)
- **UI Components:** Lucide Icons, Headless UI/Radix-like patterns
- **Editors:** TipTap (Rich Text)
- **Data Viz:** Recharts (Admin Panel Charts)
- **Internationalization:** i18next + react-i18next

## ⚙️ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:** Copy `.env.example` to `.env.local` and populate the Firebase and Brevo API credentials.

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `/src/features` — Modular architecture (shop, blog, admin, account, auth).
- `/src/shared` — Contexts, shared UI components, localized translations (i18n), libraries.
- `/src/db` — Data schema blueprint descriptions and security rule files.

## 📝 Development Status

The project is under active development. The current progress and module-by-module documentation can be found in the `/docs` folder.

---
© 2024-2026 Komora. Crafted for people who value authenticity. 🌿
