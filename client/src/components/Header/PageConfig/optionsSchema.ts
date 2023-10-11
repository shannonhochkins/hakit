import { StrictRJSFSchema } from "@rjsf/utils";
export default ({
  minMaxWidth,
  maxMaxWidth
}: {
  minMaxWidth: number;
  maxMaxWidth: number;
}): StrictRJSFSchema => ({
  "type": "object",
  "properties": {
    "compactType": {
      "title": "Compaction Type",
      "description": "Will change how the cards react to space in the grid.",
      "type": "string",
      "enum": [
        "vertical",
        "horizontal",
        "off"
      ]
    },
    "preventCollision": {
      "title": "Prevent Collision",
      "description": "Prevent collision option, will prevent collisions on items so they won't change position when other items are dragged around.",
      "type": "boolean"
    },
    "allowOverlap": {
      "title": "Allow Overlap",
      "description": "Allow overlap option, will allow items to overlap each other.",
      "type": "boolean"
    },
    "icon": {
      "title": "Icon",
      "description": "Icon option, will set the icon for the page.",
      "type": "string"
    },
    "name": {
      "title": "Name",
      "description": "Name option, will set the name for the page.",
      "type": "string"
    },
    "maxWidth": {
      "title": "Max Width",
      "description": `Cannot fall below ${minMaxWidth}, this will set the max width for the page before the "next" breakpoint takes over.`,
      "type": "number",
      "minimum": minMaxWidth,
      "maximum": maxMaxWidth,
    },
    "containerPadding": {
      "title": "Container Padding",
      "description": "Container padding option, will set the padding inside the container.",
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": [
        {
          "type": "number",
          "title": "Padding Y",
          "description": "Padding on the top and bottom of the container."
        },
        {
          "type": "number",
          "title": "Padding X",
          "description": "Padding on the left and right of the container."
        }
      ],
      "default": [10, 10],
      "additionalItems": false
    },
    "margin": {
      "title": "Item Margin",
      "description": "Margin option, will set the margin between the items.",
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": [
        {
          "type": "number",
          "title": "Margin Y",
          "description": "Margin on the top and bottom of the items."
        },
        {
          "type": "number",
          "title": "Margin X",
          "description": "Margin on the left and right of the items."
        }
      ],
      "default": [10, 10],
      "additionalItems": false
    }
  },
});

