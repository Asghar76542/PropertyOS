// Global type definitions for PropertyOS

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      APP_URL: string;
      APP_NAME?: string;
      API_URL: string;
      REDIS_URL?: string;
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      MAX_FILE_SIZE?: string;
      ALLOWED_FILE_TYPES?: string;
      ENABLE_MOBILE_APP?: string;
      ENABLE_WEBSOCKETS?: string;
      ENABLE_FILE_UPLOADS?: string;
    }
  }

  interface FormData {
    get(name: string): FormDataEntryValue | null;
    getAll(name: string): FormDataEntryValue[];
    has(name: string): boolean;
    set(name: string, value: string | Blob): void;
    append(name: string, value: string | Blob): void;
    delete(name: string): void;
    forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void;
  }
}

export {};
