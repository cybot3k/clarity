/**
 * 5×7 on/off maps for Atmospheric Glass LED numerals.
 * Row 0 is top. Designed as 14-segment approximations (a `1` is a single column).
 *
 * Decimal is not a glyph — `LedNumber` draws one baseline-row circle.
 * Null is three `-` glyphs at off intensity.
 *
 * PURE module — no React.
 */

export const LED_GLYPHS = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  '1': ['00100', '00100', '00100', '00100', '00100', '00100', '00100'],
  '2': ['01110', '10001', '00001', '01110', '10000', '10000', '11111'],
  '3': ['01110', '10001', '00001', '00110', '00001', '10001', '01110'],
  '4': ['10001', '10001', '10001', '11111', '00001', '00001', '00001'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '00100', '00100', '00100'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
} as const satisfies Record<string, readonly [string, string, string, string, string, string, string]>;

export type LedGlyphKey = keyof typeof LED_GLYPHS;
