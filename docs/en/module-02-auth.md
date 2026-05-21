# Module 02 — Auth (Login + Register)

> To be loaded alongside `main.md`. Depends on Module 00.

---

## What We Build
1. `/login` — Login with email/password + Google OAuth.
2. `/register` — Registration with automatic creation of `/users/{uid}`.

---

## Files Created
- `src/features/auth/pages/LoginPage.jsx` (replace placeholder)
- `src/features/auth/pages/RegisterPage.jsx` (replace placeholder)
- `src/features/auth/components/LoginForm.jsx`
- `src/features/auth/components/RegisterForm.jsx`
- `src/features/auth/hooks/useAuthActions.js`

---

## Implementation Details

### `useAuthActions.js`
Encapsulates all auth operations. Pages only invoke these methods.

```js
export function useAuthActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const redirectAfterLogin = () => {
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  };

  const loginWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      redirectAfterLogin();
    } catch (err) {
      throw new Error('Invalid email or password');
    }
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // If it is a new user, create a document in /users
    const userRef = doc(db, 'users', result.user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: result.user.email,
        name: result.user.displayName || '',
        phone: '',
        role: 'user',
        createdAt: serverTimestamp(),
      });
    }
    redirectAfterLogin();
  };

  const register = async ({ name, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      name,
      phone: '',
      role: 'user',
      createdAt: serverTimestamp(),
    });
    navigate('/', { replace: true });
    showToast({ message: 'Welcome to Komora!', type: 'success' });
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return { loginWithEmail, loginWithGoogle, register, logout };
}
```

---

### LoginPage
Layout: Centered login card, background photo or gradient in `farm-cream`.

**LoginForm:**
- Fields: Email, Password.
- "Sign In" button (primary).
- Separator `or`.
- "Sign in with Google" button (with Google icon).
- Link "Don't have an account? Sign Up" → `/register`.

**Errors:**
- Do not use `alert()`. Display errors **underneath the form** in red text.
- On invalid credentials: "Invalid email or password".
- Other errors: "Login failed. Please try again."

**Button State:**
- During `loading` — buttons are disabled, with a spinner on the primary button.

---

### RegisterPage
Uses the same layout as LoginPage.

**RegisterForm:**
- Fields: Name, Email, Password, Confirm Password.
- "Sign Up" button.
- Link "Already have an account? Sign In" → `/login`.

**Client-Side Validation:**
- Name — min 2 characters.
- Email — matches pattern `/.+@.+\..+/`.
- Password — min 8 characters.
- Confirm Password — must match Password.

Display errors under the respective input in red. Submit button is disabled until the form is valid.

**After Registration:**
- Document `/users/{uid}` is created with `role: 'user'`.
- User is logged in automatically (handled by Firebase).
- Redirects to `/`.
- Triggers welcome toast "Welcome to Komora!".

---

## Integration with Rest of Interface
- In `Navbar` (fully implemented in Module 03, but write placeholders here):
  - If `!user` → show "Login" leading to `/login`.
  - If `user && role === 'user'` → show username + dropdown with "My Account" and "Logout".
  - If `role === 'admin'` → additional link to "Admin Panel" leading to `/admin`.

---

## Ready Criteria
See the `Module 02 — Auth` section in `progress.md`.

**Manual Validation Checklist:**
1. Register a new email → check that `/users/{uid}` is populated with `role: 'user'`.
2. Logout and login again → verify success.
3. Login via Google → check user doc creation.
4. Try typing `/account` in the browser unauthenticated → redirects to `/login`.
5. After login, redirects back to the protected page saved in `state.from` (e.g. `/account`).
