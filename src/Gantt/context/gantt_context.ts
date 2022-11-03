import * as React from 'react';
import { IntervalItemType } from '../types/calendar';
import { EdgeType, NodeItemType, GruopItem } from '../types';

export interface GlobalState {
  groups?: GruopItem[];
  dataMap?: Record<string, NodeItemType>;
  sidebarWidth: number;

  containerWidth: number;
  contentVisibleWidth: number;
  calendarWidth: number;
  columnWidth: number;

  visibleTimeStart: number;
  visibleTimeEnd: number;
  calendarTimeStart: number;
  calendarTimeEnd: number;
  intervals: IntervalItemType[];

  resizingItem: string;
  handleResizingItem: (id: string) => void;
  onResizedItemEdge: (
    nodeId: string,
    edge: EdgeType,
    value: number,
    resetResize: () => void,
  ) => void;
  onResizedItemMiddle: (nodeId: string, percent: number, resetResize: () => void) => void;

  draggingCalendar: boolean;
  onCalendarDragging: (dragging: boolean) => void;

  onItemClick?: (id: string) => void;
  onItemDoubleClick?: (id: string) => void;
}

export const GanttContext = React.createContext<GlobalState | null>(null);
