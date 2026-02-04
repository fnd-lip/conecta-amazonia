declare namespace NodeJS {
  interface ProcessEnv {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_SECURE?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;

    FRONTEND_URL?: string;
    MAIL_FROM?: string;

    DATABASE_URL?: string;
    JWT_SECRET?: string;
    PORT?: string;
    NODE_ENV?: string;
  }
}
export {};
