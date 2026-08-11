import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextStyle, StyleProp } from 'react-native';

interface CountUpNumberProps {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
}

export function CountUpNumber({ value, style, duration = 700 }: CountUpNumberProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [value, duration, anim]);

  return <Text style={style}>{display}</Text>;
}
