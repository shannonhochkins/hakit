// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "title": {
      "description": "the title used for the tooltip and or modal that will expands, defaults to entity name or domain name",
      "type": "string"
    },
    "disabled": {
      "description": "disable the fab card, onClick will not fire",
      "type": "boolean"
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
    "size": {
      "description": "The size of the Fab, this applies to the width and height",
      "default": 48,
      "type": "number"
    },
    "noIcon": {
      "description": "will not show any icons",
      "type": "boolean"
    },
    "tooltipPlacement": {
      "description": "the tooltip placement",
      "default": "top",
      "enum": [
        "bottom",
        "left",
        "right",
        "top"
      ],
      "type": "string"
    },
    "preventPropagation": {
      "description": "passed to the ripple component to stop double scaling effect",
      "default": true,
      "type": "boolean"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/FabCard/index.tsx"
};
