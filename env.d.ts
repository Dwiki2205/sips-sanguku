declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    POSTGRES_URL: string;
    POSTGRES_HOST: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DATABASE: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
