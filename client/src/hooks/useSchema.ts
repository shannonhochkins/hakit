import getSchema from '../../schemas';
import { useState, useEffect, useMemo } from 'react';
import * as TJS from "typescript-json-schema";

export function useSchema(name: string): TJS.Definition | null {
  const [schema, setSchema] = useState<TJS.Definition | null>(null);
  useEffect(() => {
    void(async () => {
      const schema = await getSchema(name);
      setSchema(schema);
    })();
  }, [name]);
  return useMemo(() => schema, [schema]);
}
