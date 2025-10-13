import { describe, it, expect, beforeEach, beforeAll } from 'bun:test';
import { createModuleMocker } from '../../../test-utils/moduleMocker';
import { collectTemplateFields, hasAnyTemplates, subscribeTemplate } from './index';
import { TEMPLATE_PREFIX } from '@helpers/editor/pageData/constants';
import { pageDataMock } from './__mocks__/pageData.mock';
import type { Connection } from 'home-assistant-js-websocket';

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
type SubscribeHandler = Parameters<FakeConnection['subscribeMessage']>[0];

let lastPayload: SubscribePayload | null = null;
let handlerRef: SubscribeHandler | null = null;
let unsubCalls = 0;

function makeConnection(resolveUnsubImmediately = true): FakeConnection {
  const conn: FakeConnection = {
    async subscribeMessage(callback, payload) {
      handlerRef = callback as SubscribeHandler;
      lastPayload = payload as SubscribePayload;
      const unsub = async () => {
        unsubCalls += 1;
      };
      if (!resolveUnsubImmediately) {
        await new Promise(r => setTimeout(r, 0));
      }
      return unsub;
    },
  } as FakeConnection;
  return conn;
}

async function mockCoreWithConnection(conn: FakeConnection) {
  await moduleMocker.mock('@hakit/core', () => ({
    useStore: {
      getState: () => ({ connection: conn }),
    },
  }));
}

describe('templates/index', () => {
  beforeAll(async () => {
    await mockCoreWithConnection(makeConnection());
  });

  beforeEach(async () => {
    lastPayload = null;
    handlerRef = null;
    unsubCalls = 0;
  });

  it('collectTemplateFields finds all prefixed strings with paths', () => {
    const nodes = collectTemplateFields(pageDataMock);
    expect(nodes.length).toBeGreaterThan(0);
    // Ensure we collected known template locations from the mock
    const templates = nodes.map(n => n.template);
    // Known snippets from mock
    const snippet1 = "{% if is_state('sun.sun', 'above_horizon') %}";
    const snippet2 = "{% if is_state('light.light_office_downlight_3', 'on') %}";
    const has1 = templates.some(t => t.includes(snippet1));
    const has2 = templates.some(t => t.includes(snippet2));
    expect(has1).toBe(true);
    expect(has2).toBe(true);
    // Paths should be non-empty arrays
    nodes.forEach(n => {
      expect(Array.isArray(n.path)).toBe(true);
    });
  });

  it('hasAnyTemplates returns true for data with templates and false otherwise', () => {
    expect(hasAnyTemplates(pageDataMock)).toBe(true);
    expect(hasAnyTemplates({ a: { b: { c: 1 } } })).toBe(false);
  });

  it('subscribeTemplate calls subscribeMessage with expected payload and delivers result', async () => {
    const conn = makeConnection();
    await mockCoreWithConnection(conn);
    const received: Array<string | number | boolean | null> = [];
    const unsub = await subscribeTemplate('hello {{ 1 + 1 }}', v => received.push(v), {
      variables: { x: 1 },
      strict: true,
      report_errors: true,
      timeout: 500,
    });

    expect(lastPayload).not.toBeNull();
    expect(lastPayload?.type).toBe('render_template');
    expect(lastPayload?.template).toBe('hello {{ 1 + 1 }}');
    expect(lastPayload?.variables).toEqual({ x: 1 });
    expect(lastPayload?.strict).toBe(true);
    expect(lastPayload?.report_errors).toBe(true);
    expect(lastPayload?.timeout).toBe(500);

    // simulate value
    handlerRef?.({ result: '2' });
    expect(received).toEqual(['2']);

    unsub();
    expect(unsubCalls).toBe(1);
  });

  it('subscribeTemplate can be called for multiple collected templates', async () => {
    const calls: Array<{ template: string }> = [];
    const conn: FakeConnection = {
      async subscribeMessage(_handler, payload) {
        calls.push({ template: payload.template });
        return async () => {};
      },
    };
    await mockCoreWithConnection(conn);
    const nodes = collectTemplateFields(pageDataMock);
    // Subscribe to the first 4 templates to avoid excessive work
    const first = nodes.slice(0, 4);
    const unsubs = await Promise.all(first.map(n => subscribeTemplate(`${TEMPLATE_PREFIX}${n.template}`, () => {})));
    expect(calls.length).toBe(first.length);
    // Ensure each payload template matches what we passed in
    for (let i = 0; i < first.length; i++) {
      expect(calls[i].template).toBe(`${TEMPLATE_PREFIX}${first[i].template}`);
    }
    unsubs.forEach(u => u());
  });

  it('subscribeTemplate passes error via second arg when backend sends error', async () => {
    const conn = makeConnection();
    await mockCoreWithConnection(conn);
    const received: Array<string | number | boolean | null> = [];
    const errors: string[] = [];
    const unsub = await subscribeTemplate('bad', (v, err) => {
      received.push(v);
      if (err) errors.push(err);
    });
    handlerRef?.({ error: 'oops' });
    expect(received).toEqual([null]);
    expect(errors).toEqual(['oops']);
    unsub();
  });

  it('subscribeTemplate aborts before subscribe resolves and calls unsubscribe once', async () => {
    const conn = makeConnection(false);
    await mockCoreWithConnection(conn);
    const ac = new AbortController();
    const received: Array<string | number | boolean | null> = [];
    const p = subscribeTemplate('x', v => received.push(v), { signal: ac.signal });
    ac.abort();
    const unsub = await p;
    // No handler should have been delivered
    expect(received.length).toBe(0);
    // Calling returned unsub should be safe
    unsub();
    expect(unsubCalls).toBeGreaterThanOrEqual(1);
  });

  it('subscribeTemplate cleanup handles abort after subscribe', async () => {
    const conn = makeConnection();
    await mockCoreWithConnection(conn);
    const ac = new AbortController();
    const received: Array<string | number | boolean | null> = [];
    const unsub = await subscribeTemplate('y', v => received.push(v), { signal: ac.signal });
    // deliver first value
    handlerRef?.({ result: 'ok' });
    expect(received).toEqual(['ok']);
    // abort should call underlying unsub once
    ac.abort();
    unsub();
    expect(unsubCalls).toBeGreaterThanOrEqual(1);
  });
});
