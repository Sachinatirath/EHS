import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface FadeSlideInProps {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

// Lightweight entrance animation for headers/section titles — same
// fade + rise used by StaggeredItem, without the list-index stagger.
export function FadeSlideIn({ children, delay = 0, distance = 12, style }: FadeSlideInProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
