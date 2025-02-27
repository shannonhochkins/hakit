import { ButtonCard as ButtonCardInner, type ButtonCardProps as ButtonCardPropsInner } from '@hakit/components';
import { createComponent } from '@editor/components';
import { type EntityName } from '@hakit/core';
import { getFirstEntityByDomainPreference } from '@editor/helpers/entities';

import { dataToTheme } from '@form/definitions/size';

export type ButtonCardProps = {
  options: {
    entity: EntityName;
    layoutType: ButtonCardPropsInner<EntityName>['layoutType'];
  };
};

type WithActions = true;
type WithSizeOptions = true;
const component = createComponent<ButtonCardProps>({
  label: 'ButtonCard',
  category: 'Cards',
  fields: {
    options: {
      type: 'object',
      label: 'General',
      description: 'General options for the button card',
      default: {},
      disableBreakpoints: true,
      collapsible: {
        open: true,
      },
      objectFields: {
        entity: {
          type: 'entity',
          label: 'Entity',
          required: true,
          description: 'The entity to display in the button card',
          options: data => Object.values(data.entities),
          default: options => {
            const defaultEntity = getFirstEntityByDomainPreference(options, 'light', 'switch');
            return defaultEntity.entity_id;
          },
        },
        layoutType: {
          type: 'select',
          label: 'Layout Type',
          description: 'The layout type of the button card',
          default: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Slim', value: 'slim' },
            { label: 'Slim Vertical', value: 'slim-vertical' },
          ],
        },
      },
    },
  },
  withActions: false,
  withSizeOptions: false,
  inline: true,
  render: ({ puck, options, actions }) => {
    // const { styles, className } = dataToTheme(sizeOptions, activeBreakpoint);
    console.log('options', options);
    return (
      <ButtonCardInner
        ref={puck.dragRef}
        entity={options.entity}
        layoutType={options.layoutType}
        service={actions?.tapAction?.tapService}
        // className={className}
        disableColumns
        // style={styles}
      />
    );
  },
});

export default component;
