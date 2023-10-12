// these files are automatically generated, do not edit manually
export default {
  "type": "object",
  "properties": {
    "title": {
      "description": "the title of the group",
      "type": "string"
    },
    "alignItems": {
      "description": "standard flex css properties for align-items,",
      "default": "center",
      "enum": [
        "-moz-initial",
        "baseline",
        "center",
        "end",
        "flex-end",
        "flex-start",
        "inherit",
        "initial",
        "normal",
        "revert",
        "revert-layer",
        "self-end",
        "self-start",
        "start",
        "stretch",
        "unset"
      ],
      "type": "string"
    },
    "justifyContent": {
      "description": "standard flex css properties for justify-content,",
      "default": "center",
      "enum": [
        "-moz-initial",
        "center",
        "end",
        "flex-end",
        "flex-start",
        "inherit",
        "initial",
        "left",
        "normal",
        "revert",
        "revert-layer",
        "right",
        "space-around",
        "space-between",
        "space-evenly",
        "start",
        "stretch",
        "unset"
      ],
      "type": "string"
    },
    "gap": {
      "description": "standard css gap property values,",
      "default": "0.5rem",
      "type": "string"
    },
    "layout": {
      "description": "the layout of the group, either column or row,",
      "default": "row",
      "enum": [
        "column",
        "row"
      ],
      "type": "string"
    },
    "collapsed": {
      "description": "should the group be collapsed by default",
      "default": false,
      "type": "boolean"
    }
  },
  "required": [
    "title"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "/GroupCard/index.tsx"
};
