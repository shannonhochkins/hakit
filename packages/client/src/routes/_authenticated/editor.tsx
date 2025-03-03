import { HassConnect } from '@hakit/core';
import { createFileRoute } from '@tanstack/react-router';
import Page from '../../lib/editor/puck/Page';
import { useLocalStorage } from '@editor/hooks/useLocalStorage';
import { Modal } from '@editor/puck/EditorComponents/Modal';
import { useRef } from 'react';
// import { ColourTesting } from './puck/ColourTesting';


export const Route = createFileRoute('/_authenticated/editor')({
  component: Editor,
})

function Editor() {
  const hassUrlRef = useRef<string | null>(null);
  const [hassUrl, setHassUrl] = useLocalStorage<string | null>('hassUrl', import.meta.env.VITE_HA_URL);
  const [hassToken] = useLocalStorage<string | undefined>('hassToken', import.meta.env.VITE_HA_TOKEN);
  if (!hassUrl) {
    return <Modal open title="Home Assistant URL" onClose={() => {
      // do nothing, the value provided below will automatically close the modal when the hassUrl is provided
    }}>
      <p>Enter the URL of your Home Assistant instance</p>
      <input type="text" placeholder="Enter your Home Assistant URL" onChange={e => hassUrlRef.current = e.target.value} />
      <button type="button" onClick={() => {
        if (hassUrlRef.current) {
          setHassUrl(hassUrlRef.current);
        }
      }}>OKAY</button>

    </Modal>
  }
  return <HassConnect hassUrl={hassUrl} hassToken={hassToken}>
    {/* <ColourTesting /> */}
    <Page />
  </HassConnect>;
}