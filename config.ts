import { config as dotEnv } from 'dotenv';
import path from 'path';

const isProductionEnvironment = process.env.NODE_ENV === 'production';

if (!isProductionEnvironment) {
  // Convenience for local dev
  dotEnv({ path: path.resolve('.env') });
  dotEnv({ path: path.resolve('.env.local') });
}

interface Config {
  isProductionEnvironment: boolean;
  ports: Record<string, number>;
}

export const config: Readonly<Config> = {
  isProductionEnvironment,
  ports: {
    CLIENT_PORT: 4000,
    SERVER_PORT: 2022
  },
};
