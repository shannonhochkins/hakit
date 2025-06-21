import { useLocalStorage } from '@lib/hooks/useLocalStorage';
import { Modal } from '@lib/page/shared/Modal';
import { useRef } from 'react';

export function HassModal() {
  const [, setHassUrl] = useLocalStorage<string | null>('hassUrl');
  const hassUrlRef = useRef<string | null>(null);

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