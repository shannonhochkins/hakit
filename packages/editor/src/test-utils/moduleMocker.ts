import { afterAll, mock } from 'bun:test';

interface MockResult {
  clear: () => void;
}

export class ModuleMocker {
  private mocks: MockResult[] = [];

  async mock(modulePath: string, renderMocks: () => Record<string, unknown>) {
    let original: Record<string, unknown> = {};
    try {
      // Attempt to load the real module; if it doesn't exist (e.g. optional peer like 'leaflet'), ignore.
      original = { ...(await import(modulePath)) };
    } catch {
      // Non-existent module: keep original empty so we can still register the mock.
      original = {};
    }
    const mocks = renderMocks();
    const result = { ...original, ...mocks };
    mock.module(modulePath, () => result);
    this.mocks.push({
      clear: () => {
        mock.module(modulePath, () => original);
      },
    });
  }

  clear() {
    this.mocks.forEach(mockResult => mockResult.clear());
    this.mocks = [];
  }
}

export function createModuleMocker(): ModuleMocker {
  const moduleMocker = new ModuleMocker();
  afterAll(() => {
    moduleMocker.clear();
  });
  return moduleMocker;
}
