// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "title": {
      "description": "By default, the title is retrieved from the domain name, or you can specify a manual title",
      "type": [
        "null",
        "string"
      ]
    },
    "icon": {
      "description": "Optional icon param, this is automatically retrieved by the \"domain\" name if provided, or can be overwritten with a custom value",
      "type": [
        "null",
        "string"
      ]
    },
    "iconColor": [
      "string",
      "null"
    ],
    "description": {
      "description": "By default, the description is retrieved from the friendly name of the entity, or you can specify a manual description",
      "type": [
        "null",
        "string"
      ]
    },
    "hideState": {
      "description": "Hide the state value",
      "type": "boolean"
    },
    "hideLastUpdated": {
      "description": "Hide the last updated time",
      "type": "boolean"
    },
    "hideDetails": {
      "description": "This forces hideState, hideLastUpdated and will only show the entity name / description prop",
      "type": "boolean"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/TileCardHorizontal/index.tsx"
};
