import React, { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fontSize, radius, spacing } from '@/theme';
import { PrimaryButton } from './PrimaryButton';

/** A signature captured as vector strokes, plus the canvas size it was drawn
 * at — needed so playback via SignaturePreview can scale correctly on a
 * differently-sized container instead of distorting the drawing. */
export interface SignatureValue {
  w: number;
  h: number;
  strokes: string[];
}

export function serializeSignature(value: SignatureValue | null): string | undefined {
  if (!value || value.strokes.length === 0) return undefined;
  return JSON.stringify(value);
}

export function parseSignature(raw: string | null | undefined): SignatureValue | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.strokes)) return parsed as SignatureValue;
  } catch {
    // ignore malformed data
  }
  return null;
}

interface SignaturePadProps {
  value: SignatureValue | null;
  onChange: (value: SignatureValue | null) => void;
  height?: number;
}

/** Draw-with-mouse-or-finger signature capture. Strokes are recorded as SVG
 * path data relative to the canvas's own measured size, so the resulting
 * vector signature reproduces faithfully via SignaturePreview regardless of
 * what width it's rendered at later. */
export function SignaturePad({ value, onChange, height = 160 }: SignaturePadProps) {
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [liveStroke, setLiveStroke] = useState('');
  const strokes = value?.strokes ?? [];

  const onLayout = (e: LayoutChangeEvent) => setCanvasWidth(e.nativeEvent.layout.width);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setLiveStroke(`M${locationX.toFixed(1)},${locationY.toFixed(1)}`);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setLiveStroke((prev) => `${prev} L${locationX.toFixed(1)},${locationY.toFixed(1)}`);
        },
        onPanResponderRelease: () => {
          setLiveStroke((prev) => {
            if (prev) {
              onChange({ w: canvasWidth || 320, h: height, strokes: [...strokes, prev] });
            }
            return '';
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [strokes, canvasWidth, height, onChange],
  );

  const isEmpty = strokes.length === 0 && !liveStroke;

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        onLayout={onLayout}
        {...panResponder.panHandlers}
        style={{
          height,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: colors.border,
          backgroundColor: colors.background,
          overflow: 'hidden',
        }}
      >
        <Svg width="100%" height={height}>
          {strokes.map((d, i) => (
            <Path key={i} d={d} stroke={colors.textPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {liveStroke ? (
            <Path d={liveStroke} stroke={colors.textPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>
        {isEmpty ? (
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Sign here with mouse or finger</Text>
          </View>
        ) : null}
      </View>
      <PrimaryButton label="Clear Signature" variant="outline" onPress={() => onChange(null)} disabled={isEmpty} />
    </View>
  );
}

interface SignaturePreviewProps {
  value: SignatureValue;
  height?: number;
}

/** Read-only playback of a captured signature, scaled via viewBox so it
 * reproduces correctly regardless of the container's actual pixel width. */
export function SignaturePreview({ value, height = 120 }: SignaturePreviewProps) {
  return (
    <View
      style={{
        height,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        overflow: 'hidden',
      }}
    >
      <Svg width="100%" height={height} viewBox={`0 0 ${value.w} ${value.h}`} preserveAspectRatio="xMidYMid meet">
        {value.strokes.map((d, i) => (
          <Path key={i} d={d} stroke={colors.textPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </Svg>
    </View>
  );
}
