import { type HassEntities, type HassServices } from 'home-assistant-js-websocket';

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type DefaultPropsCallbackData = {
  entities: HassEntities;
  services: HassServices | null;
};
