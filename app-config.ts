import { config as dotEnv } from 'dotenv';
import addonConfig from './config.json' assert { type: "json" };

const isProductionEnvironment = process.env.NODE_ENV === 'production';

if (!isProductionEnvironment) {
  // Convenience for local dev
  dotEnv({ path: '.env' });
  dotEnv({ path: '.env.local' });
}

interface Config {
  isProductionEnvironment: boolean;
  ports: Record<string, number>;
  version: string;
}

export const config: Config = {
  isProductionEnvironment,
  version: addonConfig.version,
  ports: {
    CLIENT_PORT: 4000,
    SERVER_PORT: 2022
  },
} as const;
