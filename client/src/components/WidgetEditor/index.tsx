import { Modal, Row, Column, FabCard, Tooltip } from '@hakit/components';
import { useState, useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import { PageWidget } from '@client/store';
import { useSchema, useWidget } from '@client/hooks';
import validator from '@rjsf/validator-ajv8';
import { withTheme } from '@rjsf/core';
import { Switch, FormControlLabel } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Theme } from '@rjsf/mui';
import { UiSchema, RegistryWidgetsType } from '@rjsf/utils';
import AceEditor from 'react-ace';
import { DEFAULT_WIDGET_SIZE } from '@root/client/src/store/config';
import { TabPanel, Tab, Tabs } from '@client/components/Shared/Tabs';
import 'ace-builds/src-noconflict/mode-scss';
import 'ace-builds/src-noconflict/theme-dracula';
import { useDebouncedCallback } from "use-debounce";
// custom form widgets
import { EntityAutocomplete } from './formWidgets/EntityAutocomplete';
import { ServiceAutocomplete } from './formWidgets/ServiceAutocomplete';
import { Definition } from "typescript-json-schema";

// TODO - provide a switch from dark / light mode with @hakit mode
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// const lightTheme = createTheme({
//   palette: {
//     mode: 'light',
//   },
// });

const FullScreenModal = styled(Modal)`
  left: 0;
  width: 95vw;
  margin-left: 2.5vw;
`;

const ActionBar = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
`;

const Form = withTheme(Theme);

const CUSTOM_OVERRIDE_FIELDS = [
  'entity',
  'service',
];

const uiSchema: UiSchema = {
  entity: {
    'ui:widget': 'entityAutocomplete',
  },
  service: {
    'ui:widget': 'serviceAutocomplete',
  },
  widgetName: {
    'ui:widget': 'hidden',
  },
  'ui:order': [
    // populated by the schema
  ]
};
const widgets: RegistryWidgetsType = {
  entityAutocomplete: EntityAutocomplete,
  serviceAutocomplete: ServiceAutocomplete,
};

interface WidgetEditorProps {
  open: boolean;
  id: string;
  type: 'new' | 'edit';
  widget: PageWidget;
  onClose: () => void;
  onSave: (widget: PageWidget, includeInAllLayouts?: boolean) => void;
}
export function WidgetEditor({
  open,
  id,
  widget,
  type,
  onClose,
  onSave,
}: WidgetEditorProps) {
  // this value is only used in edit mode
  const [includeInAllLayouts, setIncludeInAllLayouts] = useState<boolean>(true);
  const schema = useSchema(widget.name);
  const editorRef = useRef<AceEditor['editor']>(widget.props.cssStyles ?? '');
  const [formData, setFormData] = useState<Record<string, any>>({
    ...widget.props,
    widgetName: widget.name,
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const getWidget = useWidget();
  const widgetDefinition = getWidget(widget.name);

  const handleFormDataChange = useDebouncedCallback((e: any) => {
    setFormData(e.formData);
  }, 100);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const rendererProps = useMemo(() => {
    const customProps = {
      entity: formData?.entity ?? '',
      service: formData?.service ?? 'toggle',
    };
    const scaleAmount = widgetDefinition?.previewOptions?.scale ?? 1.5;
    const previewWidth = `${(widgetDefinition?.previewOptions?.width ?? DEFAULT_WIDGET_SIZE) * scaleAmount}px`;
    const previewHeight = `${(widgetDefinition?.previewOptions?.height ?? DEFAULT_WIDGET_SIZE) * scaleAmount}px`;
    const sizeWidth = widgetDefinition?.previewOptions?.noDefaultWidth ? 'auto' : previewWidth;
    const sizeHeight = widgetDefinition?.previewOptions?.noDefaultHeight ? 'auto' : previewHeight;
    const previewProps = {
      cssStyles: `
        width: ${sizeWidth} !important;
        height: ${sizeHeight} !important;
        max-width: 50vw;
        align-items: center;
        justify-content: center;
        ${formData.cssStyles ?? ''}
      `,
    };
    return {
      ...customProps,
      ...previewProps,
    };
  }, [formData, widgetDefinition?.previewOptions]);
  // TODO - set the default value of entity pickers to the first option
  // TODO - figure out why everything is so slow
  const [schemaProcessed, uiSchemaProcessed] = useMemo(() => {
    let clonedUISchema: UiSchema = { ...uiSchema };
    const clonedSchema: Definition = schema ? { ...schema } : {};
    if (clonedSchema?.properties) {
      if (widgetDefinition.uiSchema) {
        clonedUISchema = {
          ...clonedUISchema,
          ...widgetDefinition.uiSchema,
        };
      }
      // reset the order
      clonedUISchema['ui:order'] = widgetDefinition.uiSchema?.['ui:order'] ?? [];
      clonedSchema.properties.widgetName = {
        type: 'string',
        default: widget.name,
      };
      // if the entityPicker is disabled, don't bother adding it to the schema
      if (widgetDefinition.entityPicker !== false) {
        if (!clonedUISchema['ui:order'].includes('entity')) {
          clonedUISchema['ui:order'].push('entity');
        }
        clonedSchema.properties.entity = {
          type: 'string',
          default: rendererProps.entity,
        };
      }
      if (widgetDefinition.servicePicker !== false) {
        if (!clonedUISchema['ui:order'].includes('service')) {
          clonedUISchema['ui:order'].push('service');
        }
        clonedUISchema.service = {
          'ui:widget': 'serviceAutocomplete',
        };
        clonedSchema.properties.service = {
          type: 'string',
          default: rendererProps.service,
        };
      } else {
        delete clonedSchema.properties.service;
        clonedUISchema.service = {
          'ui:widget': 'hidden',
        };
      }
      // you must omit the custom fields pushed to the schema if they're defined as the properties already
      clonedUISchema['ui:order'].push(...Object.keys(clonedSchema?.properties ?? {}).filter(key => !CUSTOM_OVERRIDE_FIELDS.includes(key)).filter(key => !(clonedUISchema['ui:order'] ?? []).includes(key)));
    }
    return [clonedSchema, clonedUISchema];
  }, [schema, widgetDefinition.uiSchema, widgetDefinition.entityPicker, widgetDefinition.servicePicker, widget.name, rendererProps.entity, rendererProps.service]);

  // console.log('rendering with props', entity, service, previewProps)
  return (<FullScreenModal title={`${widget.name} configuration`} id={id} open={open} onClose={onClose}>
    <ThemeProvider theme={darkTheme}>
      <Row fullWidth fullHeight wrap="nowrap" gap="1rem">
        <Column fullWidth fullHeight justifyContent="flex-start" wrap="nowrap" style={{
          overflow: 'auto',
          padding: '1rem 0'
        }}>
          <Tabs variant="fullWidth" value={selectedTab} onChange={handleChange}>
            <Tab label="Options" />
            <Tab label="Theme" />
          </Tabs>
          <TabPanel value={selectedTab} index={3}>
            <Column fullWidth justifyContent="flex-start" alignItems="flex-start" wrap="nowrap" gap="1rem" style={{
              marginTop: 24,
            }}>
              {type === 'new' && <FormControlLabel checked={includeInAllLayouts} control={<Switch defaultChecked />} label="Include to all layouts" onChange={(_event, checked) => {
                setIncludeInAllLayouts(checked);
              }} />}
            </Column>
          </TabPanel>
          <TabPanel value={selectedTab} index={0}>
            {schema && (uiSchemaProcessed['ui:order'] ?? []).length > 0 && <Form
              formContext={{ formData }}
              widgets={widgets}
              uiSchema={uiSchemaProcessed}
              formData={formData}
              onChange={handleFormDataChange}
              schema={schemaProcessed}
              validator={validator}>
              {/* removes submit buttons */}
              <></>
            </Form>}
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <AceEditor
              mode="scss"
              width="100%"
              height="350px"
              theme="dracula"
              onLoad={(editor) => {
                editorRef.current = editor as AceEditor['editor'];
                editorRef.current.setValue(widget.props.cssStyles ?? '');
              }}
              setOptions={{
                useWorker: false
              }}
              onChange={(val) => {
                setFormData(formData => ({
                  ...formData,
                  cssStyles: val
                }));
              }}
            />
          </TabPanel>
        </Column>
        <Column fullWidth fullHeight justifyContent="flex-start" style={{
          padding: '2rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '0.5rem'
        }}>
          {widgetDefinition?.renderer({
            ...rendererProps,
            ...formData
          }, widget)}
        </Column>
      </Row>
      <ActionBar>
        <Tooltip title="Save & Close" placement="left">
          <FabCard cssStyles={`
            button {
              background-color: var(--ha-A400);
              color: var(--ha-A400-contrast);
            }
          `} onClick={() => {
            // TODO - validate form is valid
            // TODO - check service and entity are populating properly
            onSave({
              ...widget,
              props: {
                ...widget.props,
                ...formData,
              },
            }, type === 'new' ? includeInAllLayouts : false);
          }} size={48} icon="mdi:content-save-outline" />
        </Tooltip>
      </ActionBar>
    </ThemeProvider>
  </FullScreenModal>);
}
