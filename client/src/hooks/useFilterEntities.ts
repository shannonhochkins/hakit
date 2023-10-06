import { useCallback } from 'react';
import { useHass, isUnavailableState } from '@hakit/core';
import { Widget } from '@client/widgets/types';
import { HassEntity } from 'home-assistant-js-websocket';

export function useFilterEntities() {
  const { getAllEntities } = useHass();
  const entities = getAllEntities();
  return useCallback((widget: Widget<Record<string, unknown>>): HassEntity[] => {
    if (widget.entityPicker !== false) {
      const {
        domainWhitelist = [],
        domainBlacklist = [],
        entityBlacklist = [],
        entityWhitelist = [],
      }  = widget.entityPicker?.autoEntityOptions ?? {};
      return Object.keys(entities)
        .filter(entity => {
          // Filter out entities that are in the blacklist
          // if whitelist is provided, it should be included unless also in the blacklist
          // if entity blacklist is provided, it should filter after domain whitelist/blacklist
          // if entity whitelist is provided, it should filter after domain whitelist/blacklist
          const domain = entity.split('.')[0];
          // Domain blacklist
          if (domainBlacklist.includes(domain)) return false;
          // Domain whitelist
          if (domainWhitelist.length && !domainWhitelist.includes(domain)) return false;
          // Entity blacklist with partial match
          if (entityBlacklist.some(blacklisted => entity.includes(blacklisted))) return false;
          // Entity whitelist with partial match
          if (entityWhitelist.length && !entityWhitelist.some(whitelisted => entity.includes(whitelisted))) return false;
          // State availability
          if (isUnavailableState(entities[entity].state)) return false;
          return true;
        }).map(entityId => entities[entityId]);
    }
    return Object.keys(entities).map(entityId => entities[entityId]);
  }, [entities]);
}
