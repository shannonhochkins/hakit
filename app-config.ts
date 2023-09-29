import { config as dotEnv } from 'dotenv';

const isProductionEnvironment = process.env.NODE_ENV === 'production';

if (!isProductionEnvironment) {
  // Convenience for local dev
  dotEnv({ path: '.env' });
  dotEnv({ path: '.env.local' });
}

interface Config {
  isProductionEnvironment: boolean;
  ports: Record<string, number>;
}

export const config: Config = {
  isProductionEnvironment,
  ports: {
    CLIENT_PORT: 4000,
    SERVER_PORT: 2022
  },
} as const;
