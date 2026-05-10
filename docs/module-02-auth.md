# Module 02 — Auth (Login + Register)

> Завантажити разом з `main.md`. Залежить від Module 00.

---

## Що будуємо
1. `/login` — вхід email/password + Google OAuth.
2. `/register` — реєстрація з автоматичним створенням `/users/{uid}`.

---

## Файли що створюються
- `src/features/auth/pages/LoginPage.jsx` (замінити placeholder)
- `src/features/auth/pages/RegisterPage.jsx` (замінити placeholder)
- `src/features/auth/components/LoginForm.jsx`
- `src/features/auth/components/RegisterForm.jsx`
- `src/features/auth/hooks/useAuthActions.js`

---

## Деталі реалізації

### `useAuthActions.js`
Інкапсулює всі auth-операції. Сторінки лише викликають ці методи.

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
      throw new Error('Невірний email або пароль');
    }
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Якщо це новий користувач — створити документ у /users
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
    showToast({ message: 'Вітаємо в Коморі!', type: 'success' });
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
Layout: центрована картка на повну висоту, фонове фото або градієнт `farm-cream`.

**LoginForm:**
- Поля: Email, Password.
- Кнопка "Увійти" (primary).
- Розділювач `або`.
- Кнопка "Увійти через Google" (з іконкою Google).
- Лінк "Немає акаунту? Зареєструватися" → `/register`.

**Помилки:**
- Не `alert()`. Помилка показується **під формою** червоним текстом.
- При невірних креденшалах: "Невірний email або пароль".
- Інші помилки: "Помилка входу. Спробуйте ще раз."

**Стан кнопок:**
- Поки `loading` — кнопки disabled, на основній — спінер.

---

### RegisterPage
Той самий layout що LoginPage.

**RegisterForm:**
- Поля: Ім'я, Email, Password, Підтвердження пароля.
- Кнопка "Зареєструватися".
- Лінк "Вже є акаунт? Увійти" → `/login`.

**Валідація (на клієнті):**
- Ім'я — мін. 2 символи.
- Email — формат `/.+@.+\..+/`.
- Password — мін. 8 символів.
- Підтвердження пароля — має співпадати з Password.

Помилки — під відповідним полем, червоним. Submit-кнопка disabled поки форма не валідна.

**Після реєстрації:**
- Створено `/users/{uid}` з `role: 'user'`.
- Користувач залогінений автоматично (Firebase це робить).
- Редірект на `/`.
- Toast "Вітаємо в Коморі!".

---

### Інтеграція з рештою інтерфейсу
- У `Navbar` (створюється в наступних модулях, але можна підготувати тут):
  - Якщо `!user` → показати "Увійти" → `/login`.
  - Якщо `user && role === 'user'` → показати ім'я + dropdown з "Мій кабінет" і "Вийти".
  - Якщо `role === 'admin'` → додатково лінк "Адмін-панель" → `/admin`.

Сам `Navbar` повноцінно будується у Module 03 (бо тоді з'являється `cartCount`).

---

## Критерії готовності
Див. блок `Module 02 — Auth` у `progress.md`.

**Перевірка вручну:**
1. Зареєструватися новим email → перевірити `/users/{uid}` створений з `role: 'user'`.
2. Вийти → увійти знову → працює.
3. Увійти через Google → перевірити документ створено.
4. Спробувати зайти на `/account` без логіну → редірект на `/login`.
5. Після логіну з `/account` як `state.from` → редірект назад на `/account`.
