import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createModuleMocker } from '../test-utils/moduleMocker';
import { useResolvedJinjaTemplate } from './useResolvedJinjaTemplate';
import type { Connection } from 'home-assistant-js-websocket';
import { pageDataMock } from './__mocks__/templatePageData';

const moduleMocker = createModuleMocker();

type SubscribePayload = {
  type: 'render_template';
  template: string;
  variables?: Record<string, unknown>;
  strict?: boolean;
  report_errors?: boolean;
  timeout?: number;
};

type FakeConnection = Pick<Connection, 'subscribeMessage'>;

/**
 * Build a fake HA connection. It resolves template payloads deterministically based on content.
 * - payload.template including 'sun.sun' → delayed "It's daytime 🌞"
 * - payload.template including 'light.light_office_downlight_3' → "Light computed"
 * - otherwise → "OK"
 * Use throwOnFirstSubscribe to simulate subscribe error for the first call only.
 */
function makeConnection(opts?: { throwOnFirstSubscribe?: boolean; track?: { calls: number; unsubs: number } }): FakeConnection {
  let first = true;
  const counters = opts?.track ?? { calls: 0, unsubs: 0 };
  const conn: FakeConnection = {
    async subscribeMessage<Result>(onMsg: (r: Result) => void, payload: SubscribePayload) {
      counters.calls += 1;
      if (opts?.throwOnFirstSubscribe && first) {
        first = false;
        throw new Error('boom');
      }

      const deliver = () => {
        const tpl = payload.template;
        if (tpl.includes('sun.sun')) {
          onMsg({ result: "It's daytime 🌞" } as unknown as Result);
        } else if (tpl.includes('light.light_office_downlight_3')) {
          onMsg({ result: 'Light computed' } as unknown as Result);
        } else {
          onMsg({ result: 'OK' } as unknown as Result);
        }
      };

      // delay only the sun.sun delivery to exercise `refreshing` transitions
      if (payload.template.includes('sun.sun')) {
        setTimeout(deliver, 10);
      } else {
        deliver();
      }

      return async () => {
        counters.unsubs += 1;
      };
    },
  } as FakeConnection;
  return conn;
}

async function mockCoreWithConnection(conn: FakeConnection) {
  await moduleMocker.mock('@hakit/core', () => ({
    useHass: {
      getState: () => ({ connection: conn }),
    },
  }));
}

describe('useResolvedJinjaTemplate', () => {
  beforeAll(async () => {
    // default no-op connection; individual tests will remock
    await mockCoreWithConnection(makeConnection());
  });

  beforeEach(async () => {
    await mockCoreWithConnection(makeConnection());
  });

  it('returns input directly when there are no templates', async () => {
    const plain = { a: { b: 1 }, arr: [1, 2, 3] };
    const { result } = renderHook(() => useResolvedJinjaTemplate(plain));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(plain);
  });

  it('streams resolved template values into data and toggles loading', async () => {
    const track = { calls: 0, unsubs: 0 };
    await mockCoreWithConnection(makeConnection({ track }));

    // Provide a frozen copy to detect accidental mutation of the source
    const clone = structuredClone(pageDataMock);
    const { result } = renderHook(() => useResolvedJinjaTemplate(clone));

    // wait until the specific fields are updated
    await waitFor(() => {
      const data = result.current.data as typeof pageDataMock;
      const textXlg = (
        data.root.props.content[0].props.content[0].props.content[0].props.content[0].props.content[0].props.text as { $xlg: string }
      ).$xlg;
      expect(textXlg).toBe("It's daytime 🌞");
      const secondText = data.root.props.content[0].props.content[0].props.content[0].props.content[0].props.content[1].props
        .text as string;
      expect(secondText).toBe('Light computed');
      const idXlg = (data.root.props['@hakit/default-root'].id as { $xlg: string; $lg: string }).$xlg;
      const idLg = (data.root.props['@hakit/default-root'].id as { $xlg: string; $lg: string }).$lg;
      expect(idXlg).toBe('Light computed');
      expect(idLg).toBe('Light computed');
    });

    // ensure multiple subscriptions were created
    expect(track.calls).toBeGreaterThanOrEqual(3);
  });

  it('does not mutate the input object', async () => {
    await mockCoreWithConnection(makeConnection());
    const original = structuredClone(pageDataMock);
    const snapshot = JSON.stringify(original);
    const { result } = renderHook(() => useResolvedJinjaTemplate(original));

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    // Ensure the original object remains unchanged
    expect(JSON.stringify(original)).toBe(snapshot);
  });

  it('reload re-establishes subscriptions', async () => {
    const track = { calls: 0, unsubs: 0 };
    await mockCoreWithConnection(makeConnection({ track }));
    const { result } = renderHook(() => useResolvedJinjaTemplate(pageDataMock));

    await waitFor(() => expect(result.current.loading).toBe(false));
    const initialCalls = track.calls;

    act(() => result.current.reload());

    await waitFor(() => expect(track.calls).toBeGreaterThan(initialCalls));
  });

  it('sets error when subscribe fails', async () => {
    const track = { calls: 0, unsubs: 0 };
    await mockCoreWithConnection(makeConnection({ throwOnFirstSubscribe: true, track }));
    const { result } = renderHook(() => useResolvedJinjaTemplate(pageDataMock));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('boom');
    });
  });

  it('cleanup unsubscribes when unmounted', async () => {
    const track = { calls: 0, unsubs: 0 };
    await mockCoreWithConnection(makeConnection({ track }));
    const { result, unmount } = renderHook(() => useResolvedJinjaTemplate(pageDataMock));

    await waitFor(() => expect(result.current.loading).toBe(false));
    unmount();
    // Allow queued unsubs to flush
    await new Promise(r => setTimeout(r, 0));

    expect(track.unsubs).toBeGreaterThan(0);
    expect(track.unsubs).toBeLessThanOrEqual(track.calls);
  });
});
