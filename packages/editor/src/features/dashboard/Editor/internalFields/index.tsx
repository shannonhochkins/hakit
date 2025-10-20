import { Actions, FieldConfiguration, InternalComponentFields, InternalRootComponentFields } from '@typings/fields';
import { DOUBLE_TAP_DELAY, HOLD_DELAY } from '@hooks/usePressGestures';
import { ServiceField } from '@components/Form/Field/Service';
import { Entity } from '@components/Form/Field/Entity';
import { computeDomain, SnakeOrCamelDomains } from '@hakit/core';
import { Column } from '@components/Layout';
import { MousePointerClick, TextSelect } from 'lucide-react';
import { CodeField } from '@components/Form/Field/Code';
import { PopupIdField } from './PopupIdField';

export const internalRootComponentFields: FieldConfiguration<InternalRootComponentFields> = {
  styles: {
    type: 'object',
    label: 'Global styles',
    collapseOptions: {
      startExpanded: false,
    },
    description: 'Provide global CSS styles for the entire dashboard',
    objectFields: {
      css: {
        type: 'code',
        language: 'css',
        label: 'CSS Styles',
        description: 'Provide global CSS styles for the entire dashboard',
        default: '',
      },
    },
  },
  content: {
    type: 'slot',
  },
};

function getInteractionFields<T extends keyof InternalComponentFields['interactions']>(type: T) {
  const fields: FieldConfiguration<{ value: Actions }, InternalComponentFields> = {
    // value key here is just to satisfy the type checker
    value: {
      type: 'object',
      label: 'ignore',
      description: 'ignore',
      objectFields: {
        type: {
          type: 'select',
          label: 'Type',
          description: 'The type of interaction to perform',
          default: 'none',
          options: [
            // value should match Actions['type']
            { label: 'None', value: 'none' },
            { label: 'URL', value: 'external' },
            { label: 'Navigate', value: 'navigate' },
            { label: 'Call Service', value: 'callService' },
            { label: 'Popup', value: 'popup' },
          ],
        },
        callService: {
          type: 'custom',
          visible(data) {
            return data.interactions[type].type === 'callService';
          },
          default: {
            entity: undefined,
            service: undefined,
            serviceData: undefined,
          },
          label: 'Call Service Options',
          description: 'Call a service on an entity',
          render({ value, onChange }) {
            const domain = computeDomain(value?.entity ?? 'unknown') as SnakeOrCamelDomains;
            const service = value?.service ?? undefined;
            const serviceData = value?.serviceData ?? {};
            return (
              <Column fullWidth alignItems='start' justifyContent='start' gap='var(--space-4)' style={{ padding: '0 var(--space-3)' }}>
                <Entity
                  id='entity-service-entity'
                  name='entity'
                  label='Entity'
                  icon={<TextSelect size={16} />}
                  helperText='The entity to call the service on'
                  value={value?.entity}
                  onChange={entity => onChange({ ...value, entity })}
                />
                {domain && (
                  <ServiceField
                    icon={<MousePointerClick size={16} />}
                    label='Service'
                    helperText='The service to call'
                    id='entity-service-service'
                    domain={domain}
                    name='service'
                    value={service}
                    onChange={service => onChange({ ...value, service })}
                  />
                )}
                {service && (
                  <CodeField
                    language='json'
                    label='Service Data'
                    helperText={'The data to send to the service'}
                    id='entity-service-service-data'
                    name='serviceData'
                    value={serviceData}
                    onChange={serviceData => {
                      onChange({
                        ...value,
                        serviceData: serviceData,
                      });
                    }}
                  />
                )}
              </Column>
            );
          },
        },
        url: {
          type: 'text',
          label: 'URL',
          default: '',
          description: 'The URL to open',
          visible(data) {
            return data.interactions[type].type === 'external';
          },
        },
        target: {
          type: 'select',
          label: 'Navigation Target',
          visible(data) {
            return data.interactions[type].type === 'external';
          },
          default: '_blank',
          options: [
            { label: '_self', value: '_self' },
            { label: '_blank', value: '_blank' },
            { label: '_parent', value: '_parent' },
            { label: '_top', value: '_top' },
          ],
          description: 'Window target for external URL',
        },
        page: {
          type: 'page',
          label: 'Page ID',
          visible(data) {
            return data.interactions[type].type === 'navigate';
          },
          default: {
            dashboardId: '',
            pageId: '',
          },
          description: 'Page to navigate to',
        },
        popupId: {
          type: 'custom',
          label: 'New Popup',
          description: 'Configure the popup to open',
          default: '', // populated later
          visible(data) {
            return data.interactions[type].type === 'popup';
          },
          render: PopupIdField,
        },
      },
    },
  };
  if (fields.value.type === 'object') {
    return fields.value.objectFields;
  }
  throw new Error('Interaction fields must be an object');
}
const tapValue = getInteractionFields('tap');
const holdValue = getInteractionFields('hold');
const doubleTapValue = getInteractionFields('doubleTap');

export const internalComponentFields: FieldConfiguration<InternalComponentFields> = {
  interactions: {
    type: 'object',
    label: 'Interactions',
    collapseOptions: {
      startExpanded: false,
    },
    description: 'Provide interactions for the component',
    objectFields: {
      tap: {
        label: 'Tap',
        description: 'Action to perform when the component is tapped',
        objectFields: {
          ...tapValue,
        },
        type: 'object',
      },
      hold: {
        label: 'Hold',
        description: 'Action to perform when the component is held',
        collapseOptions: {
          startExpanded: false,
        },
        objectFields: {
          ...holdValue,
          holdDelay: {
            type: 'number',
            label: 'Hold Delay',
            description: 'The minimum time to hold to trigger the action',
            visible(data) {
              return data.interactions.hold?.type && data.interactions.hold?.type !== 'none';
            },
            default: HOLD_DELAY,
          },
        },
        type: 'object',
      },
      doubleTap: {
        label: 'Double Tap',
        description: 'Action to perform when the component is double tapped',
        collapseOptions: {
          startExpanded: false,
        },
        objectFields: {
          ...doubleTapValue,
          doubleTapDelay: {
            type: 'number',
            label: 'Double Tap Delay',
            description: 'The minimum time between taps to trigger the action',
            visible(data) {
              return data.interactions.doubleTap?.type && data.interactions.doubleTap?.type !== 'none';
            },
            default: DOUBLE_TAP_DELAY,
          },
        },
        type: 'object',
      },
    },
  },
  styles: {
    type: 'object',
    label: 'Style Overrides',
    collapseOptions: {
      startExpanded: false,
    },
    description: 'Provide css updates to override the default styles of this component',
    objectFields: {
      css: {
        type: 'code',
        language: 'css',
        label: 'CSS Styles',
        description: 'Provide css updates to override the default styles of this component',
        default: '',
      },
    },
  },
};
