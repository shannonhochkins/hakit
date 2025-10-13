export const pageDataMock = {
  zones: {},
  content: [],
  root: {
    props: {
      content: [
        {
          type: 'Navigation',
          props: {
            id: 'Navigation-d0562754-5c7d-46a0-a7a9-30c86aef00da',
            content: [
              {
                type: 'Navigation',
                props: {
                  id: 'Navigation-763e164a-e512-457c-9947-8be9c0891516',
                  content: [
                    {
                      type: 'Navigation',
                      props: {
                        id: 'Navigation-b38ec5da-b7c9-430f-9b3e-ca0022d2e4cc',
                        content: [
                          {
                            type: 'Navigation',
                            props: {
                              id: 'Navigation-42c3b1af-32a9-434e-b83c-1b7225ccf297',
                              content: [
                                {
                                  type: 'FieldRework',
                                  props: {
                                    id: 'FieldRework-895935e0-e768-49d0-a6ef-5c3180fc1e31',
                                    text: {
                                      $xlg: "jinja2Template::{% if is_state('sun.sun', 'above_horizon') %}\n  It's daytime 🌞\n{% else %}\n  It's nighttime 🌙\n{% endif %}\n",
                                    },
                                    styles: {
                                      css: '',
                                    },
                                  },
                                },
                                {
                                  type: 'FieldRework',
                                  props: {
                                    id: 'FieldRework-f5ff3c29-38b6-4d6f-b62a-b3cb08e6a08c',
                                    text: "jinja2Template::{% if is_state('light.light_office_downlight_3', 'on') %}\nlight is on\n{% elif is_state('light.light_office_downlight_3', 'off') %}\nlight is off\n{% else %}\nstate: {{ states('light.light_office_downlight_3') }}\n{% endif %}",
                                    styles: {
                                      css: '',
                                    },
                                  },
                                },
                              ],
                              options: {
                                pages: [],
                                hideClock: false,
                              },
                              clockOptions: {
                                hideTime: false,
                                useTimeEntity: true,
                                timeEntity: 'sensor.time',
                                timeFormat: 'hh:mm a',
                                throttleTime: `jinja2Template::{% if is_state('sun.sun', 'above_horizon') %}\n  1000\n{% else %}\n  2000\n{% endif %}\n`,
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
                          },
                        ],
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
                    },
                  ],
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
              },
            ],
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
        },
      ],
      '@hakit/default-root': {
        id: {
          $xlg: "jinja2Template::{{ 'light is on' if is_state('light.light_office_downlight_3', 'on') else 'light is off' }}\n",
          $lg: "jinja2Template::{{ 'light is on' if is_state('light.light_office_downlight_3', 'onf') else 'light is offf' }}\n",
        },
        background: {
          useBackgroundImage: true,
          backgroundImage: {
            $xlg: 'https:/ayhinvofgdcvfssykfsx.supabase.co/storage/v1/object/public/hakit/user-content/kp_281ff48392cc40b8b5db330c59ff7ac3/images/1759985172826.png',
          },
          backgroundSize: 'cover',
          backgroundSizeCustom: '',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          overlayColor: 'rgb(79, 133, 61)',
          overlayBlendMode: 'color',
          blur: 23,
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
    content: [],
  },
};
