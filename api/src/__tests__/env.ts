export const testEnv = {
  DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/kanban',
  API_PORT: '3001',
  JWT_SECRET:
    'c0f45208f879d2a680f1675eca5d66c31d1c5c9be90d9ea81ea94ba4c61748b2',
  COOKIE_SECRET:
    '47cd57138513028bbf5918346ff30439fd8032d8cf5ed762590ea899a5dcd885',
  COOKIE_SECURE: 'false',
  CORS_ORIGIN: 'http://localhost:3000',
  WEB_DOMAIN: 'localhost',
} as const;
