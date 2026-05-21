# Modul 02 — Authentifizierung (Anmelden + Registrieren)

> Zusammen mit `main.md` laden. Hängt von Modul 00 ab.

---

## Was wir bauen
1. `/login` — Anmeldung mit E-Mail/Passwort + Google OAuth.
2. `/register` — Registrierung mit automatischer Erstellung von `/users/{uid}`.

---

## Zu erstellende Dateien
- `src/features/auth/pages/LoginPage.jsx` (Platzhalter ersetzen)
- `src/features/auth/pages/RegisterPage.jsx` (Platzhalter ersetzen)
- `src/features/auth/components/LoginForm.jsx`
- `src/features/auth/components/RegisterForm.jsx`
- `src/features/auth/hooks/useAuthActions.js`

---

## Details zur Implementierung

### `useAuthActions.js`
Kapselt alle Authentifizierungsoperationen. Die Seiten rufen nur diese Methoden auf.

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
      throw new Error('E-Mail-Adresse oder Passwort ungültig');
    }
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Wenn neuer Benutzer — Dokument in /users erstellen
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
    showToast({ message: 'Willkommen bei Komora!', type: 'success' });
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return { loginWithEmail, loginWithGoogle, register, logout };
}
```

---

### LoginPage (Anmeldeseite)
Layout: Zentrierte Karte, Hintergrundbild oder sanfter Verlauf in `farm-cream`.

**LoginForm:**
- Felder: E-Mail, Passwort.
- Button "Anmelden" (primary).
- Trenner `oder`.
- Button "Mit Google anmelden" (mit Google-Symbol).
- Link "Noch kein Konto? Registrieren" → `/register`.

**Fehlermeldungen:**
- Keine Verwendung von `alert()`. Fehler werden **unter dem Formular** in rotem Text angezeigt.
- Bei falschen Anmeldedaten: "E-Mail-Adresse oder Passwort ungültig".
- Sonstige Fehler: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut."

**Button-Zustand:**
- Während `loading` — Buttons deaktiviert, auf dem Hauptbutton läuft ein Spinner.

---

### RegisterPage (Registrierungsseite)
Gleiches Layout wie LoginPage.

**RegisterForm:**
- Felder: Name, E-Mail, Passwort, Passwort bestätigen.
- Button "Registrieren".
- Link "Bereits ein Konto? Anmelden" → `/login`.

**Clientseitige Validierung:**
- Name — mindestens 2 Zeichen.
- E-Mail — Format `/.+@.+\..+/`.
- Passwort — mindestens 8 Zeichen.
- Passwort bestätigen — muss exakt mit Passwort übereinstimmen.

Fehlermeldungen werden unter dem entsprechenden Feld in Rot angezeigt. Der Registrierungsbutton ist deaktiviert, solange das Formular ungültig ist.

**Nach erfolgreicher Registrierung:**
- Dokument `/users/{uid}` wird mit `role: 'user'` erstellt.
- Benutzer wird automatisch angemeldet (wird von Firebase erledigt).
- Weiterleitung zu `/`.
- Toast-Benachrichtigung "Willkommen bei Komora!".

---

## Integration in den Rest der Benutzeroberfläche
- Im `Navbar` (vollständig in Modul 03 gebaut, aber hier vorzubereiten):
  - Wenn `!user` → "Anmelden" anzeigen → führt zu `/login`.
  - Wenn `user && role === 'user'` → Name des Benutzers + Dropdown mit "Mein Konto" und "Abmelden" anzeigen.
  - Wenn `role === 'admin'` → zusätzlich Link "Admin-Bereich" anzeigen → führt zu `/admin`.

---

## Kriterien für die Fertigstellung
Siehe Block `Module 02 — Auth` in `progress.md`.

**Manuelle Überprüfung:**
1. Mit neuer E-Mail-Adresse registrieren → Prüfen, ob `/users/{uid}` mit `role: 'user'` erstellt wurde.
2. Abmelden → Erneut anmelden → funktioniert.
3. Über Google anmelden → Prüfen, ob das Benutzerdokument erstellt wurde.
4. Versuchen, auf `/account` ohne Anmeldung zuzugreifen → Weiterleitung zu `/login`.
5. Nach der Anmeldung über `/login` (mit `/account` als Ursprung in `state.from`) → Weiterleitung zurück zu `/account`.
