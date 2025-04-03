import { CustomFieldsConfiguration } from '../../../../../../components/Form';
import { ComponentData } from '@measured/puck';

export interface SizeOptions {
  sizeOptions: {
    widthUnit: 'px' | '%' | 'grid' | 'auto';
    widthPercentage: number;
    widthGrid: number;
    widthPx: number;
    heightUnit: 'px' | '%' | 'auto';
    heightPercentage: number;
    heightPx: number;
  };
}

export function dataToTheme(sizeOptions: SizeOptions['sizeOptions'], activeBreakpoint: string | undefined) {
  const widthUnit = sizeOptions.widthUnit ?? 'grid';
  const heightUnit = sizeOptions.heightUnit ?? 'auto';
  const width =
    widthUnit === 'px'
      ? `${sizeOptions.widthPx}px`
      : widthUnit === '%'
        ? `${sizeOptions.widthPercentage}%`
        : widthUnit === 'auto'
          ? 'auto'
          : undefined;
  const height =
    heightUnit === 'px'
      ? `${sizeOptions.heightPx}px`
      : heightUnit === '%'
        ? `${sizeOptions.heightPercentage}%`
        : heightUnit === 'auto'
          ? 'auto'
          : undefined;

  const className = `${widthUnit === 'grid' ? `${activeBreakpoint ?? 'xlg'}-${sizeOptions?.widthGrid ?? 12}` : ''}`;

  const styles = {
    display: 'flex',
    width: width,
    height: height,
  };

  return {
    styles,
    className,
  };
}

export async function resolveSizeFields(
  actionData: Omit<ComponentData<SizeOptions>, 'type'>,
  fields: CustomFieldsConfiguration<SizeOptions, true>
) {
  const widthUnit = actionData.props?.sizeOptions?.widthUnit ?? 'grid';
  const heightUnit = actionData.props?.sizeOptions?.heightUnit ?? 'auto';
  const sizeOptions = fields.sizeOptions._field;
  if (sizeOptions?.type === 'object') {
    if (widthUnit === 'grid' && sizeOptions?.objectFields?.widthGrid) {
      sizeOptions.objectFields.widthPx._field.type = 'hidden';
      sizeOptions.objectFields.widthPercentage._field.type = 'hidden';
      sizeOptions.objectFields.widthGrid._field.type = 'grid';
    } else if (widthUnit === 'px' && sizeOptions.objectFields.widthPx) {
      sizeOptions.objectFields.widthPercentage._field.type = 'hidden';
      sizeOptions.objectFields.widthGrid._field.type = 'hidden';
      sizeOptions.objectFields.widthPx._field.type = 'number';
    } else if (widthUnit === '%' && sizeOptions.objectFields.widthPercentage) {
      sizeOptions.objectFields.widthPx._field.type = 'hidden';
      sizeOptions.objectFields.widthGrid._field.type = 'hidden';
      sizeOptions.objectFields.widthPercentage._field.type = 'number';
    }
    if (heightUnit === 'px' && sizeOptions.objectFields.heightPx) {
      sizeOptions.objectFields.heightPercentage._field.type = 'hidden';
      sizeOptions.objectFields.heightPx._field.type = 'number';
    } else if (heightUnit === '%' && sizeOptions.objectFields.heightPercentage) {
      sizeOptions.objectFields.heightPx._field.type = 'hidden';
      sizeOptions.objectFields.heightPercentage._field.type = 'number';
    } else {
      sizeOptions.objectFields.heightPx._field.type = 'hidden';
      sizeOptions.objectFields.heightPercentage._field.type = 'hidden';
    }
  }
  return fields;
}

export const getSizeFields = async (): Promise<CustomFieldsConfiguration<SizeOptions>> => {
  return {
    sizeOptions: {
      type: 'object',
      label: 'Size Options',
      disableBreakpoints: true,
      default: {},
      collapsible: {
        open: true,
      },
      description: 'Controls the layout of the container',
      objectFields: {
        widthUnit: {
          type: 'radio',
          default: 'grid',
          label: 'Width Unit',
          description: 'Controls the unit of measurement for the width',
          options: ['px', '%', 'grid', 'auto'].map(value => ({ label: value, value })),
        },
        widthGrid: {
          label: 'Grid Width',
          type: 'grid',
          default: 12,
          step: 1,
          min: 1,
          max: 12,
          description: 'Controls the width as a grid size',
        },
        widthPx: {
          label: 'Width',
          type: 'number',
          default: 250,
          min: 1,
          description: 'Controls the width in pixels',
        },
        widthPercentage: {
          label: 'Width',
          type: 'number',
          default: 100,
          min: 1,
          max: 100,
          description: 'Controls the width as a percentage',
        },
        heightUnit: {
          type: 'radio',
          default: 'auto',
          label: 'Height Unit',
          description: 'Controls the unit of measurement for the height',
          options: ['auto', 'px', '%'].map(value => ({ label: value, value })),
        },
        heightPx: {
          label: 'Height',
          type: 'number',
          default: 250,
          min: 1,
          description: 'Controls the height in pixels',
        },
        heightPercentage: {
          label: 'Height',
          type: 'number',
          default: 25,
          min: 1,
          max: 100,
          description: 'Controls the height as a percentage',
        },
      },
    },
  };
};
