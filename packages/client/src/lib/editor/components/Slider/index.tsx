import { createComponent } from '..';
import { ContextSlider } from './slider';
import { v4 as uuidv4 } from 'uuid';



export type Slide = {
  label?: string;
  id: string;
}

export interface SliderProps {
  slides: Slide[];
  options: {
    /** spacing should be a css spacing in pixels */
    spacing?: number;
    /** the offset of the inactive elements, set this to false to behave like a generic slider @default 150 */
    inactiveOffset?: number | false;
    /** inactive items have a scale multiplier applied based on the active index, tweak this multiplier if need be @default 0.1 */
    inactiveScaleMultiplier?: number;
    /** thew blur to apply the the inactive items in pixels @default 15 */
    inactiveBlur?: number;
  },
}


const component = createComponent<Omit<SliderProps, 'ref'>>({
  category: 'Misc',
  label: 'Slider',
  fields: {
    slides: {
      type: 'array',
      label: 'Slides',
      default: [],
      min: 5,
      max: 5,
      collapsible: {
        open: true,
      },
      getItemSummary: (item, i) => item.label || `Viewport #${i}`,
      defaultItemProps: {
        id: '',
        label: 'Slide Name',
      },
      disableBreakpoints: true,
      arrayFields: {
        label: {
          label: 'Label',
          type: 'text',
          default: 'Slide Name',
        },
        id: {
          type: 'hidden',
          default: '',
          disableBreakpoints: true,
        },
      },
    },
    options: {
      type: 'object',
      default: {},
      label: 'Slider options',
      collapsible: {
        open: false,
      },
      objectFields: {
        spacing: {
          label: 'Spacing',
          type: 'number',
          default: 0,
          min: 0,
          max: 100,
          step: 1,
        },
        inactiveOffset: {
          label: 'Inactive Offset',
          type: 'number',
          default: 150,
          min: 0,
          max: 1000,
          step: 5,
        },
        inactiveScaleMultiplier: {
          label: 'Inactive Scale Multiplier',
          type: 'number',
          default: 0.1,
          min: 0,
          max: 1,
          step: 0.1,
        },
        inactiveBlur: {
          label: 'Inactive Blur',
          type: 'number',
          min: 0,
          max: 100,
          step: 1,
          default: 15,
        }
      }
    },
  },
  resolveData: ({ props }) => {
    let lastId: string | null = null;
    const shallowSlideCopy = [...props.slides ?? []].map(slide => ({ ...slide }));
    for (const slide of shallowSlideCopy) {
      // if the id is the same as the last, we're cloning
      // if the id doesn't exist, it's a new slide
      if (!slide.id || slide.id === lastId) {
        // attach an id to the slide
        const id = uuidv4();
        slide.id = id;
      }
      lastId = slide.id;
    }
    props.slides = shallowSlideCopy;
    return {
      props,
    }
  },
  inline: true,
  permissions: {
    drag: false,
    delete: false,
    duplicate: false,
    insert: false,
  },
  render({ puck, options, slides = [] }) {
    const slidesWithId = slides
      .filter(slide => slide.id && slide.id.length > 0);
    return <ContextSlider options={options} slides={slidesWithId} ref={puck.dragRef} />;
  },
});

export default component;
