/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMETCHAT_APP_ID?: string
  readonly VITE_COMETCHAT_REGION?: string
  readonly VITE_COMETCHAT_AUTH_KEY?: string
  readonly VITE_COMETCHAT_FACULTY_UID?: string
  readonly VITE_COMETCHAT_PANELIST_UID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
