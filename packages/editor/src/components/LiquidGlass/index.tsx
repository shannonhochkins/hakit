import { css } from '@emotion/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type CSSInterpolation } from '@emotion/serialize';

export interface LiquidGlassProps extends React.ComponentProps<'div'> {
  /** feDisplacementMap scale (refraction strength) */
  displacementScale?: number;

  /** Alpha slope for the specular layer (0..1) */
  specularOpacity?: number;

  /** Saturation applied to displaced layer (string expected by SVG; we accept number and stringify) */
  specularSaturation?: number;

  /** feGaussianBlur stdDeviation before displacement */
  blur?: number;

  /** z-index for the hidden SVG (panel sits above it) */
  zIndex?: number;

  /** Optional: provide custom images; otherwise we auto-generate */
  displacementMapSrc?: string;
  specularMapSrc?: string;

  /** Usual React stuff */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;

  /** Force a stable ID for the filter (useful if you SSR or memoize heavily) */
  filterId: string;
  ref?: React.Ref<HTMLDivElement>;
  cssStyles?: CSSInterpolation;
}

export function sanitizeFilterId(id: string) {
  return id.replace(/[^a-zA-Z0-9-_]/g, '-');
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  displacementScale = 53,
  specularOpacity = 0.1,
  specularSaturation = 2,
  blur = 2,
  zIndex = 1,

  displacementMapSrc,
  specularMapSrc,

  className,
  style,
  children,
  filterId,
  ref,
  cssStyles,
  ...props
}) => {
  // --- sizing (auto) ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);

  const id = useMemo(() => sanitizeFilterId(filterId), [filterId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const borderBox = entry.borderBoxSize?.[0] || entry.borderBoxSize?.[0];
        if (borderBox) {
          // inlineSize/blockSize are border-box
          setWidth(Math.max(100, Math.ceil(borderBox.inlineSize)));
          setHeight(Math.max(100, Math.ceil(borderBox.blockSize)));
        } else {
          // Fallback: include padding via offsetWidth/offsetHeight (border-box)
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          setWidth(Math.max(100, Math.ceil(w)));
          setHeight(Math.max(100, Math.ceil(h)));
        }
      }
    });
    ro.observe(el, {
      box: 'border-box',
    });
    return () => ro.disconnect();
  }, []);

  const dispImgRef = useRef<SVGFEImageElement>(null);
  const specImgRef = useRef<SVGFEImageElement>(null);
  const dispCanvasRef = useRef<HTMLCanvasElement>(null);
  const specCanvasRef = useRef<HTMLCanvasElement>(null);

  // Keep DPI = 1 (like your original). It avoids coordinate mismatches in feImage.
  const DPI = 1;

  const setHref = (el: SVGElement, url: string) => {
    el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
    el.setAttribute('href', url);
  };

  // --- map generation (auto or from src) ---
  const [dispUrl, setDispUrl] = useState<string>('');
  const [specUrl, setSpecUrl] = useState<string>('');

  // Default displacement: rounded-rect edge-emphasized vector field
  const drawDefaultDisplacement = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const img = ctx.createImageData(W, H);
    const data = img.data;

    const hw = W / 2;
    const hh = H / 2;

    // Rounded rect parameters in normalized space (close to demo feel)
    const halfW = 0.3;
    const halfH = 0.2;
    const corner = 0.25;

    // SDF helper
    const roundedRectSDF = (x: number, y: number, w: number, h: number, r: number) => {
      const qx = Math.abs(x) - w + r;
      const qy = Math.abs(y) - h + r;
      const px = Math.max(qx, 0);
      const py = Math.max(qy, 0);
      return Math.min(Math.max(qx, qy), 0) + Math.hypot(px, py) - r;
    };

    const smoothStep = (a: number, b: number, t: number) => {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = (x - hw) / hw; // -1..1
        const ny = (y - hh) / hh; // -1..1

        // edge emphasis akin to your shader loop
        const d = roundedRectSDF(nx, ny, halfW, halfH, corner);
        const displacement = smoothStep(0.8, 0, d - 0.15);
        const scaled = smoothStep(0, 1, displacement);

        // small directional bias to mimic pleasing refraction sweep
        const dx = nx * scaled * 0.5 + ny * scaled * 0.1;
        const dy = ny * scaled * 0.5 - nx * scaled * 0.05;

        const r = Math.max(0, Math.min(255, (dx * 0.5 + 0.5) * 255));
        const g = Math.max(0, Math.min(255, (dy * 0.5 + 0.5) * 255));

        const off = (y * W + x) * 4;
        data[off + 0] = r; // R = x offset
        data[off + 1] = g; // G = y offset
        data[off + 2] = 0; // B
        data[off + 3] = 255; // A
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  // Default specular: diagonal highlight + soft cross streak
  const drawDefaultSpecular = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.clearRect(0, 0, W, H);
    const g1 = ctx.createLinearGradient(0, 0, W, H);
    g1.addColorStop(0.05, 'rgba(255,255,255,0.9)');
    g1.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g1.addColorStop(0.65, 'rgba(255,255,255,0.08)');
    g1.addColorStop(1.0, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createLinearGradient(W, 0, 0, H);
    g2.addColorStop(0.0, 'rgba(255,255,255,0.0)');
    g2.addColorStop(0.25, 'rgba(255,255,255,0.06)');
    g2.addColorStop(0.75, 'rgba(255,255,255,0.22)');
    g2.addColorStop(1.0, 'rgba(255,255,255,0.0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  };

  const drawImageCover = (ctx: CanvasRenderingContext2D, W: number, H: number, src: string) =>
    new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const s = Math.max(W / img.width, H / img.height);
        const dw = img.width * s;
        const dh = img.height * s;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, dx, dy, dw, dh);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });

  // Rebuild maps on size or source change
  useEffect(() => {
    const W = Math.max(1, Math.floor(width * DPI));
    const H = Math.max(1, Math.floor(height * DPI));

    const dispCanvas = (dispCanvasRef.current ||= document.createElement('canvas'));
    const specCanvas = (specCanvasRef.current ||= document.createElement('canvas'));

    dispCanvas.width = W;
    dispCanvas.height = H;
    specCanvas.width = W;
    specCanvas.height = H;

    const dctx = dispCanvas.getContext('2d');
    const sctx = specCanvas.getContext('2d');
    if (!dctx || !sctx) return;

    (async () => {
      try {
        if (displacementMapSrc) await drawImageCover(dctx, W, H, displacementMapSrc);
        else drawDefaultDisplacement(dctx, W, H);

        if (specularMapSrc) await drawImageCover(sctx, W, H, specularMapSrc);
        else drawDefaultSpecular(sctx, W, H);

        setDispUrl(dispCanvas.toDataURL());
        setSpecUrl(specCanvas.toDataURL());
      } catch {
        // fallback if external fetch fails
        drawDefaultDisplacement(dctx, W, H);
        drawDefaultSpecular(sctx, W, H);
        setDispUrl(dispCanvas.toDataURL());
        setSpecUrl(specCanvas.toDataURL());
      }
    })();
  }, [width, height, displacementMapSrc, specularMapSrc]);

  // Push URLs + sizes into feImage when ready
  const filterReady = !!(dispUrl && specUrl);
  useEffect(() => {
    if (!filterReady) return;
    const W = String(Math.max(1, Math.floor(width * DPI)));
    const H = String(Math.max(1, Math.floor(height * DPI)));

    if (dispImgRef.current && dispUrl) {
      setHref(dispImgRef.current, dispUrl);
      dispImgRef.current.setAttribute('x', '0');
      dispImgRef.current.setAttribute('y', '0');
      dispImgRef.current.setAttribute('width', W);
      dispImgRef.current.setAttribute('height', H);
    }
    if (specImgRef.current && specUrl) {
      setHref(specImgRef.current, specUrl);
      specImgRef.current.setAttribute('x', '0');
      specImgRef.current.setAttribute('y', '0');
      specImgRef.current.setAttribute('width', W);
      specImgRef.current.setAttribute('height', H);
    }
  }, [filterReady, dispUrl, specUrl, width, height]);

  // --- render ---
  return (
    <>
      {/* Invisible SVG filter definition (matches the demo graph 1:1) */}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='0'
        height='0'
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex }}
      >
        <defs>
          <filter id={id} colorInterpolationFilters='sRGB' filterUnits='userSpaceOnUse' x='0' y='0' width={width} height={height}>
            <feGaussianBlur in='SourceGraphic' stdDeviation={blur} result='blurred_source' />
            <feImage ref={dispImgRef} result='displacement_map' />
            <feDisplacementMap
              in='blurred_source'
              in2='displacement_map'
              scale={displacementScale}
              xChannelSelector='R'
              yChannelSelector='G'
              result='displaced'
            />
            <feColorMatrix
              in='displaced'
              type='saturate'
              values={specularSaturation.toString()} // SVG expects string
              result='displaced_saturated'
            />
            <feImage ref={specImgRef} result='specular_layer' />
            <feComposite in='displaced_saturated' in2='specular_layer' operator='in' result='specular_saturated' />
            <feComponentTransfer in='specular_layer' result='specular_faded'>
              <feFuncA type='linear' slope={specularOpacity} />
            </feComponentTransfer>
            <feBlend in='specular_saturated' in2='displaced' mode='normal' result='withSaturation' />
            <feBlend in='specular_faded' in2='withSaturation' mode='normal' />
          </filter>
        </defs>
      </svg>

      {/* Hidden canvases for map generation (kept for devtools inspection if needed) */}
      <canvas ref={dispCanvasRef} style={{ display: 'none' }} />
      <canvas ref={specCanvasRef} style={{ display: 'none' }} />

      {/* Glass panel (auto-sized by parent via CSS). 
          We only apply the filter once the maps are ready to avoid "white panel" moments. */}
      <div
        ref={_ref => {
          containerRef.current = _ref;
          // @ts-expect-error - TODO - Fix types later
          if (ref) ref(_ref);
        }}
        className={className}
        style={{
          ...style,
        }}
        css={css`
          ${cssStyles}
        `}
        {...props}
      >
        {children}
      </div>
    </>
  );
};
