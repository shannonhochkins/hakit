import { filterEntitiesByDomains, getFirstEntityByDomainPreference } from "@editor/helpers/entities";
import { createComponent } from "@editor/components";
import { ButtonCardProps } from "@hakit/components";
import { EntityName, useEntity } from "@hakit/core";

type CamerasProps = {
  options: {
    entity: EntityName;
    layoutType: ButtonCardProps<EntityName>['layoutType'];
  };
}

function Render({
  options,
}: CamerasProps) {
  const entity = useEntity(options.entity);
  return (
    <div>
      {entity.attributes.friendly_name}
    </div>
  );
}


const component = createComponent<CamerasProps>({
  category: 'Misc',
  label: 'Cameras',
  fields: {
    options: {
      type: 'object',
      label: 'General',
      description: 'General options for the camera card',
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
          description: 'The entity to display in the camera card',
          options(data) {
            return filterEntitiesByDomains(data.entities, 'camera');
          },
          default: options => {
            const defaultEntity = getFirstEntityByDomainPreference(options, 'camera');
            return defaultEntity.entity_id;
          },
        },
        layoutType: {
          type: 'select',
          label: 'Layout Type',
          description: 'The layout type of the camera card',
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
  inline: true,
  render({ puck, options}) {
    return <div ref={puck.dragRef} style={{
      width: '25%',
      height: '25%',
      backgroundColor: 'red',
    }}>
      <Render options={options} />
    </div>;
  },
});

export default component;
