import { type ViewProps } from 'react-native';

export type GrainOverlayProps = ViewProps & {
  /** Ignored. Grain is not part of the product. */
  opacity?: number;
};

/** Retired. Renders nothing so a leftover mount cannot texture a surface. */
export function GrainOverlay(_props: GrainOverlayProps) {
  return null;
}
