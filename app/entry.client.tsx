import i18next from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { HydratedRouter } from 'react-router/dom'
import * as i18n from '@/modules/i18n/i18n'

async function main() {
  await i18next
    .use(initReactI18next)
    .use(I18nextBrowserLanguageDetector)
    .init({
      ...i18n,
      ns: ['translation'],
      detection: { order: ['htmlTag'], caches: [] },
    })

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <I18nextProvider i18n={i18next}>
          <HydratedRouter />
        </I18nextProvider>
      </StrictMode>
    )
  })
}

main().catch((error) => console.error(error))
