import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  db: {
    server: requireEnv('DB_SERVER', 'YOUR_IP_HERE'),
    port: Number(process.env.DB_PORT || 1433),
    database: requireEnv('DB_NAME', 'MuOnline'),
    user: requireEnv('DB_USER', 'YOUR_DB_USER'),
    password: requireEnv('DB_PASSWORD', 'YOUR_DB_PASSWORD'),
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
      enableArithAbort: true,
    },
  },
  api: {
    port: Number(process.env.PORT || process.env.API_PORT || 3001),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  // MuDevs Season 21 default: MD5 hex (32 chars) — see README "¿Qué HASH_METHOD usar?"
  hashMethod: (process.env.HASH_METHOD || 'md5').toLowerCase(),
  registration: {
    defaultSnoNumb: process.env.DEFAULT_SNO_NUMB || '1111111111111',
    insertViCurrInfo: process.env.INSERT_VI_CURR_INFO === 'true',
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 5),
  },
};
