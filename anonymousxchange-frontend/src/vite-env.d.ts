/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_TELEGRAM_URL?: string
  readonly VITE_WHATSAPP_URL?: string
  readonly VITE_INSTAGRAM_URL?: string
  readonly VITE_FACEBOOK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
