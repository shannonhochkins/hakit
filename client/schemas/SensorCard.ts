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
    "description": {
      "description": "an optional description to add to the card",
      "type": [
        "string",
        "null"
      ]
    },
    "icon": {
      "description": "optional override to replace the icon that appears in the card",
      "type": "string"
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
    "Iterable<React.ReactNode>": {
      "type": "object"
    },
    "HistoryOptions": {
      "type": "object",
      "properties": {
        "hoursToShow": {
          "description": "the number of hours to show",
          "minimum": 0,
          "default": 24,
          "type": "integer"
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
          "type": "object",
          "properties": {
            "min": {
              "description": "The minimum value to show",
              "minimum": 0,
              "type": "integer"
            },
            "max": {
              "description": "The maximum value to show",
              "minimum": 0,
              "type": "integer"
            }
          }
        }
      }
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/SensorCard/index.tsx"
};
