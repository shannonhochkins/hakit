// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "title": {
      "description": "An optional override for the title",
      "type": "string"
    },
    "description": {
      "description": "an optional description to add to the card",
      "type": "string"
    },
    "icon": {
      "description": "optional override to replace the icon that appears in the card",
      "type": "string"
    },
    "sliderIcon": {
      "description": "optional override for the slider icon",
      "type": "string"
    },
    "sliderTextActive": {
      "description": "override for the slider text when the state is active",
      "type": "string"
    },
    "sliderTextInactive": {
      "description": "override for the slider text when the state is inactive",
      "type": "string"
    },
    "activeStateDuration": {
      "description": "how much time in milliseconds must pass before the active state reverts to it's default state",
      "default": 5000,
      "type": "number"
    },
    "hideArrow": {
      "description": "display the arrow icon in the slider",
      "default": false,
      "type": "boolean"
    }
  },
  "required": [],
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/TriggerCard/index.tsx"
};
