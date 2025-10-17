import { SnakeOrCamelDomains } from '@hakit/core';
import { toSnakeCase } from '@helpers/string/toSnakeCase';
import type { HassServices } from 'home-assistant-js-websocket';

export function getDefaultServiceByDomain(domain: SnakeOrCamelDomains, services: HassServices | null): string | undefined {
  if (!services) {
    return;
  }
  const snakeDomain = toSnakeCase(domain);
  const service = services[snakeDomain];
  if (!service) {
    return;
  }
  const serviceKeys = Object.keys(service);
  const hasToggle = serviceKeys.includes('toggle');
  // always prefer toggle if it exists
  return hasToggle ? 'toggle' : serviceKeys[0];
}
