import { CustomComponentConfig, RenderProps } from '@typings/puck';
import { Slot } from '@measured/puck';
import { UnitFieldValue } from '@typings/fields';
import { LiquidGlass } from './LiquidGlass';

/** =========================
 * Types & helpers
 * ======================= */
export type CardProps = {
  appearance: {
    borderRadius: UnitFieldValue;
    backgroundType: 'color' | 'glass' | 'liquid-glass';

    glassBlurAmount?: number;
    glassColor?: string;
    glassOutline?: number;
    glassOutlineTransparency?: number;

    boxShadowEnabled?: boolean;
    boxShadowColor?: string;
    boxShadowBlur?: number;
    boxShadowSpread?: number;

    // (liquid-glass specific)
    displacementScale?: number; // default 53
    specularOpacity?: number; // default 0.1
    specularSaturation?: number; // default 2
    blur?: number; // default 2
    glassBgOpacity?: number; // default 0.1
  };
  content: Slot;
};

/** =========================
 * Component Config
 * ======================= */
export const cardComponentConfig: CustomComponentConfig<CardProps> = {
  label: 'Card',
  fields: {
    appearance: {
      label: 'Appearance',
      type: 'object',
      objectFields: {
        backgroundType: {
          type: 'select',
          label: 'Background Type',
          description: 'Type of background effect for the card',
          options: [
            { label: 'Color', value: 'color' },
            { label: 'Glass', value: 'glass' },
            { label: 'Liquid Glass', value: 'liquid-glass', description: 'Only works in Google Chrome' },
          ],
          default: 'color',
        },
        glassColor: {
          type: 'color',
          label: 'Glass Color',
          description: 'Tint color for the glass background, including alpha for transparency',
          default: 'rgba(255, 255, 255, 0.1)',
          visible(props) {
            return props.appearance.backgroundType === 'glass';
          },
        },
        glassBlurAmount: {
          type: 'slider',
          label: 'Glass Blur Amount',
          description: 'Amount of blur for the glass background',
          default: 5,
          step: 0.1,
          min: 0,
          max: 30,
          visible(props) {
            return props.appearance.backgroundType === 'glass';
          },
        },
        glassOutline: {
          type: 'slider',
          label: 'Glass Outline',
          description: 'Outline thickness for the glass background',
          default: 1,
          step: 1,
          min: 0,
          max: 10,
          visible(props) {
            return props.appearance.backgroundType === 'glass' || props.appearance.backgroundType === 'liquid-glass';
          },
        },
        glassOutlineTransparency: {
          type: 'slider',
          label: 'Glass Outline Transparency',
          description: 'Outline transparency for the glass background',
          default: 0.81,
          step: 0.01,
          min: 0,
          max: 1,
          visible(props) {
            return props.appearance.backgroundType === 'glass' || props.appearance.backgroundType === 'liquid-glass';
          },
        },
        displacementScale: {
          type: 'slider',
          label: 'Displacement Scale',
          description: 'Refraction strength for liquid glass',
          default: 53,
          step: 1,
          min: 0,
          max: 200,
          visible(props) {
            return props.appearance.backgroundType === 'liquid-glass';
          },
        },
        specularOpacity: {
          type: 'slider',
          label: 'Specular Opacity',
          description: 'Alpha slope for specular layer (0..1)',
          default: 0.1,
          step: 0.01,
          min: 0,
          max: 1,
          visible(props) {
            return props.appearance.backgroundType === 'liquid-glass';
          },
        },
        specularSaturation: {
          type: 'slider',
          label: 'Specular Saturation',
          description: 'Saturation applied after displacement',
          default: 2,
          step: 0.1,
          min: 0,
          max: 10,
          visible(props) {
            return props.appearance.backgroundType === 'liquid-glass';
          },
        },
        blur: {
          type: 'slider',
          label: 'Pre-Blur',
          description: 'feGaussianBlur stdDeviation before displacement',
          default: 2,
          step: 0.1,
          min: 0,
          max: 10,
          visible(props) {
            return props.appearance.backgroundType === 'liquid-glass';
          },
        },
        glassBgOpacity: {
          type: 'slider',
          label: 'Glass BG Opacity',
          description: 'Opacity of the panel tint (0..1)',
          default: 0.1,
          step: 0.01,
          min: 0,
          max: 1,
          visible(props) {
            return props.appearance.backgroundType === 'liquid-glass';
          },
        },
        boxShadowEnabled: {
          type: 'switch',
          label: 'Enable Box Shadow',
          description: 'Toggle box shadow on or off',
          default: true,
        },
        boxShadowColor: {
          type: 'color',
          label: 'Box Shadow Color',
          description: 'Color of the box shadow (supports transparency)',
          default: 'rgba(0,0,0,0.1)',
          visible(props) {
            return props.appearance.boxShadowEnabled !== false;
          },
        },
        boxShadowBlur: {
          type: 'slider',
          label: 'Box Shadow Blur',
          description: 'Blur radius for the box shadow',
          default: 30,
          step: 1,
          min: 0,
          max: 100,
          visible(props) {
            return props.appearance.boxShadowEnabled !== false;
          },
        },
        boxShadowSpread: {
          type: 'slider',
          label: 'Box Shadow Spread',
          description: 'Spread radius for the box shadow',
          default: 10,
          step: 1,
          min: 0,
          max: 100,
          visible(props) {
            return props.appearance.boxShadowEnabled !== false;
          },
        },
        borderRadius: {
          type: 'unit',
          label: 'Border Radius',
          description: 'Border radius of the card',
          default: '1rem',
          supportsAllCorners: true,
        },
      },
    },

    content: {
      type: 'slot',
      label: 'Content',
    },
  },

  permissions: {
    drag: false,
    duplicate: false,
  },
  autoWrapComponent: false,

  styles(props) {
    const isGlassBackground = props.appearance.backgroundType === 'glass';
    const isLiquidGlassBackground = props.appearance.backgroundType === 'liquid-glass';
    const boxShadow =
      props.appearance.boxShadowEnabled !== false
        ? `box-shadow: 0 4px ${props.appearance.boxShadowBlur ?? 30}px ${props.appearance.boxShadowSpread ?? 0}px ${props.appearance.boxShadowColor ?? 'rgba(0,0,0,0.1)'};`
        : '';
    const baseStyles = `
      position: relative;
      border-radius: ${props.appearance.borderRadius};
      overflow: hidden;
      ${boxShadow}
    `;

    if (isGlassBackground) {
      const glassColor = props.appearance.glassColor || 'rgba(255, 255, 255, 0.2)';

      const percent = Math.round((props.appearance.glassOutlineTransparency ?? 0.81) * 100);
      const borderColor = `color-mix(in srgb, ${glassColor} ${percent}%, transparent)`;
      const borderWidth = `${props.appearance.glassOutline ?? 1}px`;
      return `
        ${baseStyles}
        background: ${glassColor};
        backdrop-filter: blur(${props.appearance.glassBlurAmount ?? `5`}px);
        -webkit-backdrop-filter: blur(${props.appearance.glassBlurAmount ?? `5`}px);
        border: ${borderWidth} solid ${borderColor};
      `;
    }
    if (isLiquidGlassBackground) {
      const glassColor = props.appearance.glassColor || 'rgba(255, 255, 255, 0.2)';
      const percent = Math.round((props.appearance.glassOutlineTransparency ?? 0.81) * 100);
      const borderColor = `color-mix(in srgb, ${glassColor} ${percent}%, transparent)`;
      const borderWidth = `${props.appearance.glassOutline ?? 1}px`;
      return `
        ${baseStyles}
        background: ${glassColor};
        border: ${borderWidth} solid ${borderColor};
      `;
    }
    return baseStyles;
  },
  render: Render,
};

function Render(props: RenderProps<CardProps>) {
  const { content: Content } = props;
  const isLiquidGlassBackground = props.appearance.backgroundType === 'liquid-glass';

  if (isLiquidGlassBackground) {
    const {
      glassColor, // reuse as glassBgColor
      displacementScale,
      specularOpacity,
      specularSaturation,
      blur,
      glassBgOpacity,
    } = props.appearance;
    return (
      <LiquidGlass
        className='Card Card-liquid-glass'
        ref={props._dragRef}
        cssStyles={props.css}
        glassBgColor={glassColor}
        glassBgOpacity={glassBgOpacity}
        displacementScale={displacementScale}
        specularOpacity={specularOpacity}
        specularSaturation={specularSaturation}
        blur={blur}
      >
        <Content className='Card-content' />
      </LiquidGlass>
    );
  }
  return (
    <div className='Card' ref={props._dragRef} css={props.css}>
      <Content className='Card-content' />
    </div>
  );
}
