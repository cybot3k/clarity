import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { DayChip, ThemedText } from '@/components/ui';
import { SKILL_ORDER } from '@/constants/metrics';
import { atmosphere, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 134;
const PAD_TOP = 18;
const PAD_BOTTOM = 8;

export type ScoreChartPoint = {
  key: string;
  label: string;
  detail: string;
  score: number | null;
  sessions: number;
  minutes: number;
  skillCount: number;
  isCurrent: boolean;
};

export type ScoreChartProps = {
  points: readonly ScoreChartPoint[];
  avg: number | null;
  onScrub?: (point: ScoreChartPoint | null) => void;
};

function bucketAt(x: number, width: number, count: number): number {
  'worklet';
  if (width <= 0 || count === 0) return -1;
  const index = Math.floor((x / width) * count);
  return Math.min(Math.max(index, 0), count - 1);
}

function yFor(score: number, height: number): number {
  return PAD_TOP + (1 - score / 100) * (height - PAD_TOP - PAD_BOTTOM);
}

type ChartMark = {
  key: string;
  x: number;
  y: number;
  kind: 'vertex' | 'unscored';
  partial: boolean;
};

/** Catmull-Rom through scored points, cubic segments. Gaps break the path.
 * A 1-point run is a vertex, not `M x y` (a move with no stroke). Practiced
 * but unscored buckets get a hollow baseline mark so they are not rest. */
function curvePath(
  points: readonly ScoreChartPoint[],
  width: number,
  height: number,
): { full: string; partial: string; marks: ChartMark[] } {
  const n = points.length;
  if (n === 0 || width <= 0) return { full: '', partial: '', marks: [] };
  const step = width / Math.max(n, 1);
  const pts = points.map((p, i) => ({
    key: p.key,
    x: step * (i + 0.5),
    y: p.score == null ? null : yFor(p.score, height),
    partial: p.skillCount < SKILL_ORDER.length,
    sessions: p.sessions,
  }));

  const segs: { d: string; partial: boolean }[] = [];
  const marks: ChartMark[] = [];
  let run: { key: string; x: number; y: number; partial: boolean }[] = [];

  const flush = () => {
    if (run.length === 0) return;
    if (run.length === 1) {
      marks.push({
        key: run[0].key,
        x: run[0].x,
        y: run[0].y,
        kind: 'vertex',
        partial: run[0].partial,
      });
    } else {
      let d = `M ${run[0].x} ${run[0].y}`;
      for (let i = 0; i < run.length - 1; i++) {
        const p0 = run[Math.max(i - 1, 0)];
        const p1 = run[i];
        const p2 = run[i + 1];
        const p3 = run[Math.min(i + 2, run.length - 1)];
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
      }
      segs.push({ d, partial: run.some((p) => p.partial) });
    }
    run = [];
  };

  for (const p of pts) {
    if (p.y == null) {
      flush();
      if (p.sessions > 0) {
        marks.push({
          key: p.key,
          x: p.x,
          y: yFor(0, height),
          kind: 'unscored',
          partial: false,
        });
      }
    } else {
      run.push({ key: p.key, x: p.x, y: p.y, partial: p.partial });
    }
  }
  flush();

  return {
    full: segs.filter((s) => !s.partial).map((s) => s.d).join(' '),
    partial: segs.filter((s) => s.partial).map((s) => s.d).join(' '),
    marks,
  };
}

/**
 * SVG monotone-cubic speaking-score curve. Scrub gesture is the previous
 * 6pt / 200ms / 14pt-fail contract; payload is still a full ScoreChartPoint.
 */
export function ScoreChart({ points, avg, onScrub }: ScoreChartProps) {
  const { colors } = useTheme();
  const chartWidth = useSharedValue(0);
  const bucketCount = useSharedValue(points.length);
  const panning = useSharedValue(false);
  const holding = useSharedValue(false);
  const lastIndex = useSharedValue(-1);
  const widthRef = useRef(0);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  bucketCount.value = points.length;

  const focusIndex = useCallback(
    (index: number) => {
      const point = pointsRef.current[index];
      if (!point) return;
      Haptics.selectionAsync();
      setCursorKey(point.key);
      onScrub?.(point);
    },
    [onScrub],
  );

  const endScrub = useCallback(() => {
    lastIndex.value = -1;
    setCursorKey(null);
    onScrub?.(null);
  }, [lastIndex, onScrub]);

  useEffect(() => endScrub(), [points, endScrub]);

  const gesture = useMemo(() => {
    const scrubTo = (x: number) => {
      'worklet';
      const index = bucketAt(x, chartWidth.value, bucketCount.value);
      if (index < 0 || index === lastIndex.value) return;
      lastIndex.value = index;
      runOnJS(focusIndex)(index);
    };

    const release = () => {
      'worklet';
      if (panning.value || holding.value) return;
      lastIndex.value = -1;
      runOnJS(endScrub)();
    };

    const pan = Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-14, 14])
      .onStart((event) => {
        panning.value = true;
        scrubTo(event.x);
      })
      .onUpdate((event) => scrubTo(event.x))
      .onFinalize(() => {
        if (!panning.value) return;
        panning.value = false;
        release();
      });

    const hold = Gesture.LongPress()
      .minDuration(200)
      .maxDistance(12)
      .onStart((event) => {
        holding.value = true;
        scrubTo(event.x);
      })
      .onFinalize(() => {
        if (!holding.value) return;
        holding.value = false;
        release();
      });

    return Gesture.Simultaneous(pan, hold);
  }, [bucketCount, chartWidth, endScrub, focusIndex, holding, lastIndex, panning]);

  const [width, setWidth] = useState(0);
  const [cursorKey, setCursorKey] = useState<string | null>(null);
  const paths = curvePath(points, width, CHART_HEIGHT);
  const current =
    points.find((p) => p.key === cursorKey) ??
    points.find((p) => p.isCurrent) ??
    points[points.length - 1];
  const cursor =
    current && current.score != null && width > 0
      ? {
          x: (width / points.length) * (points.indexOf(current) + 0.5),
          y: yFor(current.score, CHART_HEIGHT),
        }
      : null;
  const avgY = avg != null ? yFor(avg, CHART_HEIGHT) : null;
  const weekChips = points.length <= 7;
  const dash = `${atmosphere.dottedDash[0]} ${atmosphere.dottedDash[1]}`;

  if (points.length === 0) return null;

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <View
          onLayout={(event) => {
            const w = event.nativeEvent.layout.width;
            chartWidth.value = w;
            widthRef.current = w;
            setWidth(w);
          }}
          style={styles.plot}
          accessibilityLabel="Speaking score by day"
          accessibilityHint="Swipe across the chart to inspect a day. Its details read out above the chart."
          testID="speaking-score-chart">
          {width > 0 && (
            <Svg width={width} height={CHART_HEIGHT}>
              {[0, 50, 100].map((tick) => (
                <Line
                  key={tick}
                  x1={0}
                  x2={width}
                  y1={yFor(tick, CHART_HEIGHT)}
                  y2={yFor(tick, CHART_HEIGHT)}
                  stroke={colors.chartGrid}
                  strokeWidth={atmosphere.dottedWidth}
                  strokeDasharray={dash}
                />
              ))}
              {avgY != null && (
                <Line
                  x1={0}
                  x2={width}
                  y1={avgY}
                  y2={avgY}
                  stroke={colors.chartLine}
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              )}
              {paths.full ? (
                <Path d={paths.full} fill="none" stroke={colors.chartLine} strokeWidth={2} />
              ) : null}
              {paths.partial ? (
                <Path
                  d={paths.partial}
                  fill="none"
                  stroke={colors.chartPartial}
                  strokeWidth={2}
                  strokeDasharray={dash}
                />
              ) : null}
              {paths.marks.map((mark) =>
                mark.kind === 'vertex' ? (
                  <Circle
                    key={mark.key}
                    cx={mark.x}
                    cy={mark.y}
                    r={atmosphere.chartVertexSize / 2}
                    fill={mark.partial ? colors.chartPartial : colors.chartLine}
                  />
                ) : (
                  <Circle
                    key={mark.key}
                    cx={mark.x}
                    cy={mark.y}
                    r={atmosphere.chartUnscoredSize / 2}
                    fill="none"
                    stroke={colors.chartPartial}
                    strokeWidth={atmosphere.dottedWidth}
                  />
                ),
              )}
              {cursor ? (
                <>
                  <Circle
                    cx={cursor.x}
                    cy={cursor.y}
                    r={atmosphere.cursorSize / 2}
                    fill="none"
                    stroke={colors.cursorRing}
                    strokeWidth={1}
                  />
                  <Circle
                    cx={cursor.x}
                    cy={cursor.y}
                    r={atmosphere.cursorDotSize / 2}
                    fill={colors.cursorDot}
                  />
                </>
              ) : null}
            </Svg>
          )}
          {avg != null && (
            <ThemedText variant="caption" tone="onAtmosphereMuted" style={styles.avg}>
              avg {Math.round(avg)}
            </ThemedText>
          )}
        </View>
      </GestureDetector>
      {weekChips ? (
        <View style={styles.chips}>
          {points.map((p) => (
            <DayChip
              key={p.key}
              intent="axis"
              letter={p.label}
              selected={cursorKey ? p.key === cursorKey : p.isCurrent}
            />
          ))}
        </View>
      ) : (
        <View style={styles.ticks}>
          {points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p) => (
            <ThemedText key={p.key} variant="caption" tone="onAtmosphereMuted">
              {p.label}
            </ThemedText>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    height: CHART_HEIGHT,
  },
  avg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  chips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
