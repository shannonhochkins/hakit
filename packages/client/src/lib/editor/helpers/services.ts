import { computeDomain, EntityName } from '@hakit/core';
import type { HassServices } from 'home-assistant-js-websocket';

export function getDefaultServiceByEntity(entity: string | EntityName, services: HassServices | null): string | undefined {
  if (!services) {
    return;
  }
  const domain = computeDomain(entity as EntityName);
  const service = services[domain];
  if (!service) {
    return;
  }
  const serviceKeys = Object.keys(service);
  const hasToggle = serviceKeys.includes('toggle');
  // always prefer toggle if it exists
  return hasToggle ? 'toggle' : serviceKeys[0];
}
