import type { HassEntities, HassEntity } from 'home-assistant-js-websocket';

/**
 * Filters entities by their domain
 * @param entities - The entities to filter
 * @param domains - The domains to filter by
 * @returns The filtered entities
 */
export function filterEntitiesByDomains(entities: HassEntity[] | HassEntities, ...domains: string[]) {
  const values = Array.isArray(entities) ? entities : Object.values(entities);
  return values.filter(entity => domains.includes(entity.entity_id.split('.')[0]));
}

export function getFirstEntityByDomainPreference(entities: HassEntity[], ...domainPreference: string[]): HassEntity {
  const filteredList = filterEntitiesByDomains(entities, ...domainPreference);
  // now sort by the last updated
  const sortedListByUpdated = filteredList.sort((a, b) => {
    // If either is missing last_updated, handle gracefully
    if (!a.last_updated && !b.last_updated) {
      return 0;
    }
    if (!a.last_updated) {
      // put 'a' after 'b'
      return 1;
    }
    if (!b.last_updated) {
      // put 'b' after 'a'
      return -1;
    }

    // Parse timestamps as numbers for comparison
    const aTime = Date.parse(a.last_updated);
    const bTime = Date.parse(b.last_updated);

    // Return negative if b is newer than a (so b comes first)
    // This sorts in descending order by time, i.e. newest first
    return bTime - aTime;
  });
  if (sortedListByUpdated.length === 0) {
    return entities[0];
  }
  return sortedListByUpdated[0];
}
