import { Modal } from '@hakit/components';
import { PageWidget } from '@client/store';

interface WidgetEditorProps {
  open: boolean;
  id: string;
  widget: PageWidget;
  onClose: () => void;
  onSave: (widget: PageWidget) => void;
}
export function WidgetEditor({
  open,
  id,
  widget,
  onClose,
  onSave,
}: WidgetEditorProps) {
  return (<Modal id={id} open={open} onClose={onClose}>
    {JSON.stringify(widget, null, 2)}
  </Modal>);
}
