// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "hideState": {
      "description": "hide the state of the climate entity",
      "type": "boolean"
    },
    "hvacModes": {
      "description": "provide a list of hvacModes you want to support/display in the UI, will use all by default",
      "type": "array",
      "items": {
        "enum": [
          "auto",
          "cool",
          "dry",
          "fan_only",
          "heat",
          "heat_cool",
          "off"
        ],
        "type": "string"
      }
    },
    "hideCurrentTemperature": {
      "description": "hide the current temperature",
      "type": "boolean"
    },
    "hideFanMode": {
      "description": "hide the fan mode fab",
      "type": "boolean"
    },
    "hideUpdated": {
      "description": "hide the last updated time",
      "type": "boolean"
    }
  },
  "required": [],
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/ClimateCard/index.tsx"
};
