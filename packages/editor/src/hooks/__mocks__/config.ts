export const mockConfig = {
  components: {
    Navigation: {
      category: 'Misc',
      label: 'Navigation',
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
          default: {
            pages: [],
            hideClock: false,
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
              default: 'sensor.time',
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
              default: 'sensor.date',
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
          default: {
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
          default: {
            css: '',
          },
        },
      },
      permissions: {
        delete: true,
        drag: true,
        duplicate: false,
      },
      defaultProps: {
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
        styles: {
          css: '',
        },
      },
      inline: true,
      _remoteAddonName: '@hakit/test',
      _remoteAddonId: '@hakit/test',
    },
    FieldRework: {
      label: 'FieldRework',
      fields: {
        text: {
          type: 'text',
          label: 'Text Field',
          default: 'This is a text field',
          collapseOptions: {},
          description: 'A simple text field for testing purposes',
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
          default: {
            css: '',
          },
        },
      },
      defaultProps: {
        text: 'This is a text field',
        styles: {
          css: '',
        },
      },
      inline: true,
      _remoteAddonName: '@hakit/test',
      _remoteAddonId: '@hakit/test',
    },
    Layout: {
      label: 'Layout',
      category: 'Layout',
      fields: {
        options: {
          type: 'object',
          label: 'Layout Options',
          disableBreakpoints: true,
          description: 'Controls the layout of the container',
          objectFields: {
            direction: {
              type: 'radio',
              default: 'row',
              label: 'Direction',
              description: 'Controls if the children should be laid out horizontally or vertically',
              options: [
                {
                  label: 'Row',
                  value: 'row',
                },
                {
                  label: 'Row Reverse',
                  value: 'row-reverse',
                },
                {
                  label: 'Column',
                  value: 'column',
                },
                {
                  label: 'Column Reverse',
                  value: 'column-reverse',
                },
              ],
            },
            alignItems: {
              type: 'select',
              default: 'flex-start',
              label: 'Align Items',
              description: 'Controls how children are distributed along the horizontal axis',
              options: [
                {
                  label: 'Center',
                  value: 'center',
                },
                {
                  label: 'Flex End',
                  value: 'flex-end',
                },
                {
                  label: 'Flex Start',
                  value: 'flex-start',
                },
                {
                  label: 'Stretch',
                  value: 'stretch',
                },
              ],
            },
            justifyContent: {
              type: 'select',
              default: 'flex-start',
              label: 'Justify Content',
              description: 'Controls how items are aligned along the vertical axis',
              options: [
                {
                  label: 'Center',
                  value: 'center',
                },
                {
                  label: 'End',
                  value: 'end',
                },
                {
                  label: 'Flex End',
                  value: 'flex-end',
                },
                {
                  label: 'Flex Start',
                  value: 'flex-start',
                },
                {
                  label: 'Start',
                  value: 'start',
                },
                {
                  label: 'Space Around',
                  value: 'space-around',
                },
                {
                  label: 'Space Between',
                  value: 'space-between',
                },
                {
                  label: 'Space Evenly',
                  value: 'space-evenly',
                },
                {
                  label: 'Stretch',
                  value: 'stretch',
                },
              ],
            },
            wrap: {
              type: 'select',
              label: 'Wrap',
              default: 'wrap',
              description: 'Controls whether the container allows its items to move onto multiple lines.',
              options: [
                {
                  label: 'No Wrap',
                  value: 'nowrap',
                },
                {
                  label: 'Wrap',
                  value: 'wrap',
                },
                {
                  label: 'Wrap Reverse',
                  value: 'wrap-reverse',
                },
              ],
            },
            gap: {
              type: 'number',
              label: 'Gap',
              default: 16,
              min: 0,
              description: 'Controls the space between items in pixels',
            },
            padding: {
              type: 'number',
              label: 'Padding',
              default: 0,
              description: 'Controls the padding of the container in pixels',
            },
            margin: {
              type: 'number',
              label: 'Margin',
              default: 0,
              description: 'Controls the margin of the container in pixels',
            },
          },
          default: {
            direction: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            wrap: 'wrap',
            gap: 16,
            padding: 0,
            margin: 0,
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
          default: {
            css: '',
          },
        },
      },
      inline: true,
      defaultProps: {
        options: {
          direction: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          wrap: 'wrap',
          gap: 16,
          padding: 0,
          margin: 0,
        },
        styles: {
          css: '',
        },
      },
      _remoteAddonName: '@hakit/test',
      _remoteAddonId: '@hakit/test',
    },
    'Field Test': {
      label: 'Field Test',
      fields: {
        text: {
          type: 'text',
          label: 'Text Field',
          default: 'This is a text field',
          description: 'A simple text field for testing purposes',
        },
        accordion: {
          type: 'object',
          label: 'Accordion Field',
          objectFields: {
            open: {
              type: 'switch',
              label: 'Open',
              default: true,
              description: 'Whether the accordion is open or closed',
            },
            title: {
              type: 'text',
              label: 'Title',
              default: 'Accordion Title',
              description: 'The title of the accordion',
            },
            description: {
              type: 'text',
              label: 'Description',
              default: 'This is a description for the accordion field.',
              description: 'A description for the accordion field',
            },
          },
          default: {
            open: true,
            title: 'Accordion Title',
            description: 'This is a description for the accordion field.',
          },
        },
        options: {
          type: 'object',
          label: 'Field Examples',
          description: 'Variations of different field types',
          objectFields: {
            radio: {
              type: 'radio',
              default: 'row',
              label: 'Radio',
              description: 'Radio Field',
              options: [
                {
                  label: 'Row',
                  value: 'row',
                },
                {
                  label: 'Row Reverse',
                  value: 'row-reverse',
                },
                {
                  label: 'Column',
                  value: 'column',
                },
                {
                  label: 'Column Reverse',
                  value: 'column-reverse',
                },
              ],
            },
            select: {
              type: 'select',
              default: 'flex-start',
              label: 'Select',
              description: 'Select Field',
              options: [
                {
                  label: 'Center',
                  value: 'center',
                },
                {
                  label: 'Flex End',
                  value: 'flex-end',
                },
                {
                  label: 'Flex Start',
                  value: 'flex-start',
                },
                {
                  label: 'Stretch',
                  value: 'stretch',
                },
              ],
            },
            number: {
              type: 'number',
              label: 'Number',
              default: 16,
              min: 0,
              description: 'Number Field',
            },
            text: {
              type: 'text',
              label: 'Text',
              default: '',
              description: 'Text field',
            },
            array: {
              type: 'array',
              label: 'Array',
              default: [
                {
                  label: 'Test',
                  id: '123',
                },
              ],
              min: 5,
              max: 5,
              defaultItemProps: {
                id: '',
                label: 'Item Name',
              },
              arrayFields: {
                label: {
                  label: 'Label',
                  type: 'text',
                  default: 'Item Name',
                },
                id: {
                  type: 'hidden',
                  default: '',
                  disableBreakpoints: true,
                },
              },
            },
          },
          default: {
            radio: 'row',
            select: 'flex-start',
            number: 16,
            text: '',
            array: [
              {
                label: 'Test',
                id: '123',
              },
            ],
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
          default: {
            css: '',
          },
        },
      },
      defaultProps: {
        text: 'This is a text field',
        accordion: {
          open: true,
          title: 'Accordion Title',
          description: 'This is a description for the accordion field.',
        },
        options: {
          radio: 'row',
          select: 'flex-start',
          number: 16,
          text: '',
          array: [
            {
              label: 'Test',
              id: '123',
            },
          ],
        },
        styles: {
          css: '',
        },
      },
      inline: true,
      _remoteAddonName: '@hakit/test',
      _remoteAddonId: '@hakit/test',
    },
  },
  categories: {
    '@hakit/test': {
      title: '@hakit/test',
      defaultExpanded: true,
      components: ['Navigation', 'FieldRework', 'Layout', 'Field Test'],
    },
  },
  root: {
    label: 'Root',
    fields: {
      '@hakit/default-root': {
        type: 'object',
        label: '@hakit/editor',
        collapseOptions: {
          startExpanded: true,
        },
        objectFields: {
          id: {
            type: 'text',
            label: 'ID',
            description: 'The ID of the root component',
            default: 'root',
            addonId: '@hakit/default-root',
          },
          background: {
            type: 'object',
            collapseOptions: {
              startExpanded: true,
            },
            label: 'Background options',
            description: 'General options for the main background',
            objectFields: {
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
            collapseOptions: {
              startExpanded: true,
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
        default: {
          id: 'root',
          background: {
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
      },
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
        default: {
          css: '',
        },
      },
      content: {
        type: 'slot',
      },
    },
    _remoteAddonName: '@hakit/editor',
    defaultProps: {
      '@hakit/default-root': {
        id: 'root',
        background: {
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
      styles: {
        css: '',
      },
    },
    inline: true,
  },
} as const;
