import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { PageConfig, PageWidget, useHakitStore } from '@client/store';
import { FabCard, Row, Tooltip, Modal, Column } from '@hakit/components';
import { WidgetEditor } from '@client/components/WidgetEditor';
import { FormControlGroup, Switch, Button } from '@client/components/Shared';
import { Icon } from '@iconify/react';
import { useSaveConfiguration } from '@client/hooks';
import { CONFIGURATION_FILENAME } from '@client/store/constants';

const InnerBar = styled(Row)`

`;

const StyledEditBar = styled.div`
  position: absolute;
  inset: 0;
  bottom: 0;
  z-index: 1;
  background-color: transparent;
  transition: background-color var(--ha-transition-duration) var(--ha-easing);
  overflow: hidden;
  cursor: move;
  .inner-bar {
    transition: transform var(--ha-transition-duration) var(--ha-easing);
    transform: translate3d(0, 100%, 0);
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.5rem;
  }
  &:hover {
    background-color: rgba(0,0,0,0.4);
    .inner-bar {
      transform: translate3d(0, 0, 0);
    }
  }
`;

interface WidgetEditBarProps {
  widget: PageWidget;
}

const Dialog = styled(Modal)`
  top: 30%;
  height: auto;
`;

export function WidgetEditBar({ widget }: WidgetEditBarProps): ReactElement {
  const pages = useHakitStore(store => store.pages);
  const setPages = useHakitStore(store => store.setPages);
  const currentPageId = useHakitStore(store => store.currentPageId);
  const [editWidget, setEditWidget] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [deleteFromAllLayouts, setDeleteFromAllLayouts] = useState(true);
  const saveConfiguration = useSaveConfiguration();
  const saveConfig = (pages: PageConfig[]) => {
    void(async () => {
      await saveConfiguration(pages);
      setPages(pages);
    })();
  };

  function deleteWidget() {
    if (!deleteFromAllLayouts) {
      const page = pages.find(page => page.id === currentPageId);
      // TODO - raise error if the page isn't found
      if (!page) return null;
      const widgetIndex = page.widgets.findIndex(w => w.uid === widget.uid);
      if (widgetIndex === -1) return null;
      page.widgets.splice(widgetIndex, 1);
      saveConfig([...pages]);
    } else {
      const newPages = pages.map(page => {
        const newWidgets = page.widgets.filter(w => w.uid !== widget.uid);
        return {
          ...page,
          widgets: newWidgets,
        };
      });
      saveConfig([...newPages]);
    }
  }

  function updateWidget(newWidget: PageWidget) {
    // now update the pages with the current widget id
    const newPages = pages.map(page => {
      const newWidgets = page.widgets.map(w => {
        if (w.uid === widget.uid) {
          return newWidget;
        }
        return w;
      });
      return {
        ...page,
        widgets: newWidgets,
      };
    });
    saveConfig([...newPages]);
  }

  return (<>
    <StyledEditBar className="edit-bar">
      <InnerBar className="inner-bar" fullWidth gap="0.5rem">
        <Tooltip title="Edit" placement="bottom">
          <FabCard layoutId={`${widget.props.id}-editor`} icon="mdi:edit" size={30} onClick={() => setEditWidget(true)} />
        </Tooltip>
        <Tooltip title="Delete" placement="bottom">
          <FabCard layoutId={`${widget.props.id}-delete`} icon="mdi:trash" size={30} onClick={() => setOpenDeleteConfirmation(true)} />
        </Tooltip>
      </InnerBar>
    </StyledEditBar>
    <Dialog description="Are you sure you want to delete this widget?" id={`${widget.props.id}-delete`} title={`Delete ${widget.name}`} open={openDeleteConfirmation} onClose={() => {
      setOpenDeleteConfirmation(false);
    }} >
      <Column fullWidth alignItems="flex-start">
        <FormControlGroup reverse label={deleteFromAllLayouts ? 'Delete from all layouts' : 'Delete from current layout only'}>
          <Switch checked={deleteFromAllLayouts} onChange={value => setDeleteFromAllLayouts(value)} />
        </FormControlGroup>
        <Row gap="0.5rem" fullWidth justifyContent="flex-end" style={{
          marginTop: '1rem'
        }}>
          <Button danger onClick={() => {
            deleteWidget();
          }}>
            <Icon icon="mdi:trash" />
            DELETE
          </Button>
        </Row>
      </Column>
    </Dialog>
    <WidgetEditor type="edit" widget={widget} id={`${widget.props.id}-editor`} open={editWidget} onClose={() => {
      setEditWidget(false);
    }} onSave={(data) => {
      setEditWidget(false);
      updateWidget(data);
    }} />
  </>);
}
