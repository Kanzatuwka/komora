# Module 01 — Landing Page + Newsletter

> To be loaded alongside `main.md`. Depends on Module 00.

---

## What We Build
1. Landing page (`/`) with 6 sections from top to bottom.
2. Newsletter form with double opt-in flow via Brevo.
3. Subscription confirmed page `/subscription-confirmed` to complete the opt-in.

---

## Files Created
- `src/features/landing/pages/LandingPage.jsx` (replace placeholder)
- `src/features/landing/components/HeroSection.jsx`
- `src/features/landing/components/AboutSection.jsx`
- `src/features/landing/components/FeaturedProducts.jsx`
- `src/features/landing/components/FeaturedArticles.jsx`
- `src/features/landing/components/Footer.jsx`
- `src/features/newsletter/components/SubscribeForm.jsx`
- `src/features/newsletter/hooks/useSubscribe.js`
- `src/features/newsletter/pages/SubscriptionConfirmedPage.jsx` (replace placeholder)

---

## Implementation Details

### LandingPage — Sections from Top to Bottom

#### 1. Hero
- Fetches `/settings/landing.hero` via the hook `useLandingSettings()` (reads the document once via `getDoc`, returning `{ hero, about, loading }`).
- Fields: `title`, `subtitle`, `ctaText`, `imageUrl`.
- Full-width background image, text and CTA button aligned on top.
- The button directs users to `/shop`.
- When `loading: true` — show a skeleton placeholder of 80vh height.

#### 2. About Us
- Uses the same hook, field `about: { text, imageUrl }`.
- Two-column layout: text on the left, photo on the right (stacked on mobile).

#### 3. Featured Products
- Hook `useFeaturedProducts(limit = 4)` → queries `/products` with `where('featured', '==', true)` and `limit(4)`.
- Grid consisting of 4 cards (2 columns on mobile).
- "All Products" button → `/shop`.
- While `loading: true` — 4 product card skeletons.
- Simpler card representation here (photo, name, price, link to details). The fuller `ProductCard` with cart capability is introduced in Module 03.

#### 4. Recipes
- Hook `useFeaturedArticles(limit = 3)` → queries `/articles` with `where('featured', '==', true)`, `where('published', '==', true)`, and `limit(3)`.
- Grid consisting of 3 cards.
- "All Recipes" button → `/blog`.

#### 5. Newsletter
- Dedicated block containing `SubscribeForm`. Call-to-action text on the left, input form on the right.

#### 6. Footer
- Columns: Navigation (Shop, Blog, About Us), Contact details (email, phone number), Social links (lucide-react icons).
- Copyright line: "© 2026 Komora".

---

### Newsletter — Double Opt-In Flow

#### `useSubscribe.js`
```js
export function useSubscribe() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const subscribe = async (email) => {
    setLoading(true);
    try {
      // 1. Verify if subscriber already exists
      const existing = await getDocs(query(
        collection(db, 'subscribers'),
        where('email', '==', email)
      ));
      if (!existing.empty) {
        const status = existing.docs[0].data().status;
        if (status === 'confirmed') {
          showToast({ message: 'You are already subscribed', type: 'info' });
        } else {
          showToast({ message: 'A confirmation letter has already been sent — please check your inbox', type: 'info' });
        }
        return;
      }

      // 2. Create document with pending status
      await addDoc(collection(db, 'subscribers'), {
        email,
        status: 'pending',
        subscribedAt: serverTimestamp(),
      });

      // 3. Trigger Brevo confirmation template
      await brevoSubscribe(email);

      showToast({
        message: 'Please check your mailbox — we have sent a message for confirmation',
        type: 'success',
        duration: 5000,
      });
    } catch (err) {
      showToast({ message: 'Could not subscribe. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
}
```

#### Brevo Confirmation Template
In Brevo console, the template contains a link such as:
```
https://[your-domain]/subscription-confirmed?email={{contact.EMAIL}}
```
(Brevo replaces `{{contact.EMAIL}}` automatically with recipient email.)

#### `SubscriptionConfirmedPage`
- Reads `email` from `useSearchParams`.
- On mount, calls `confirmSubscription(email)`:
  1. Locates document in `/subscribers` where `email === email`.
  2. Updates `status: 'confirmed'`.
  3. Triggers Brevo welcome template (`sendTransactional`).
- Component state: `loading | success | error`.
- Success: big heading "Subscription confirmed", thank you message, button "To Homepage" → `/`.
- Error (email not found or already confirmed): displays corresponding error message.

#### `SubscribeForm`
- Email input + "Subscribe" button.
- Validates email format client-side before sending.
- Buttons are disabled and display a spinner during `loading` states.
- Clears the form input on success.

---

## Ready Criteria
See the `Module 01 — Landing + Newsletter` section in `progress.md`.
