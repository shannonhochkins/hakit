// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "layout": {
      "description": "the layout of the card",
      "default": "'card'",
      "enum": [
        "card",
        "slim"
      ],
      "type": "string"
    },
    "disabled": {
      "description": "disable the card manually if the internal disable functionality needs to be updated",
      "default": false,
      "type": "boolean"
    },
    "groupMembers": {
      "description": "if the entity supports grouping, you can provide the groupMembers as a list to join them together",
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^media_player..*$"
      }
    },
    "volumeLayout": {
      "description": "the layout of the volume elements",
      "default": "'slider'",
      "enum": [
        "buttons",
        "slider"
      ],
      "type": "string"
    },
    "hideMute": {
      "description": "hide the mute button",
      "default": false,
      "type": "boolean"
    },
    "hideAppName": {
      "description": "hide the app name eg YouTube",
      "default": false,
      "type": "boolean"
    },
    "hideEntityName": {
      "description": "hide the entity friendly name",
      "default": false,
      "type": "boolean"
    },
    "hideThumbnail": {
      "description": "hide the thumbnail element",
      "default": false,
      "type": "boolean"
    },
    "thumbnailSize": {
      "description": "the size of the thumbnail to show",
      "default": "3rem",
      "type": "string"
    },
    "showArtworkBackground": {
      "description": "show the artwork as the background of the card",
      "default": true,
      "type": "boolean"
    }
  },
  "required": [],
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/MediaPlayerCard/index.tsx"
};
