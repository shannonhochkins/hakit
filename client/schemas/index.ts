// these files are automatically generated, do not edit manually
import * as TJS from "typescript-json-schema";
const loadSchema = async (name: string): Promise<TJS.Definition> => {
  switch (name) {
    case 'ButtonCard': {
      const imported = await import('./ButtonCard');
      return imported.default as TJS.Definition;
    }case 'ClimateCard': {
      const imported = await import('./ClimateCard');
      return imported.default as TJS.Definition;
    }case 'EntitiesCard': {
      const imported = await import('./EntitiesCard');
      return imported.default as TJS.Definition;
    }case 'FabCard': {
      const imported = await import('./FabCard');
      return imported.default as TJS.Definition;
    }case 'GarbageCollectionCard': {
      const imported = await import('./GarbageCollectionCard');
      return imported.default as TJS.Definition;
    }case 'SensorCard': {
      const imported = await import('./SensorCard');
      return imported.default as TJS.Definition;
    }case 'TileCardHorizontal': {
      const imported = await import('./TileCardHorizontal');
      return imported.default as TJS.Definition;
    }case 'TileCardVertical': {
      const imported = await import('./TileCardVertical');
      return imported.default as TJS.Definition;
    }case 'TimeCard': {
      const imported = await import('./TimeCard');
      return imported.default as TJS.Definition;
    }case 'TriggerCard': {
      const imported = await import('./TriggerCard');
      return imported.default as TJS.Definition;
    }case 'WeatherCard': {
      const imported = await import('./WeatherCard');
      return imported.default as TJS.Definition;
    }
    default:
      throw new Error(`Unknown widget: ${name}`);
  }
};
export default loadSchema;
