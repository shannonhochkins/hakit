import { Modal, Row, Column, FabCard, Tooltip } from '@hakit/components';
import { useEntity } from '@hakit/core';
import { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { PageWidget } from '@client/store';
import { useSchema, useWidget } from '@client/hooks';
import validator from '@rjsf/validator-ajv8';
import { withTheme } from '@rjsf/core';
import { Switch, FormControlLabel } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Theme } from '@rjsf/mui';
import { EntityAutocompleteWidget } from './EntityAutocompleteWidget';
import { ServiceAutocomplete } from './ServiceAutocompleteWidget';
import { HassEntity } from 'home-assistant-js-websocket';
import AceEditor from 'react-ace';
import { DEFAULT_WIDGET_WIDTH } from '@client/store/pages';
import { TabPanel, Tab, Tabs } from '@client/components/Shared/Tabs';
import 'ace-builds/src-noconflict/mode-scss';
import 'ace-builds/src-noconflict/theme-dracula';

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
  const [formData, setFormData] = useState(widget.props);
  const [selectedTab, setSelectedTab] = useState(0);
  const actualEntity = useEntity(widget.props?.entity ?? 'unknown', {
    returnNullIfNotFound: true,
  });
  const [entity, setEntity] = useState<HassEntity | null>(actualEntity ?? null);
  const [service, setService] = useState<string | null>(widget.props?.service ?? 'toggle');
  const getWidget = useWidget();
  const widgetDefinition = getWidget(widget.name);

  const handleFormDataChange = (e: any) => {
    setFormData(e.formData);
  };
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  const customProps = {
    entity: entity?.entity_id,
    service: service ?? undefined,
  };
  const previewProps = {
    cssStyles: `
      width: ${widgetDefinition?.previewOptions?.width ?? DEFAULT_WIDGET_WIDTH}px !important;
      max-width: 95%;
      ${formData.cssStyles ?? ''}
    `,
  };
  const rendererProps = {
    ...formData,
    ...customProps,
    ...previewProps,
  };
  // console.log('rendering with props', entity, service, previewProps)
  return (<FullScreenModal title={`${widget.name} configuration`} id={id} open={open} onClose={onClose}>
    <ThemeProvider theme={darkTheme}>
      <Row fullWidth fullHeight wrap="nowrap">
        <Column fullWidth fullHeight justifyContent="flex-start" wrap="nowrap" style={{
          overflow: 'auto',
          padding: '1rem 0'
        }}>
          <Tabs variant="fullWidth" value={selectedTab} onChange={handleChange}>
            <Tab label="Options" />
            <Tab label="Display" />
            <Tab label="Theme" />
          </Tabs>
          <TabPanel value={selectedTab} index={0}>
            <Column fullWidth justifyContent="flex-start" alignItems="flex-start" wrap="nowrap" gap="1rem" style={{
              marginTop: 24,
            }}>
              <EntityAutocompleteWidget widgetDefinition={widgetDefinition} value={entity?.entity_id ?? null} onChange={entity => {
                setEntity(entity);
              }} />
              <ServiceAutocomplete disabled={entity === null} entity={entity} value={service} onChange={(service) => {
                setService(service);
              }} />
              {type === 'new' && <FormControlLabel checked={includeInAllLayouts} control={<Switch defaultChecked />} label="Include to all layouts" onChange={(_event, checked) => {
                setIncludeInAllLayouts(checked);
              }} />}
            </Column>
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            {schema && <Form formData={formData} onChange={handleFormDataChange} schema={schema} validator={validator}>
              {/* removes submit buttons */}
              <></>
            </Form>}
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
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
          padding: '2rem 0'
        }}>
          {widgetDefinition?.renderer(rendererProps, widget)}
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
            onSave({
              ...widget,
              props: {
                ...widget.props,
                ...formData,
                ...customProps,
              }
            }, type === 'new' ? includeInAllLayouts : false);
          }} size={48} icon="mdi:content-save-outline" />
        </Tooltip>
      </ActionBar>
    </ThemeProvider>
  </FullScreenModal>);
}
