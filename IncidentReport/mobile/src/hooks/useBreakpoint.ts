import { useWindowDimensions } from 'react-native';

// Breakpoints tuned for phone / tablet / desktop-web viewing of this app.
const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export interface BreakpointInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isTablet: boolean;
  isDesktop: boolean;
  isTabletUp: boolean;
  /** Ideal number of grid columns for stat rows / card grids at this width. */
  columns: number;
  /** Max content width to center the page at on wide screens. */
  contentMaxWidth: number;
}

export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint = width >= DESKTOP_MIN ? 'desktop' : width >= TABLET_MIN ? 'tablet' : 'phone';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const isTabletUp = isTablet || isDesktop;

  const columns = breakpoint === 'desktop' ? 4 : breakpoint === 'tablet' ? 3 : 2;
  const contentMaxWidth = breakpoint === 'desktop' ? 960 : breakpoint === 'tablet' ? 760 : width;

  return { width, height, breakpoint, isTablet, isDesktop, isTabletUp, columns, contentMaxWidth };
}
