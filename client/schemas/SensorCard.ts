// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "title": {
      "description": "An optional override for the title",
      "type": [
        "string",
        "null"
      ]
    },
    "icon": {
      "description": "optional override to replace the icon that appears in the card",
      "type": "string"
    },
    "description": {
      "description": "an optional description to add to the card",
      "type": [
        "string",
        "null"
      ]
    },
    "unit": {
      "description": "override the unit displayed alongside the state",
      "type": [
        "string",
        "null"
      ]
    },
    "historyOptions": {
      "description": "options to pass to the history request",
      "$ref": "#/definitions/HistoryOptions"
    }
  },
  "required": [],
  "definitions": {
    "HistoryOptions": {
      "type": "object",
      "properties": {
        "hoursToShow": {
          "description": "the number of hours to show",
          "default": 24,
          "type": "number"
        },
        "significantChangesOnly": {
          "description": "only show significant changes",
          "default": true,
          "type": "boolean"
        },
        "minimalResponse": {
          "description": "minimal response data",
          "default": true,
          "type": "boolean"
        },
        "limits": {
          "description": "data limits for coordinates",
          "type": "object",
          "properties": {
            "min": {
              "type": "number"
            },
            "max": {
              "type": "number"
            }
          }
        }
      }
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/SensorCard/index.tsx"
};
