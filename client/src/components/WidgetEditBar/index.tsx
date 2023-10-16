import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { PageWidget, useHakitStore } from '@client/store';
import { FabCard, Row, Modal, Column } from '@hakit/components';
import { WidgetEditor } from '@client/components/WidgetEditor';
import { Menu, MenuItem, FormControl, Switch, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSaveConfiguration } from '@client/hooks';
import { findWidgetInPage, findWidgetInPageAndUpdate, removeWidgetFromPage } from '@client/utils/layout-helpers.js';

interface WidgetEditBarProps {
  widget: PageWidget;
}

const Dialog = styled(Modal)`
  top: 30%;
  height: auto;
`;

const ContextMenu = styled(FabCard)`
  position: absolute;
  top: 0;
  button {
    background-color: transparent;
  }
  right: 0;
  z-index: 3;
`;

export function WidgetEditBar({ widget }: WidgetEditBarProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pages = useHakitStore(store => store.view?.pages ?? []);
  const setPages = useHakitStore(store => store.setPages);
  const currentPageId = useHakitStore(store => store.currentPageId);
  const [editWidget, setEditWidget] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [deleteFromAllPages, setDeleteFromAllPages] = useState(true);
  const save = useSaveConfiguration();
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  async function deleteWidget() {
    const newPages = pages.map(page => {
      if (!deleteFromAllPages) {
        if (page.id === currentPageId) {
          return removeWidgetFromPage(widget.uid, page);
        }
        return page;
      }
      return removeWidgetFromPage(widget.uid, page);
    });
    setPages(newPages);
    await save();
  }

  async function updateWidget(newWidget: PageWidget) {
    // now update the pages with the current widget id
    const newPages = pages.map(page => {
      return findWidgetInPageAndUpdate(widget.uid, page, newWidget);
    });
    setPages(newPages);
    await save();
  }

  async function pinWidget(currentStatic?: boolean) {
    // now update the pages with the current widget id
    const newPages = pages.map(page => {
      const matchedWidget = findWidgetInPage(widget.uid, page);
      if (matchedWidget) {
        const isStatic = typeof currentStatic === 'boolean' ? !currentStatic : false;
        matchedWidget.layout = {
          ...matchedWidget.layout,
          static: isStatic,
        }
      }
      return {
        ...page,
      };
    });
    setPages([...newPages]);
    await save();
  }

  return (<>
    <ContextMenu layoutId={`${widget.props.id}-menu`} icon="mdi:dots-vertical" size={30} onClick={(entity, event) => {
      setAnchorEl(event.currentTarget);
    }} />
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem onClick={() => {
        setEditWidget(true);
        handleClose();
      }}><Icon icon="mdi:edit" /> Edit</MenuItem>
      <MenuItem onClick={() => {
        setOpenDeleteConfirmation(true)
        handleClose();
      }}><Icon icon="mdi:trash" /> Delete</MenuItem>
      <MenuItem onClick={() => {
        pinWidget(widget.layout.static)
        handleClose();
      }}><Icon icon={widget.layout.static ? 'mdi:pin-off' : 'mdi:pin'} /> {widget.layout.static  ? 'Unpin' : 'Pin'}</MenuItem>
    </Menu>
    <Dialog description="Are you sure you want to delete this widget?" id={`${widget.props.id}-delete`} title={`Delete ${widget.name}`} open={openDeleteConfirmation} onClose={() => {
      setOpenDeleteConfirmation(false);
    }} >
      <Column fullWidth alignItems="flex-start">
        <FormControl>
          <label>{deleteFromAllPages ? 'Delete from all layouts' : 'Delete from current layout only'}</label>
          <Switch checked={deleteFromAllPages} onChange={(_e, checked) => setDeleteFromAllPages(checked)} />
        </FormControl>
        <Row gap="0.5rem" fullWidth justifyContent="flex-end" style={{
          marginTop: '1rem'
        }}>
          <Button color="error" onClick={() => {
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
