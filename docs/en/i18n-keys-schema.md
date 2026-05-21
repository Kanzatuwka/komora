# Localization — Full Keys Schema

> Run **before** localizing individual components. This file = a complete reference of keys for all locale files. Once dictionaries are populated, components can simply use ready keys.

---

## Instructions for Gemini (Single Session)

> Populate all locale files in `src/i18n/locales/uk/`, `src/i18n/locales/en/`, and `src/i18n/locales/de/` according to the schema below.
>
> Rules:
> 1. **Do not delete** existing keys — only add new ones and expand existing nested objects.
> 2. UA — original from this file. EN/DE — high-quality translations, use `Sie` (formal you) in German, not `Du`.
> 3. If a key already exists in the target files — skip it (do not overwrite).
> 4. Keep the structure of nested objects exactly as shown.

---

## common.json (Shared UI Strings)

```json
{
  "nav": {
    "shop": "Shop",
    "blog": "Blog",
    "about": "About Us",
    "cart": "Cart",
    "account": "Profile",
    "admin": "Admin",
    "login": "Login",
    "logout": "Logout",
    "register": "Register"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "back": "Back",
    "continue": "Continue",
    "confirm": "Confirm",
    "close": "Close",
    "submit": "Submit",
    "search": "Search",
    "loading": "Loading...",
    "saving": "Saving...",
    "tryAgain": "Try Again"
  },
  "toasts": {
    "saved": "Saved",
    "deleted": "Deleted",
    "updated": "Updated",
    "error": "An error occurred",
    "tryAgain": "Try Again"
  },
  "validation": {
    "required": "Required field",
    "emailInvalid": "Invalid email format",
    "passwordMin": "Password must be at least {{count}} characters",
    "passwordsNoMatch": "Passwords do not match",
    "phoneInvalid": "Invalid phone format"
  },
  "languages": {
    "uk": "Українська",
    "en": "English",
    "de": "Deutsch"
  },
  "currencies": {
    "UAH": "Hryvnia",
    "EUR": "Euro",
    "USD": "Dollar"
  },
  "footer": {
    "navigation": "Navigation",
    "contacts": "Contacts",
    "social": "Socials",
    "language": "Language",
    "currency": "Currency",
    "copyright": "© 2026 Komora · family farm"
  },
  "notFound": {
    "title": "Not Found",
    "back": "To Home"
  }
}
```

---

## shop.json (Shop, Cart, Checkout)

```json
{
  "title": "Shop",
  "categories": {
    "jam": "Jam",
    "sauce": "Sauces",
    "preserve": "Preserves"
  },
  "sort": {
    "label": "Sort By",
    "newest": "Newest First",
    "priceAsc": "Price ↑",
    "priceDesc": "Price ↓"
  },
  "filter": {
    "category": "Category",
    "tag": "Tag",
    "all": "All"
  },
  "product": {
    "addToCart": "To Cart",
    "added": "Added to cart",
    "outOfStock": "Temporarily out of stock",
    "featured": "Featured",
    "linkedRecipes": "Recipes with this product",
    "notFound": "Product not found"
  },
  "cart": {
    "title": "Cart",
    "empty": "Your cart is empty",
    "emptyDescription": "Looks like you haven't added anything yet. Visit our shop to find something delicious.",
    "toShop": "To Shop",
    "continueShopping": "Continue Shopping",
    "itemsCount": "{{count}} items in your list",
    "summary": "Summary",
    "items": "Items",
    "delivery": "Delivery",
    "deliveryCalculated": "Calculated next",
    "total": "Total to pay",
    "checkout": "Checkout"
  },
  "checkout": {
    "title": "Checkout",
    "deliveryMethod": "Delivery Method",
    "delivery": "Courier Delivery",
    "pickup": "Pickup",
    "contactInfo": "Contact Info",
    "name": "Your name",
    "phone": "Phone",
    "email": "Email",
    "deliveryAddress": "Delivery Address",
    "selectSavedAddress": "Select saved:",
    "street": "Street and building number",
    "city": "City",
    "postalCode": "Postal code",
    "pickupPoint": "Pickup Point",
    "pickupSchedule": "Working Hours:",
    "noPickupPoints": "No pickup points added yet.",
    "comment": "Comment on order",
    "yourOrder": "Your Order",
    "placeOrder": "Order Now",
    "terms": "By clicking on the button, you agree to the Komora terms of service.",
    "newOrderToast": "New order!",
    "successToast": "Order successfully placed!",
    "errorToast": "An error occurred during checkout. Please try again."
  },
  "orderConfirmation": {
    "thanks": "Thank you for your order!",
    "received": "successfully received",
    "info": "Order Info",
    "deliveryAndPayment": "Delivery and Payment",
    "courierDelivery": "Courier Delivery",
    "pickup": "Pickup",
    "pickupPoint": "Pickup Point",
    "total": "Total",
    "emailNote": "We have sent an email with the order details to your address. You can track the status in your personal account.",
    "notFound": "Order not found",
    "toShop": "To Shop",
    "toAccount": "To Account"
  }
}
```

---

## blog.json

```json
{
  "title": "Blog",
  "subtitle": "Interesting stories, recipes and news from our farm",
  "filter": {
    "all": "All"
  },
  "card": {
    "readMore": "Read more"
  },
  "article": {
    "notFound": "Article not found",
    "backToList": "To all articles",
    "tryIngredients": "Try ingredients from our pantry",
    "share": "Share:",
    "allArticles": "All articles"
  }
}
```

---

## auth.json

```json
{
  "login": {
    "title": "Login",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "submit": "Login",
    "or": "or",
    "google": "Login via Google",
    "noAccount": "No account?",
    "registerLink": "Register",
    "errorInvalid": "Invalid email or password",
    "errorGeneric": "Log in error. Please try again."
  },
  "register": {
    "title": "Register",
    "nameLabel": "Name",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "confirmPasswordLabel": "Confirm password",
    "submit": "Register",
    "hasAccount": "Already have an account?",
    "loginLink": "Login",
    "passwordMin": "Password must be at least 8 characters",
    "passwordsNoMatch": "Passwords do not match",
    "welcomeToast": "Welcome to Komora!"
  }
}
```

---

## account.json

```json
{
  "title": "Personal Account",
  "tabs": {
    "orders": "My Orders",
    "addresses": "My Addresses",
    "profile": "Profile"
  },
  "user": "User",
  "logout": "Logout",
  "delivery": "Delivery",
  "pickup": "Pickup",
  "orders": {
    "title": "Order History",
    "empty": "You do not have any orders yet",
    "toShop": "To Shop"
  },
  "orderDetails": {
    "notFound": "Order not found",
    "backToAccount": "Back to Account",
    "orderNumber": "Order",
    "inTransitNote": "Your order is already on its way!",
    "recipientInfo": "Recipient Information",
    "deliveryInfo": "Delivery",
    "courierDelivery": "Courier Delivery",
    "pickup": "Pickup",
    "items": "Order Composition",
    "totalToPay": "Total to pay:"
  },
  "orderStatus": {
    "new": "New",
    "confirmed": "Confirmed",
    "in_transit": "In Transit",
    "delivered": "Delivered",
    "cancelled": "Cancelled"
  },
  "profile": {
    "title": "Your Profile",
    "edit": "Edit",
    "fullName": "Full Name",
    "phone": "Phone",
    "notSpecified": "Not specified",
    "saving": "Saving...",
    "save": "Save",
    "security": "Security",
    "googleAuthNote": "You logged in via Google. Password is managed in Google Account settings.",
    "changePassword": "Change Password"
  },
  "passwordChange": {
    "title": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmPassword": "Confirm Password",
    "update": "Update",
    "cancel": "Cancel",
    "passwordsNoMatch": "Passwords do not match",
    "passwordMin": "Password must be at least 6 characters",
    "successToast": "Password successfully updated",
    "currentInvalid": "Current password is wrong",
    "updateError": "Password update error"
  },
  "addresses": {
    "title": "My Addresses",
    "addNew": "Add New",
    "empty": "No saved addresses",
    "delete": "Delete",
    "newAddressTitle": "New Address",
    "labelPlaceholder": "Label (e.g. Home, Work)",
    "streetPlaceholder": "Street, building",
    "cityPlaceholder": "City",
    "postalCodePlaceholder": "Postal code",
    "deleteConfirmTitle": "Delete address?",
    "deleteConfirmDescription": "This action cannot be undone."
  }
}
```

---

## landing.json

```json
{
  "about": {
    "title": "About Our Farm"
  }
}
```

---

## newsletter.json

```json
{
  "subscribe": {
    "title": "Join Our Pantry",
    "description": "Subscribe to our newsletter to be the first to receive new recipes and news from the farm.",
    "emailPlaceholder": "Your email",
    "submit": "Subscribe",
    "checkEmailToast": "Check your inbox — we have sent a confirmation email",
    "alreadySubscribedToast": "You are already subscribed",
    "pendingToast": "A confirmation email has already been sent — check your inbox",
    "errorToast": "Failed to subscribe. Please try later."
  },
  "confirmed": {
    "title": "Subscription Confirmed",
    "description": "Thank you, now you will be the first to know about new recipes and products.",
    "toHome": "To Home"
  }
}
```

---

## admin.json

```json
{
  "orderStatus": {
    "newMessage": "A new order is awaiting confirmation.",
    "confirmedMessage": "We confirmed your order and started preparing it.",
    "in_transitMessage": "Your order has been handed over to delivery.",
    "deliveredMessage": "Order delivered. Thank you for choosing Komora!"
  },
  "newsletter": {
    "subject": "New Recipe: {{title}}"
  }
}
```
