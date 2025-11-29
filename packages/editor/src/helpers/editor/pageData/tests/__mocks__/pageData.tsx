import { FilterByDomain } from '@hakit/core';
import { EntityName } from '@hakit/core';
import { DefaultComponentProps } from '@measured/puck';
import { PageValue } from '@typings/fields';
import { CustomPuckConfig, PuckPageData, Slot } from '@typings/puck';

export const pageData: PuckPageData = {
  zones: {},
  content: [],
  root: {
    props: {
      '@hakit/default-root': {
        background: {
          test: {
            $xlg: 'foo',
          },
          useBackgroundImage: {
            $xlg: true,
          },
          backgroundImage: {},
          backgroundSize: {
            $xlg: 'cover',
          },
          backgroundSizeCustom: {
            $xlg: '',
          },
          backgroundPosition: {
            $xlg: 'center center',
          },
          backgroundRepeat: {
            $xlg: 'no-repeat',
          },
          overlayColor: {
            $xlg: '#4254c5',
          },
          overlayBlendMode: {
            $xlg: 'multiply',
          },
          blur: {
            $xlg: 25,
          },
          overlayOpacity: {
            $xlg: 0.9,
          },
          useAdvancedFilters: {
            $xlg: false,
          },
          filterBrightness: {
            $xlg: 1,
          },
          filterContrast: {
            $xlg: 1,
          },
          filterSaturate: {
            $xlg: 1,
          },
          filterGrayscale: {
            $xlg: 0,
          },
          fake: {
            $xlg: 'fake',
          },
        },
        typography: {
          fontFamily: {
            $xlg: 'roboto',
          },
          fontColor: {
            $xlg: '#ffffff',
          },
          useAdvancedTypography: {
            $xlg: true,
          },
          headingWeight: {
            $xlg: 600,
          },
          bodyWeight: {
            $xlg: 400,
          },
          baseFontSize: {
            $xlg: '16px',
          },
          lineHeight: {
            $xlg: 1.5,
          },
          letterSpacing: {
            $xlg: 0,
          },
        },
      },
      device: {
        $xlg: 'xlg',
      },
      styles: {
        css: {
          $xlg: '',
        },
      },
      content: [
        {
          type: 'Navigation',
          props: {
            content: [],
            options: {
              pages: [],
              hideClock: false,
            },
            clockOptions: {
              hideTime: false,
              useTimeEntity: true,
              timeEntity: 'sensor.time',
              timeFormat: 'hh:mm a',
              throttleTime: 1000,
              hideDate: true,
              useDateEntity: true,
              dateEntity: 'sensor.date',
              dateFormat: 'dddd, MMMM DD YYYY',
              hideIcon: true,
              icon: 'mdi:calendar',
            },
            device: 'xlg',
            styles: {
              css: '',
            },
            id: 'Navigation-5aecb899-5732-428a-99a2-4cbc62ebf68c',
          },
        },
      ],
    },
  },
};

export interface NavigationProps {
  content: Slot;
  options: {
    hideClock?: boolean;
    pages: PageValue[];
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

export const userConfig: CustomPuckConfig<
  {
    Navigation: NavigationProps;
  },
  DefaultComponentProps,
  true
> = {
  components: {
    Navigation: {
      label: 'Navigation',
      render: () => <></>,
      fields: {
        content: {
          type: 'slot',
        },
        options: {
          type: 'object',
          label: 'Options',
          description: 'General options for the navigation bar',
          objectFields: {
            pages: {
              type: 'pages',
              label: 'Pages',
              default: [],
              description: 'Select pages to appear in the navigation bar',
            },
            hideClock: {
              type: 'radio',
              label: 'Hide Clock',
              description: 'Hide the clock in the navigation bar',
              options: [
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ],
              default: false,
            },
          },
        },
        clockOptions: {
          type: 'object',
          label: 'Clock Options',
          description: 'Options for the clock within the navigation bar',

          objectFields: {
            hideTime: {
              type: 'radio',
              label: 'Hide Time',
              description: 'Hide the time in the clock',
              options: [
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ],
              default: false,
            },
            useTimeEntity: {
              type: 'radio',
              label: 'Use Time Entity',
              description: 'Use a time entity from your home assistant instance',
              options: [
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ],
              default: true,
            },
            timeEntity: {
              type: 'entity',
              description: 'The entity to use for the time, entity ID must contain the word "time"',
              label: 'Time Entity',
              default: options => {
                const defaultEntity = options.find(entity => entity.entity_id === 'sensor.time');
                return defaultEntity?.entity_id ?? undefined;
              },
            },
            timeFormat: {
              type: 'text',
              label: 'Time Format',
              description: 'The format to use for the time',
              default: 'hh:mm a',
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
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ],
              default: true,
            },
            useDateEntity: {
              type: 'radio',
              label: 'Use Date Entity',
              description: 'Use a date entity from your home assistant instance',
              options: [
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ],
              default: true,
            },
            dateEntity: {
              type: 'entity',
              label: 'Date Entity',
              description: 'The entity to use for the date, entity ID must contain the word "date"',
              default: options => {
                const defaultEntity = options.find(entity => entity.entity_id === 'sensor.date');
                return defaultEntity?.entity_id ?? undefined;
              },
            },
            dateFormat: {
              type: 'text',
              label: 'Date Format',
              description: 'The format to use for the date',
              default: 'dddd, MMMM DD YYYY',
            },
            hideIcon: {
              type: 'radio',
              label: 'Hide Icon',
              description: 'Hide the icon in the clock',
              options: [
                {
                  label: 'Yes',
                  value: true,
                },
                {
                  label: 'No',
                  value: false,
                },
              ],
              default: true,
            },
            icon: {
              type: 'text',
              label: 'Icon',
              description: 'The icon to use for the clock',
              default: 'mdi:calendar',
            },
          },
        },
      },
      permissions: {
        delete: true,
        drag: true,
        duplicate: false,
      },
      defaultProps: {
        content: [],
        options: {
          pages: [],
          hideClock: false,
        },
        clockOptions: {
          hideTime: false,
          useTimeEntity: true,
          timeEntity: 'sensor.time',
          timeFormat: 'hh:mm a',
          throttleTime: 1000,
          hideDate: true,
          useDateEntity: true,
          dateEntity: 'sensor.date',
          dateFormat: 'dddd, MMMM DD YYYY',
          hideIcon: true,
          icon: 'mdi:calendar',
        },
      },
    },
  },
  categories: {
    '@hakit/test': {
      title: '@hakit/test',
      defaultExpanded: true,
      components: ['Navigation'],
    },
  },
  root: {
    label: 'Root',
    rootConfiguration: true,
    fields: {
      '@hakit/default-root': {
        type: 'object',
        label: '@hakit/editor',
        section: {
          expanded: true,
        },
        objectFields: {
          background: {
            type: 'object',
            section: {
              expanded: true,
            },
            label: 'Background options',
            description: 'General options for the main background',
            objectFields: {
              test: {
                type: 'custom',
                label: 'Test',
                default: {
                  foo: '',
                },
                addonId: '@hakit/default-root',
                render: () => <></>,
              },
              useBackgroundImage: {
                type: 'switch',
                label: 'Use Background Image',
                description: 'Whether to use a background image or not',
                default: true,
                addonId: '@hakit/default-root',
              },
              backgroundImage: {
                type: 'imageUpload',
                label: 'Background Image',
                description: 'The entity to display in the button card',
                addonId: '@hakit/default-root',
                default: '',
              },
              backgroundSize: {
                type: 'select',
                label: 'Background Size',
                description: 'CSS background-size value',
                default: 'cover',
                options: [
                  {
                    label: 'Cover',
                    value: 'cover',
                  },
                  {
                    label: 'Contain',
                    value: 'contain',
                  },
                  {
                    label: 'Auto',
                    value: 'auto',
                  },
                  {
                    label: 'Custom…',
                    value: 'custom',
                  },
                ],
                addonId: '@hakit/default-root',
              },
              backgroundSizeCustom: {
                type: 'text',
                label: 'Custom Background Size',
                description: 'Any valid CSS background-size value',
                default: '',
                addonId: '@hakit/default-root',
              },
              backgroundPosition: {
                type: 'text',
                label: 'Background Position',
                description: 'CSS background-position (e.g., "center center", "top", "50% 50%")',
                default: 'center center',
                addonId: '@hakit/default-root',
              },
              backgroundRepeat: {
                type: 'select',
                label: 'Background Repeat',
                description: 'CSS background-repeat',
                default: 'no-repeat',
                options: [
                  {
                    label: 'No Repeat',
                    value: 'no-repeat',
                  },
                  {
                    label: 'Repeat',
                    value: 'repeat',
                  },
                  {
                    label: 'Repeat X',
                    value: 'repeat-x',
                  },
                  {
                    label: 'Repeat Y',
                    value: 'repeat-y',
                  },
                  {
                    label: 'Space',
                    value: 'space',
                  },
                  {
                    label: 'Round',
                    value: 'round',
                  },
                ],
                addonId: '@hakit/default-root',
              },
              overlayColor: {
                type: 'color',
                label: 'Overlay Color',
                description:
                  'Background color or gradient. If an image is enabled, this tints the image; otherwise it becomes the background.',
                default: '#4254c5',
                addonId: '@hakit/default-root',
              },
              overlayBlendMode: {
                type: 'select',
                label: 'Overlay Blend Mode',
                description: 'How the overlay color blends with the image',
                default: 'multiply',
                options: [
                  {
                    label: 'Color',
                    value: 'color',
                  },
                  {
                    label: 'Color Burn',
                    value: 'color-burn',
                  },
                  {
                    label: 'Color Dodge',
                    value: 'color-dodge',
                  },
                  {
                    label: 'Darken',
                    value: 'darken',
                  },
                  {
                    label: 'Difference',
                    value: 'difference',
                  },
                  {
                    label: 'Exclusion',
                    value: 'exclusion',
                  },
                  {
                    label: 'Hard Light',
                    value: 'hard-light',
                  },
                  {
                    label: 'Hue',
                    value: 'hue',
                  },
                  {
                    label: 'Lighten',
                    value: 'lighten',
                  },
                  {
                    label: 'Luminosity',
                    value: 'luminosity',
                  },
                  {
                    label: 'Multiply',
                    value: 'multiply',
                  },
                  {
                    label: 'Normal',
                    value: 'normal',
                  },
                  {
                    label: 'Overlay',
                    value: 'overlay',
                  },
                  {
                    label: 'Saturation',
                    value: 'saturation',
                  },
                  {
                    label: 'Screen',
                    value: 'screen',
                  },
                  {
                    label: 'Soft Light',
                    value: 'soft-light',
                  },
                ],
                addonId: '@hakit/default-root',
              },
              blur: {
                type: 'number',
                label: 'Blur',
                min: 0,
                description: 'Blur amount applied to the background image',
                default: 25,
                addonId: '@hakit/default-root',
              },
              overlayOpacity: {
                type: 'number',
                label: 'Overlay Opacity',
                description: 'Opacity applied to the overlay color',
                default: 0.9,
                min: 0,
                max: 1,
                step: 0.1,
                addonId: '@hakit/default-root',
              },
              useAdvancedFilters: {
                type: 'switch',
                label: 'Use Advanced Filters',
                description: 'Enable image filters like brightness, contrast, saturation and grayscale',
                default: false,
                addonId: '@hakit/default-root',
              },
              filterBrightness: {
                type: 'number',
                label: 'Brightness',
                description: 'CSS filter brightness()',
                default: 1,
                min: 0,
                max: 3,
                step: 0.05,
                addonId: '@hakit/default-root',
              },
              filterContrast: {
                type: 'number',
                label: 'Contrast',
                description: 'CSS filter contrast()',
                default: 1,
                min: 0,
                max: 3,
                step: 0.05,
                addonId: '@hakit/default-root',
              },
              filterSaturate: {
                type: 'number',
                label: 'Saturate',
                description: 'CSS filter saturate()',
                default: 1,
                min: 0,
                max: 3,
                step: 0.05,
                addonId: '@hakit/default-root',
              },
              filterGrayscale: {
                type: 'number',
                label: 'Grayscale',
                description: 'CSS filter grayscale()',
                default: 0,
                min: 0,
                max: 1,
                step: 0.05,
                addonId: '@hakit/default-root',
              },
            },
            addonId: '@hakit/default-root',
          },
          typography: {
            type: 'object',
            section: {
              expanded: true,
            },
            label: 'Typography',
            description: 'Font and text styling options',
            objectFields: {
              fontFamily: {
                type: 'select',
                label: 'Font Family',
                description: 'Choose a font family for your dashboard',
                default: 'roboto',
                options: [
                  {
                    label: 'System Font',
                    value: 'system',
                  },
                  {
                    label: 'Roboto',
                    value: 'roboto',
                  },
                  {
                    label: 'Open Sans',
                    value: 'open-sans',
                  },
                  {
                    label: 'Lato',
                    value: 'lato',
                  },
                  {
                    label: 'Montserrat',
                    value: 'montserrat',
                  },
                  {
                    label: 'Source Sans Pro',
                    value: 'source-sans-pro',
                  },
                  {
                    label: 'Poppins',
                    value: 'poppins',
                  },
                  {
                    label: 'Nunito',
                    value: 'nunito',
                  },
                  {
                    label: 'Inter',
                    value: 'inter',
                  },
                  {
                    label: 'Playfair Display',
                    value: 'playfair-display',
                  },
                  {
                    label: 'Merriweather',
                    value: 'merriweather',
                  },
                ],
                addonId: '@hakit/default-root',
              },
              fontColor: {
                type: 'color',
                label: 'Font Color',
                description: 'Primary text color for your dashboard',
                default: '#ffffff',
                addonId: '@hakit/default-root',
              },
              useAdvancedTypography: {
                type: 'switch',
                label: 'Advanced Typography',
                description: 'Enable advanced typography options',
                default: false,
                addonId: '@hakit/default-root',
              },
              headingWeight: {
                type: 'select',
                label: 'Heading Weight',
                description: 'Font weight for headings and titles',
                default: 600,
                options: [
                  {
                    label: 'Light (300)',
                    value: 300,
                  },
                  {
                    label: 'Regular (400)',
                    value: 400,
                  },
                  {
                    label: 'Medium (500)',
                    value: 500,
                  },
                  {
                    label: 'Semi Bold (600)',
                    value: 600,
                  },
                  {
                    label: 'Bold (700)',
                    value: 700,
                  },
                ],
                addonId: '@hakit/default-root',
              },
              bodyWeight: {
                type: 'select',
                label: 'Body Weight',
                description: 'Font weight for body text',
                default: 400,
                options: [
                  {
                    label: 'Light (300)',
                    value: 300,
                  },
                  {
                    label: 'Regular (400)',
                    value: 400,
                  },
                  {
                    label: 'Medium (500)',
                    value: 500,
                  },
                  {
                    label: 'Semi Bold (600)',
                    value: 600,
                  },
                ],
                addonId: '@hakit/default-root',
              },
              baseFontSize: {
                type: 'unit',
                label: 'Base Font Size',
                description: 'Base font size to apply to the dashboard',
                default: '16px',
                min: 12,
                max: 24,
                step: 1,
                addonId: '@hakit/default-root',
              },
              lineHeight: {
                type: 'number',
                label: 'Line Height',
                description: 'Line height multiplier',
                default: 1.5,
                min: 1.2,
                max: 2,
                step: 0.1,
                addonId: '@hakit/default-root',
              },
              letterSpacing: {
                type: 'number',
                label: 'Letter Spacing',
                description: 'Letter spacing in pixels',
                default: 0,
                min: -1,
                max: 2,
                step: 0.1,
                addonId: '@hakit/default-root',
              },
            },
            addonId: '@hakit/default-root',
          },
        },
        addonId: '@hakit/default-root',
      },
      device: {
        type: 'custom',
        default: 'xlg',
        label: 'Active Breakpoint',
        description: 'The active breakpoint for this component, used for responsive design',
        render: () => <></>,
      },
      styles: {
        type: 'object',
        label: 'Global styles',
        section: {
          expanded: false,
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
    },
    defaultProps: {
      '@hakit/default-root': {
        background: {
          test: {
            foo: '',
          },
          useBackgroundImage: true,
          backgroundSize: 'cover',
          backgroundSizeCustom: '',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          overlayColor: '#4254c5',
          overlayBlendMode: 'multiply',
          blur: 25,
          overlayOpacity: 0.9,
          useAdvancedFilters: false,
          filterBrightness: 1,
          filterContrast: 1,
          filterSaturate: 1,
          filterGrayscale: 0,
        },
        typography: {
          fontFamily: 'roboto',
          fontColor: '#ffffff',
          useAdvancedTypography: false,
          headingWeight: 600,
          bodyWeight: 400,
          baseFontSize: '16px',
          lineHeight: 1.5,
          letterSpacing: 0,
        },
      },
      device: 'xlg',
      styles: {
        css: '',
      },
    },
  },
};
