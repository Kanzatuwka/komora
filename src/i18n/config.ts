import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ukCommon from './locales/uk/common.json';
import ukShop from './locales/uk/shop.json';
import ukBlog from './locales/uk/blog.json';
import ukAuth from './locales/uk/auth.json';
import ukAccount from './locales/uk/account.json';
import ukAdmin from './locales/uk/admin.json';
import ukLanding from './locales/uk/landing.json';
import ukNewsletter from './locales/uk/newsletter.json';

import enCommon from './locales/en/common.json';
import enShop from './locales/en/shop.json';
import enBlog from './locales/en/blog.json';
import enAuth from './locales/en/auth.json';
import enAccount from './locales/en/account.json';
import enAdmin from './locales/en/admin.json';
import enLanding from './locales/en/landing.json';
import enNewsletter from './locales/en/newsletter.json';

import deCommon from './locales/de/common.json';
import deShop from './locales/de/shop.json';
import deBlog from './locales/de/blog.json';
import deAuth from './locales/de/auth.json';
import deAccount from './locales/de/account.json';
import deAdmin from './locales/de/admin.json';
import deLanding from './locales/de/landing.json';
import deNewsletter from './locales/de/newsletter.json';

export const SUPPORTED_LANGUAGES = ['uk', 'en', 'de'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];
export const DEFAULT_LANGUAGE: Language = 'uk';

i18n.use(initReactI18next).init({
  resources: {
    uk: { common: ukCommon, shop: ukShop, blog: ukBlog, auth: ukAuth, account: ukAccount, admin: ukAdmin, landing: ukLanding, newsletter: ukNewsletter },
    en: { common: enCommon, shop: enShop, blog: enBlog, auth: enAuth, account: enAccount, admin: enAdmin, landing: enLanding, newsletter: enNewsletter },
    de: { common: deCommon, shop: deShop, blog: deBlog, auth: deAuth, account: deAccount, admin: deAdmin, landing: deLanding, newsletter: deNewsletter },
  },
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: ['common', 'shop', 'blog', 'auth', 'account', 'admin', 'landing', 'newsletter'],
  interpolation: { escapeValue: false },
});

export default i18n;
