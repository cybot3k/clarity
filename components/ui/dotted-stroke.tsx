import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { atmosphere } from '@/constants/theme';

export type DottedStrokeProps = {
  color: string;
  radius: number;
};

/** Hairline dotted rounded-rect, sized from the parent via onLayout. */
export function DottedStroke({ color, radius }: DottedStrokeProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  const inset = atmosphere.dottedWidth / 2;

  return (
    <View pointerEvents="none" onLayout={onLayout} style={StyleSheet.absoluteFill}>
      {size.w > 0 && size.h > 0 ? (
        <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
          <Rect
            x={inset}
            y={inset}
            width={size.w - atmosphere.dottedWidth}
            height={size.h - atmosphere.dottedWidth}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={color}
            strokeWidth={atmosphere.dottedWidth}
            strokeDasharray={`${atmosphere.dottedDash[0]} ${atmosphere.dottedDash[1]}`}
            strokeLinecap="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}
