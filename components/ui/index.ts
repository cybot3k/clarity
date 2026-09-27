/** The design system's primitives. Anything reused across two or more screens
 * that renders the app's own visual language lives here. */
export { AtmosphereCanvas, type AtmosphereCanvasProps } from './atmosphere-canvas';
export {
  AtmosphereSurface,
  type AtmosphereMesh,
  type AtmosphereSurfaceProps,
} from './atmosphere-surface';
export {
  ControlDisc,
  type ControlDiscFill,
  type ControlDiscProps,
} from './control-disc';
export { ControlPill, type ControlPillProps, type ControlPillVariant } from './control-pill';
export { DayChip, type DayChipProps } from './day-chip';
export { DottedStroke, type DottedStrokeProps } from './dotted-stroke';
export { GlassSurface, glassSurfaceShape, type GlassSurfaceProps } from './glass-surface';
export { GrainOverlay, type GrainOverlayProps } from './grain-overlay';
export { LedNumber, type LedNumberProps } from './led-number';
export { MetricCapsule, type MetricCapsuleProps, type MetricFamily } from './metric-capsule';
export { OptionCard, SelectionMark, type OptionCardProps, type SelectionMarkProps } from './option-card';
export { PrimaryButton, type PrimaryButtonProps } from './primary-button';
export { SectionHeader } from './section-header';
export { SpeechMark, type SpeechMarkProps } from './speech-mark';
export { ThemedText, type TextTone, type ThemedTextProps } from './themed-text';
