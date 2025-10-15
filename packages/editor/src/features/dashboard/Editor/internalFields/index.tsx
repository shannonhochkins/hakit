import { Actions, FieldConfiguration, InternalComponentFields, InternalRootComponentFields } from '@typings/fields';
import { DOUBLE_TAP_DELAY, HOLD_DELAY } from '@hooks/usePressGestures';

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
            { label: 'None', value: 'none' },
            { label: 'URL', value: 'external' }, // value should match Actions['type']
            { label: 'Navigate', value: 'navigate' },
            { label: 'Control Entity', value: 'controlEntity' },
          ],
        },
        entity: {
          type: 'entity',
          default: entities => entities[0].entity_id,
          label: 'Entity',
          visible(data) {
            return data.interactions[type]?.type === 'controlEntity';
          },
          description: 'The entity to control',
        },
        service: {
          type: 'service',
          default: '',
          label: 'Service',
          visible(data) {
            const a = data.interactions[type];
            return a?.type === 'controlEntity' && typeof a.entity === 'string' && a.entity.length > 0;
          },
          description: 'The service to call',
        },
        url: {
          type: 'text',
          label: 'URL',
          default: '',
          description: 'The URL to open',
          visible(data) {
            return data.interactions[type]?.type === 'external';
          },
        },
        target: {
          type: 'select',
          label: 'Navigation Target',
          visible(data) {
            return data.interactions[type]?.type === 'external';
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
            return data.interactions[type]?.type === 'navigate';
          },
          default: {
            dashboardId: '',
            pageId: '',
          },
          description: 'Page to navigate to',
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
