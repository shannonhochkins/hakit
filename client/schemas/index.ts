// these files are automatically generated, do not edit manually
import * as TJS from "typescript-json-schema";
const loadSchema = async (name: string): Promise<TJS.Definition> => {
  switch (name) {
    case 'ButtonCard': {
      const imported = await import('./ButtonCard');
      return imported.default as TJS.Definition;
    }case 'SensorCard': {
      const imported = await import('./SensorCard');
      return imported.default as TJS.Definition;
    }
    default:
      throw new Error(`Unknown widget: ${name}`);
  }
};
export default loadSchema;
