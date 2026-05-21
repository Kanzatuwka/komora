# Module 08 — Admin Panel: Newsletter, Settings, Production

> To be loaded alongside `main.md`. Depends on Modules 00, 01, 06, 07.

---

## What We Build
1. Newsletter campaign page `/admin/newsletter` (Write preview, select recipe, dispatch, history catalog).
2. Site settings customizer page `/admin/settings` featuring three distinct blocks:
   - **Pickup Points Manager** — CRUD list of physical pick points (labels, schedules).
   - **Hero Visual Customizer** — updates landing cover media, headlines, CTAs.
   - **About text Customizer** — inline modifications panel for About section texts & imagery.
3. Production deployment preparations (Firebase rules, configurations audit, project README file).

---

## Files Created
- `src/features/admin/pages/NewsletterPage.jsx` (replace placeholder)
- `src/features/admin/components/NewsletterForm.jsx`
- `src/features/admin/components/CampaignHistory.jsx`
- `src/features/admin/pages/SettingsPage.jsx` (replace placeholder)
- `src/features/admin/components/PickupAddressManager.jsx`
- `src/features/admin/components/HeroEditor.jsx`
- `src/features/admin/components/AboutEditor.jsx`
- `firestore.rules` (updated rules configuration)
- `README.md` (root directory configuration document)

---

## Implementation Details

### NewsletterCampaignForm (`/admin/newsletter`)

**1. Create & Send Panel:**
- Input textarea: **Intro Text** (short customized message preceding the recipe).
- Picker dropdown: **Recipe Selector** (list containing all published articles).
- Button **"Send Newsletter Campaign"** (large green style).

**2. Send Operation Workflow (`useSendCampaign`):**
1. Fetches selected article document via `getDoc`.
2. Queries `/subscribers` where `status == 'confirmed'` getting mailing list.
3. Computes the HTML body text for the email (see below).
4. Calls Brevo `sendCampaign` REST API.
5. Saves details under `/newsletterHistory` (intro text, recipe reference, recipient counts, timestamps, and compiled HTML snippet).
6. Displays success count toast and refreshes the campaign history table.

```js
// Compiled Email Wrapper inside useSendCampaign:
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
          Read full recipe
        </a>
      </div>
      
      <p style="font-size:11px;color:#999;text-align:center;margin-top:40px;">
        This email was sent to subscribers of Komora.
        <br><a href="{{ unsubscribe }}" style="color:#999;">Unsubscribe</a>
      </p>
    </div>
  </body>
  </html>
`;
```

**3. Campaign History Table:**
Lists earlier sent campaigns showing: Transaction Date, Article Name, Recipient Subscriber counts, and a "Preview" eye-icon button opening a Modal containing the rendered email preview markup in a safe sandbox iframe.

---

### Customizers and Pickup Points CRUD (`/admin/settings`)

#### 1. Pickup Points Address Manager
- List of custom addresses registered under the Firestore collection `/pickupAddresses`.
- Interactive editor cards containing labels, addresses, working hours, and "Delete" actions.
- "Add Pickup point" opens modal input fields, submitting adds document to collection.

#### 2. Hero Visual Customizer
- Reads and updates `/settings/landing` property fields (`hero`).
- Inputs: Hero Title, Hero Subtitle, CTA Button text, Custom cover photo uploader.
- On updates, updates Firestore directly and alerts "Landing modified successfully".

#### 3. About Us Block Editor
- Updates `/settings/landing` property fields (`about`).
- Input textarea for About text (up to 1500 chars), image drag and dropper, submits directly updates documents.

---

## Firestore Rules Configuration (`firestore.rules`)
A comprehensive, production-ready Security Ruleset must be deployed. Place at project root.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Check helper functions
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
      allow delete: if false; // orders cannot be deleted
    }

    match /subscribers/{id} {
      allow create: if true; // anyone can submit subscribe form
      allow read, update: if isAdmin() || (request.query.limit == 1); // allow search checking signup status
      allow delete: if isAdmin();
    }

    match /newsletterHistory/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Ready Criteria
See the `Module 08 — Admin Panel Newsletter & Settings & Deploy` section in `progress.md`.
```
- [ ] Email campaigns compile visual responsive templates and execute dispatches using subscribers lists.
- [ ] Settings Page successfully overrides Hero titles and About sections.
- [ ] Pickup points are easily created, saved, retrieved, and deleted.
- [ ] Firestore Security Rules are fully verified and deployed using deploy rules scripts.
- [ ] Complete project README is generated at root detailing environment setups.
```
