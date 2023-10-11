// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "icon": {
      "description": "override the icon displayed before the title",
      "type": "string"
    },
    "temperatureSuffix": {
      "description": "override the temperature suffix that's pulled from the entity, will retrieve the temperature_unit from entity by default\""
    },
    "includeForecast": {
      "description": "include the forecast",
      "default": true,
      "type": "boolean"
    },
    "includeCurrent": {
      "description": "include the current forecast row,",
      "default": true,
      "type": "boolean"
    },
    "includeTime": {
      "description": "include time value under day name",
      "default": true,
      "type": "boolean"
    },
    "apparentTemperatureAttribute": {
      "description": "property on the weather entity attributes that returns the \"feels like\" temperature or \"apparent temperature\"",
      "default": "apparent_temperature",
      "type": "string"
    }
  },
  "required": [],
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/WeatherCard/index.tsx"
};
