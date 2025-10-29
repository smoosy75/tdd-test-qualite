declare namespace NodeJS {
  interface ProcessEnv {
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    DATABASE_URL: string;
    PAGE_SIZE: string;
  }
}