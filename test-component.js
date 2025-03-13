import { jsx as _jsx } from "react/jsx-runtime";
const ALIGN_ITEMS = [{
  label: 'Center',
  value: 'center'
}, {
  label: 'Flex End',
  value: 'flex-end'
}, {
  label: 'Flex Start',
  value: 'flex-start'
}, {
  label: 'Stretch',
  value: 'stretch'
}];
const JUSTIFY_CONTENT = [{
  label: 'Center',
  value: 'center'
}, {
  label: 'End',
  value: 'end'
}, {
  label: 'Flex End',
  value: 'flex-end'
}, {
  label: 'Flex Start',
  value: 'flex-start'
}, {
  label: 'Start',
  value: 'start'
}, {
  label: 'Space Around',
  value: 'space-around'
}, {
  label: 'Space Between',
  value: 'space-between'
}, {
  label: 'Space Evenly',
  value: 'space-evenly'
}, {
  label: 'Stretch',
  value: 'stretch'
}];
const WRAP = [{
  label: 'No Wrap',
  value: 'nowrap'
}, {
  label: 'Wrap',
  value: 'wrap'
}, {
  label: 'Wrap Reverse',
  value: 'wrap-reverse'
}];
const DIRECTION = [{
  label: 'Row',
  value: 'row'
}, {
  label: 'Row Reverse',
  value: 'row-reverse'
}, {
  label: 'Column',
  value: 'column'
}, {
  label: 'Column Reverse',
  value: 'column-reverse'
}];
export default {
  version: '1.0.0',
  label: 'Layout',
  description: 'A layout component that arranges its children in a grid',
  category: 'Layout',
  fields: {
    options: {
      type: 'object',
      default: {},
      label: 'Layout Options',
      disableBreakpoints: true,
      collapsible: {
        open: false
      },
      description: 'Controls the layout of the container',
      objectFields: {
        direction: {
          type: 'radio',
          default: 'row',
          label: 'Direction',
          description: 'Controls if the children should be laid out horizontally or vertically',
          options: DIRECTION
        },
        alignItems: {
          type: 'select',
          default: 'flex-start',
          label: 'Align Items',
          description: 'Controls how children are distributed along the horizontal axis',
          options: ALIGN_ITEMS
        },
        justifyContent: {
          type: 'select',
          default: 'flex-start',
          label: 'Justify Content',
          description: 'Controls how items are aligned along the vertical axis',
          options: JUSTIFY_CONTENT
        },
        wrap: {
          type: 'select',
          label: 'Wrap',
          default: 'wrap',
          description: 'Controls whether the container allows its items to move onto multiple lines.',
          options: WRAP
        },
        gap: {
          type: 'number',
          label: 'Gap',
          default: 16,
          min: 0,
          description: 'Controls the space between items in pixels'
        },
        padding: {
          type: 'number',
          label: 'Padding',
          default: 0,
          description: 'Controls the padding of the container in pixels'
        },
        margin: {
          type: 'number',
          label: 'Margin',
          default: 0,
          description: 'Controls the margin of the container in pixels'
        }
      }
    }
  },
  inline: true,
  render: ({
    puck,
    options
  }) => {
    var _options$gap, _options$padding, _options$margin, _options$direction, _options$wrap, _options$justifyConte, _options$alignItems;
    const gap = (_options$gap = options.gap) !== null && _options$gap !== void 0 ? _options$gap : 0;
    const padding = (_options$padding = options.padding) !== null && _options$padding !== void 0 ? _options$padding : 0;
    const margin = (_options$margin = options.margin) !== null && _options$margin !== void 0 ? _options$margin : 0;
    return /*#__PURE__*/_jsx("div", {
      ref: puck.dragRef,
      style: {
        gap: `${gap}px`,
        flexDirection: (_options$direction = options.direction) !== null && _options$direction !== void 0 ? _options$direction : 'row',
        flexWrap: (_options$wrap = options.wrap) !== null && _options$wrap !== void 0 ? _options$wrap : 'wrap',
        justifyContent: (_options$justifyConte = options.justifyContent) !== null && _options$justifyConte !== void 0 ? _options$justifyConte : 'center',
        alignItems: (_options$alignItems = options.alignItems) !== null && _options$alignItems !== void 0 ? _options$alignItems : 'center',
        ['--stretch']: options.justifyContent === 'stretch' ? '100%' : 'false',
        ['--gap']: `${gap}px`,
        padding: `${padding}px`,
        margin: `${margin}px`
      },
      children: "APPLES"
    });
  }
};