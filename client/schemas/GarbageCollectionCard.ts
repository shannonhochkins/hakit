// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "title": {
      "description": "The title of the card",
      "default": "Garbage Collection",
      "type": "string"
    },
    "description": {
      "description": "The description of the card",
      "type": "string"
    },
    "schedules": {
      "description": "the schedule(s) for your garbage collection",
      "type": "array",
      "items": {
        "$ref": "#/definitions/Schedule"
      }
    }
  },
  "required": [
    "schedules"
  ],
  "definitions": {
    "Schedule": {
      "type": "object",
      "properties": {
        "title": {
          "description": "optional title to appear in each schedule",
          "type": "string"
        },
        "day": {
          "$ref": "#/definitions/Day",
          "description": "on what day does your garbage get collected"
        },
        "weeks": {
          "description": "as there's (usually) 4 weeks in a month, provide a config for each week, if you only have your garbage collected once a month, on a tuesday, specify null for the weeks that aren't relevant",
          "type": "array",
          "items": [
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          ],
          "minItems": 4,
          "maxItems": 4
        },
        "frequency": {
          "description": "how often is your garbage collected",
          "enum": [
            "fortnightly",
            "monthly",
            "weekly"
          ],
          "type": "string"
        },
        "hideNextCollection": {
          "description": "hide the next collection time",
          "default": false,
          "type": "boolean"
        }
      },
      "required": [
        "day",
        "frequency",
        "weeks"
      ]
    },
    "Day": {
      "enum": [
        "Friday",
        "Monday",
        "Saturday",
        "Sunday",
        "Thursday",
        "Tuesday",
        "Wednesday"
      ],
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/GarbageCollectionCard/index.tsx"
};
