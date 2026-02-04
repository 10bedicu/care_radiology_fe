export interface PlugConfigMeta {
  url?: string;
  name?: string;
  config?: {
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    CARE_API_URL: string;
    __CARE_PLUGIN_RUNTIME__: { meta: PlugConfigMeta };
  }
}