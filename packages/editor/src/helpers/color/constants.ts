// PRIMARY_LIGHT_TARGET:
// When we "add light" to the color we aim near this lightness (like aiming for a bright wall but not blinding).
// Keeping it < 1 avoids pure white which kills hue completely.
export const PRIMARY_LIGHT_TARGET = 0.98;

// PRIMARY_DARK_TARGET:
// When we "take away light" (light mode inverse) we move toward this darker floor instead of pure black to retain hue hints.
export const PRIMARY_DARK_TARGET = 0.02;

// PRIMARY_SEMANTIC_LIGHT_END / PRIMARY_SEMANTIC_DARK_END:
// Semantic scales avoid extreme ends so they stay more usable for badges/pills.
export const PRIMARY_SEMANTIC_LIGHT_END = 0.92;
export const PRIMARY_SEMANTIC_DARK_END = 0.3;

// PRIMARY_SEMANTIC_HUE_SHIFT_SCALE:
// How strongly we let hue drift on semantic scales (smaller keeps base hue more intact).
export const PRIMARY_SEMANTIC_HUE_SHIFT_SCALE = 0.3;

// PRIMARY_PROGRESS_NORMALIZATION:
// Anchor progress arrays peak below 1; we divide by this so math feels like full range 0..1.
export const PRIMARY_PROGRESS_NORMALIZATION = 0.88;

// PRIMARY_LIGHT_MODE_CHROMA_DROP:
// How much chroma (colorfulness) we lose as we darken in light mode; higher number = faster greying.
export const PRIMARY_LIGHT_MODE_CHROMA_DROP = 0.85;

// PRIMARY_SEMANTIC_CHROMA_RET_LIGHT / DARK:
// Chroma retention factors semantic mode (keep more color early so it reads as intent).
export const PRIMARY_SEMANTIC_CHROMA_RET_LIGHT = 0.6; // during darkening
export const PRIMARY_SEMANTIC_CHROMA_RET_DARK = 0.9; // during lightening

// PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE:
// Reduce hue shift strength in light mode to avoid wild swings.
export const PRIMARY_HUE_SHIFT_LIGHT_MODE_SCALE = 0.5;

// PRIMARY_GAUSSIAN_DENOMINATOR:
// Controls how quickly anchor influence fades with hue distance. Smaller = sharper cutoff.
export const PRIMARY_GAUSSIAN_DENOMINATOR = 40;

export const PRIMARY_SURFACE_SIZE = 10;
export const SEMANTIC_PRIMARY_SIZE = 4;

// Iterative darken/lighten approach:
// Dark mode: progressively lighten the base using Color.lighten(f) with a tuned factor curve.
// Light mode: progressively darken the base using Color.darken(f) ensuring each step differs.
// Guarantees no duplicate rgba outputs; simpler & driven by input color directly.

// LIGHT_MODE_DARKEN_SPAN:
// Think of the original color as a bright cookie. We take little bites to make it darker.
// This number says how big the total bite size is from start to finish. Smaller = gentler darkening.
// If you make it 0.3 the steps will stay very close to the original; if you make it 1.0 it will get much darker.
export const LIGHT_MODE_DARKEN_SPAN = 0.65; // previously 0.65 (slowed down per request)

// LIGHT_MODE_DUPLICATE_NUDGE:
// Sometimes two steps accidentally look the same after rounding (like drawing two crayons that match).
// This tiny number is how much extra "push" we give to the color to make it different when that happens.
// Bigger number = stronger push but risk of uneven jumps.
export const LIGHT_MODE_DUPLICATE_NUDGE = 0.02; // previously 0.03

// DARK_MODE_LIGHTEN_SPAN:
// In dark mode our starting color is usually dim. This sets how far we brighten across all steps.
// Imagine a dimmer knob: 0.5 means we turn it up halfway, 1.0 would try to go very bright.
export const DARK_MODE_LIGHTEN_SPAN = 1.65; // gentler brightening span (was 3 overly aggressive)

// DARK_MODE_DUPLICATE_NUDGE:
// Tiny brightness push when two lightened steps collide and look identical.
// Keep small to avoid banding.
export const DARK_MODE_DUPLICATE_NUDGE = 0.1;
