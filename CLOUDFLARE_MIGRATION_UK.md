# Cloudflare Pages Hosting Migration Guide 🚀

This guide provides a comprehensive step-by-step plan for migrating the **Komora** platform to custom hosting via **Cloudflare Pages**, along with a detailed list of all required configurations and **Environment Variables**.

---

## 📋 1. General Cloudflare Hosting Requirements

Since the application is designed as a **Single Page Application (SPA)** using **Vite + React + TypeScript + Firebase**, Cloudflare Pages is the ideal hosting solution (fast, scalable, and free).

### Project Configuration in Cloudflare Dashboard:
1. Navigate to **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository.
3. In the **Build settings** section, configure the following:
   - **Framework preset:** `Vite` (or `None`)
   - **Build command:** `npm run build` (or with config injection: `echo $FIREBASE_JSON_CONFIG > firebase-applet-config.json && npm run build`)
   - **Build output directory:** `dist`
   - **Node.js Version:** **Node.js 22 or higher is strictly required** for modern Wrangler deployments (can be specified using the environment variable `NODE_VERSION: 22` in your Cloudflare settings).

---

## 🔀 2. Routing Configuration for SPA (Single-Page Application)

In modern deployments utilizing **Cloudflare Workers & Assets** (via Wrangler), routing to nested paths (such as `/admin`, `blog/:id`, etc.) is handled seamlessly. 

The build automatically generates or relies on a `wrangler.json` / `wrangler.jsonc` file with the following configuration:
```json
"assets": {
  "not_found_handling": "single-page-application"
}
```

* **Note on Redirects:** You **must not** manually create or commit a custom `_redirects` file with rules like `/* /index.html 200`. Under modern Wrangler asset deployments, adding files with such rules triggers conflicts and blocks deployment with the error `Invalid _redirects configuration: Infinite loop detected in this rule`. The `not_found_handling` asset configuration built into Wrangler takes care of this automatically.

---

## 🔑 3. Firebase Configuration

The application reads its Firebase configuration at runtime from an auto-generated file named `firebase-applet-config.json` (imported inside `/src/shared/lib/firebase.ts`).

To make the system flexible and safe when deploying to production without committing configuration secrets, you can choose one of the following setups:

### Setup A: Dynamic Configuration File Generation (Recommended)
You can automatically construct this file during the build process on Cloudflare. 
Add an environment variable `FIREBASE_JSON_CONFIG` in Cloudflare containing your raw Firebase config JSON string (values should match your Firebase project):
```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "firestoreDatabaseId": "YOUR_DATABASE_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID"
}
```
Then, update your **Build command** in Cloudflare Pages to generate this file automatically prior to invoking Vite:
```bash
echo $FIREBASE_JSON_CONFIG > firebase-applet-config.json && npm run build
```

### Setup B: Environment Variables Configuration (`VITE_`)
Alternatively, you can modify `/src/shared/lib/firebase.ts` to fetch configurations directly from Vite environment variables.
Rewrite the initialization as follows:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
};
```
Then configure the individual `VITE_FIREBASE_*` keys inside your Cloudflare environment settings dashboard.

---

## 📁 4. Comprehensive Environment Variables Reference

All client-facing environment variables in a Vite project **must** be prefixed with `VITE_` so that they are exposed to the browser build.

Add the following environment variables in the **Settings** -> **Environment variables** section of your Cloudflare Dashboard (both **Production** and **Preview** environments):

### 📬 Brevo (Sendinblue) Mailing Configuration

| Variable Name | Type | Description | Placeholder Value |
| :--- | :--- | :--- | :--- |
| `VITE_BREVO_API_KEY` | `string` | API Access Key (v3) from your Brevo Dashboard | `your_brevo_api_key_here` |
| `VITE_BREVO_LIST_ID` | `number` | ID of the target contact list in Brevo | `your_brevo_list_id` |
| `VITE_BREVO_SENDER_NAME` | `string` | Sender name shown for transactional/marketing emails | `your_sender_name_here` |
| `VITE_BREVO_SENDER_EMAIL` | `string` | Verified sender email address | `your_verified_sender_email@domain.com` |

---

### 📧 Brevo Email Templates by Language (Double Opt-In & Order Statuses)

Each email template has 3 language versions (Ukrainian, English, German) for full localization support.

#### 🇺🇦 Ukrainian Templates (UK)
| Variable Name | Description | Placeholder Value / Template ID |
| :--- | :--- | :--- |
| `VITE_BREVO_DOI_CONFIRM_UK` | Subscription Confirmation (Double Opt-In) | `your_uk_doi_confirm_template_id` |
| `VITE_BREVO_DOI_WELCOME_UK` | Welcome email after subscription confirmation | `your_uk_doi_welcome_template_id` |
| `VITE_BREVO_ORDER_PLACED_UK` | Order placed notification | `your_uk_order_placed_template_id` |
| `VITE_BREVO_ORDER_CONFIRMED_UK` | Order confirmed by admin | `your_uk_order_confirmed_template_id` |
| `VITE_BREVO_ORDER_IN_TRANSIT_UK` | Order dispatched / in transit | `your_uk_order_transit_template_id` |
| `VITE_BREVO_ORDER_DELIVERED_UK` | Order successfully delivered | `your_uk_order_delivered_template_id` |
| `VITE_BREVO_ORDER_CANCELLED_UK` | Order cancelled with reasoning | `your_uk_order_cancelled_template_id` |

#### 🇬🇧 English Templates (EN)
| Variable Name | Description | Placeholder Value / Template ID |
| :--- | :--- | :--- |
| `VITE_BREVO_DOI_CONFIRM_EN` | Subscription Confirmation (Double Opt-In) | `your_en_doi_confirm_template_id` |
| `VITE_BREVO_DOI_WELCOME_EN` | Welcome email after subscription confirmation | `your_en_doi_welcome_template_id` |
| `VITE_BREVO_ORDER_PLACED_EN` | Order placed notification | `your_en_order_placed_template_id` |
| `VITE_BREVO_ORDER_CONFIRMED_EN` | Order confirmed by admin | `your_en_order_confirmed_template_id` |
| `VITE_BREVO_ORDER_IN_TRANSIT_EN` | Order dispatched / in transit | `your_en_order_transit_template_id` |
| `VITE_BREVO_ORDER_DELIVERED_EN` | Order successfully delivered | `your_en_order_delivered_template_id` |
| `VITE_BREVO_ORDER_CANCELLED_EN` | Order cancelled with reasoning | `your_en_order_cancelled_template_id` |

#### 🇩🇪 German Templates (DE)
| Variable Name | Description | Placeholder Value / Template ID |
| :--- | :--- | :--- |
| `VITE_BREVO_DOI_CONFIRM_DE` | Subscription Confirmation (Double Opt-In) | `your_de_doi_confirm_template_id` |
| `VITE_BREVO_DOI_WELCOME_DE` | Welcome email after subscription confirmation | `your_de_doi_welcome_template_id` |
| `VITE_BREVO_ORDER_PLACED_DE` | Order placed notification | `your_de_order_placed_template_id` |
| `VITE_BREVO_ORDER_CONFIRMED_DE` | Order confirmed by admin | `your_de_order_confirmed_template_id` |
| `VITE_BREVO_ORDER_IN_TRANSIT_DE` | Order dispatched / in transit | `your_de_order_transit_template_id` |
| `VITE_BREVO_ORDER_DELIVERED_DE` | Order successfully delivered | `your_de_order_delivered_template_id` |
| `VITE_BREVO_ORDER_CANCELLED_DE` | Order cancelled with reasoning | `your_de_order_cancelled_template_id` |

---

### 🔥 Firebase Service Settings (If utilizing Setup B)

If you modify `/src/shared/lib/firebase.ts` to utilize separate `VITE_` environment variables, configure the following keys in your Cloudflare dashboard:

| Variable Name | Type | Description | Placeholder Value |
| :--- | :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `string` | Firebase Web API Key for your project | `your_firebase_api_key_here` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `string` | Authentication domain designated for OAuth | `your_project_id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `string` | Unique identifier for your Google Cloud project | `your_project_id_here` |
| `VITE_FIREBASE_STORAGE_BUCKET`| `string` | Google Cloud Storage upload bucket reference | `your_project_id.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `string` | Cloud messaging sender identifier | `your_messaging_sender_id_here` |
| `VITE_FIREBASE_APP_ID` | `string` | Identifier unique to your registered Web App | `your_firebase_app_id_here` |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | `string` | Firestore instance database identifier | `your_database_id_here` |

---

## 🔒 5. Post-Migration Security Steps
1. **Authorized Domains in Firebase Console:**
   Go to your Firebase Console -> **Authentication** -> **Settings** -> **Authorized Domains** and add your custom Cloudflare Pages domains (such as `your-app.pages.dev` and any custom domains like `komora.ua`). Without adding these, Google Authentication will fail.
2. **CORS Configuration for Firebase Storage:**
   If you plan to upload images directly from your backoffice utilizing Drag-and-Drop, declare appropriate CORS rules on your Google Cloud Storage bucket to explicitly allow methods like `POST` and headers like `Content-Type` from your Cloudflare domains.

---
Deploying to Cloudflare Pages yields superior loading speeds globally and lifts unnecessary load off development containers! 🌾✨
