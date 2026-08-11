import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'list'
  | 'bell'
  | 'user'
  | 'checkCircle'
  | 'camera'
  | 'search'
  | 'chevronRight'
  | 'chevronDown'
  | 'plus'
  | 'alertTriangle'
  | 'xCircle'
  | 'clock'
  | 'filter'
  | 'download'
  | 'mail'
  | 'logout'
  | 'arrowLeft'
  | 'image'
  | 'shield'
  | 'clipboard'
  | 'check'
  | 'x'
  | 'refresh'
  | 'history'
  | 'chevronLeft'
  | 'eye'
  | 'eyeOff'
  | 'edit'
  | 'users'
  | 'building';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 22, color = '#0F172A', strokeWidth = 2 }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...common}>
          <Path d="M3 11.5 12 4l9 7.5" />
          <Path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </Svg>
      );
    case 'list':
      return (
        <Svg {...common}>
          <Line x1="8" y1="6" x2="20" y2="6" />
          <Line x1="8" y1="12" x2="20" y2="12" />
          <Line x1="8" y1="18" x2="20" y2="18" />
          <Circle cx="4" cy="6" r="1" />
          <Circle cx="4" cy="12" r="1" />
          <Circle cx="4" cy="18" r="1" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...common}>
          <Path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <Path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7" />
        </Svg>
      );
    case 'users':
      return (
        <Svg {...common}>
          <Circle cx="9" cy="8" r="3.2" />
          <Path d="M2.5 19c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" />
          <Path d="M16 5.3c1.4.5 2.4 1.8 2.4 3.2 0 1.4-1 2.7-2.4 3.2" />
          <Path d="M18.5 13.3c2 .7 3.5 2.6 3.5 5.2" />
        </Svg>
      );
    case 'checkCircle':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="9" />
          <Polyline points="8.5 12.5 11 15 15.5 9" />
        </Svg>
      );
    case 'building':
      return (
        <Svg {...common}>
          <Rect x="4" y="3" width="16" height="18" rx="1" />
          <Line x1="9" y1="7" x2="9" y2="7.01" />
          <Line x1="15" y1="7" x2="15" y2="7.01" />
          <Line x1="9" y1="11" x2="9" y2="11.01" />
          <Line x1="15" y1="11" x2="15" y2="11.01" />
          <Path d="M9 21v-4h6v4" />
        </Svg>
      );
    case 'camera':
      return (
        <Svg {...common}>
          <Path d="M4 8a2 2 0 0 1 2-2h1.2l1-1.6A1 1 0 0 1 9 4h6a1 1 0 0 1 .8.4l1 1.6H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <Circle cx="12" cy="13" r="3.5" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx="11" cy="11" r="7" />
          <Line x1="20" y1="20" x2="16.2" y2="16.2" />
        </Svg>
      );
    case 'chevronRight':
      return (
        <Svg {...common}>
          <Polyline points="9 6 15 12 9 18" />
        </Svg>
      );
    case 'chevronDown':
      return (
        <Svg {...common}>
          <Polyline points="6 9 12 15 18 9" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...common}>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </Svg>
      );
    case 'alertTriangle':
      return (
        <Svg {...common}>
          <Path d="M12 4 2.5 20h19Z" />
          <Line x1="12" y1="10" x2="12" y2="14.5" />
          <Line x1="12" y1="17" x2="12" y2="17.01" />
        </Svg>
      );
    case 'xCircle':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="9" />
          <Line x1="9" y1="9" x2="15" y2="15" />
          <Line x1="15" y1="9" x2="9" y2="15" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="9" />
          <Polyline points="12 7 12 12 15.5 14" />
        </Svg>
      );
    case 'filter':
      return (
        <Svg {...common}>
          <Path d="M4 5h16l-6 8v6l-4 2v-8Z" />
        </Svg>
      );
    case 'download':
      return (
        <Svg {...common}>
          <Path d="M12 4v11" />
          <Polyline points="7.5 11 12 15.5 16.5 11" />
          <Path d="M5 19h14" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg {...common}>
          <Rect x="3" y="5" width="18" height="14" rx="2" />
          <Path d="m3.5 6 8.5 7 8.5-7" />
        </Svg>
      );
    case 'logout':
      return (
        <Svg {...common}>
          <Path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
          <Line x1="10" y1="12" x2="21" y2="12" />
          <Polyline points="14.5 8 21 12 14.5 16" />
          <Path d="M10 12H3" />
        </Svg>
      );
    case 'arrowLeft':
      return (
        <Svg {...common}>
          <Line x1="19" y1="12" x2="5" y2="12" />
          <Polyline points="11 6 5 12 11 18" />
        </Svg>
      );
    case 'image':
      return (
        <Svg {...common}>
          <Rect x="3" y="4" width="18" height="16" rx="2" />
          <Circle cx="9" cy="10" r="1.75" />
          <Path d="m4 18 5.5-5.5a2 2 0 0 1 2.8 0L14 14.5" />
          <Path d="m13.5 15.5 2-2a2 2 0 0 1 2.8 0L21 16" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...common}>
          <Path d="M12 3.5 5 6.5v5c0 5 3 8 7 9 4-1 7-4 7-9v-5Z" />
        </Svg>
      );
    case 'clipboard':
      return (
        <Svg {...common}>
          <Rect x="6" y="4" width="12" height="17" rx="2" />
          <Rect x="9" y="2.5" width="6" height="3" rx="1" />
          <Line x1="9" y1="11" x2="15" y2="11" />
          <Line x1="9" y1="15" x2="15" y2="15" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Polyline points="5 12.5 9.5 17 19 6.5" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...common}>
          <Line x1="6" y1="6" x2="18" y2="18" />
          <Line x1="18" y1="6" x2="6" y2="18" />
        </Svg>
      );
    case 'refresh':
      return (
        <Svg {...common}>
          <Path d="M4 12a8 8 0 0 1 13.7-5.7L20 8" />
          <Polyline points="20 3 20 8 15 8" />
          <Path d="M20 12a8 8 0 0 1-13.7 5.7L4 16" />
          <Polyline points="4 21 4 16 9 16" />
        </Svg>
      );
    case 'history':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="13" r="8" />
          <Polyline points="12 9 12 13 15 15" />
          <Path d="M5 4 3 7M19 4l2 3" />
        </Svg>
      );
    case 'chevronLeft':
      return (
        <Svg {...common}>
          <Polyline points="15 6 9 12 15 18" />
        </Svg>
      );
    case 'eye':
      return (
        <Svg {...common}>
          <Path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case 'eyeOff':
      return (
        <Svg {...common}>
          <Path d="M3.5 3.5l17 17" />
          <Path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.2 0 10 7 10 7a15.5 15.5 0 0 1-3.4 4.1M6.6 6.6C4 8.3 2 12 2 12s3.8 7 10 7c1.3 0 2.5-.3 3.5-.7" />
          <Path d="M9.5 9.8a3 3 0 0 0 4.2 4.2" />
        </Svg>
      );
    case 'edit':
      return (
        <Svg {...common}>
          <Path d="M4 20l1-4.2L15.6 5.2a1.5 1.5 0 0 1 2.1 0l1.1 1.1a1.5 1.5 0 0 1 0 2.1L8.2 19 4 20Z" />
          <Line x1="14.2" y1="6.6" x2="17.4" y2="9.8" />
        </Svg>
      );
    default:
      return null;
  }
}
