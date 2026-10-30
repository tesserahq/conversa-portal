import { createCookie } from 'react-router'
import { createI18nextMiddleware } from 'remix-i18next'
import { initReactI18next } from 'react-i18next'

import * as i18n from '@/modules/i18n/i18n'

export const localeCookie = createCookie('lng', {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
})

export const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    cookie: localeCookie,
  },
  // Configuration for i18next used when
  // translating messages server-side only.
  i18next: {
    ...i18n,
    resources: i18n.resources,
    defaultNS: i18n.defaultNS,
    fallbackLng: i18n.fallbackLng,
    interpolation: { escapeValue: false },
  },
  plugins: [initReactI18next],
})
