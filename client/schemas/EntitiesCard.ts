// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "entities": {
      "description": "The names of your entities",
      "type": "array",
      "items": {
        "$ref": "#/definitions/EntityItem"
      }
    },
    "includeLastUpdated": {
      "description": "include the last updated time, will apply to every row unless specified on an individual EntityItem",
      "default": false,
      "type": "boolean"
    }
  },
  "definitions": {
    "EntityItem": {
      "type": "object",
      "properties": {
        "entity": {
          "description": "The name of the entity to render",
          "type": "string"
        },
        "icon": {
          "description": "the icon name to use, defaults to entity_icon",
          "type": "string"
        },
        "name": {
          "description": "the name of the entity, defaults to friendly_name",
          "type": "string"
        },
        "includeLastUpdated": {
          "description": "include last updated time",
          "default": false,
          "type": "boolean"
        }
      },
      "required": [
        "entity"
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/EntitiesCard/index.tsx"
};
