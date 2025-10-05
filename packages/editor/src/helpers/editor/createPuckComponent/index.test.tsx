import type { EntityName, FilterByDomain } from '@hakit/core';
import { HassEntities, HassEntity } from 'home-assistant-js-websocket';
import { PuckContext } from '@measured/puck';
import { CustomComponentConfig } from '@typings/puck';
export interface NavigationProps {
  options: {
    hideClock?: boolean;
  };
  clockOptions: {
    useTimeEntity?: boolean;
    timeEntity?: FilterByDomain<EntityName, 'sensor'>;
    dateEntity?: FilterByDomain<EntityName, 'sensor'>;
    useDateEntity?: boolean;
    timeFormat?: string;
    dateFormat?: string;
    hideDate?: boolean;
    hideTime?: boolean;
    hideIcon?: boolean;
    throttleTime?: number;
    icon?: string;
  };
}

function NavigationBar({ clockOptions, options }: NavigationProps & { ref: PuckContext['dragRef'] }) {
  // Placeholder for the actual implementation of the NavigationBar component
  return (
    <div>
      {JSON.stringify({
        clockOptions,
        options,
      })}
    </div>
  );
}

function filterEntitiesByDomains(entities: HassEntity[] | HassEntities, ...domains: string[]) {
  const values = Array.isArray(entities) ? entities : Object.values(entities);
  return values.filter(entity => domains.includes(entity.entity_id.split('.')[0]));
}

export const definition: CustomComponentConfig<NavigationProps> = {
  label: 'Navigation',
  fields: {
    options: {
      type: 'object',
      label: 'Options',
      visible(data) {
        return data.options.hideClock === true;
      },
      description: 'General options for the navigation bar',
      collapseOptions: {
        startExpanded: true,
      },
      objectFields: {
        hideClock: {
          type: 'radio',
          label: 'Hide Clock',
          description: 'Hide the clock in the navigation bar',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: false,
        },
      },
    },
    clockOptions: {
      type: 'object',
      label: 'Clock Options',
      description: 'Options for the clock within the navigation bar',
      collapseOptions: {
        startExpanded: true,
      },
      objectFields: {
        hideTime: {
          type: 'radio',
          label: 'Hide Time',
          description: 'Hide the time in the clock',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: false,
        },
        useTimeEntity: {
          type: 'radio',
          label: 'Use Time Entity',
          description: 'Use a time entity from your home assistant instance',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: true,
          visible() {
            return true;
          },
        },
        timeEntity: {
          type: 'entity',
          description: 'The entity to use for the time, entity ID must contain the word "time"',
          label: 'Time Entity',
          filterOptions(entities) {
            return filterEntitiesByDomains(entities, 'sensor').filter(entity => entity.entity_id.includes('time'));
          },
          default: options => {
            const defaultEntity = options.find(entity => entity.entity_id === 'sensor.time');
            return defaultEntity?.entity_id ?? undefined;
          },
        },
        timeFormat: {
          type: 'text',
          label: 'Time Format',
          description: 'The format to use for the time',
          // helpLink: TODO
          default: 'hh:mm a', // maybe change this to a dropdown menu with multiple differnt options
        },
        throttleTime: {
          type: 'number',
          description: 'The time in milliseconds to throttle the time updates when no entity is provided',
          label: 'Throttle Time',
          default: 1000,
        },
        hideDate: {
          type: 'radio',
          label: 'Hide Date',
          description: 'Hide the date in the clock',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: true,
          visible(data) {
            const hideTime = data.clockOptions.hideTime ?? false;
            return !hideTime;
          },
        },
        useDateEntity: {
          type: 'radio',
          label: 'Use Date Entity',
          description: 'Use a date entity from your home assistant instance',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: true,
        },
        dateEntity: {
          type: 'entity',
          label: 'Date Entity',
          description: 'The entity to use for the date, entity ID must contain the word "date"',
          filterOptions(entities) {
            return filterEntitiesByDomains(entities, 'sensor').filter(entity => entity.entity_id.includes('date'));
          },
          default: options => {
            const defaultEntity = options.find(entity => entity.entity_id === 'sensor.date');
            return defaultEntity?.entity_id ?? undefined;
          },
        },
        dateFormat: {
          type: 'text',
          label: 'Date Format',
          description: 'The format to use for the date',
          // helpLink: TODO
          default: 'dddd, MMMM DD YYYY', // maybe change this to a dropdown menu with multiple differnt options
        },
        hideIcon: {
          type: 'radio',
          label: 'Hide Icon',
          description: 'Hide the icon in the clock',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
          default: true,
        },
        icon: {
          type: 'text',
          label: 'Icon',
          description: 'The icon to use for the clock',
          // helpLink: TODO
          default: 'mdi:calendar',
        },
      },
    },
  },
  permissions: { delete: true, drag: true, duplicate: false },
  render({ puck, options, clockOptions }) {
    return <NavigationBar clockOptions={clockOptions} options={options} ref={puck.dragRef} />;
  },
};
