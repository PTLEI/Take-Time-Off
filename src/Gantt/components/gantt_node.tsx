import React from 'react';

import { GanttContext } from '../context/gantt_context';
import { NodeItemType } from '../types';

import GanttRow from './gantt_row';

export interface NodeProps {
  node: NodeItemType;
  unitWidth: number;
  isGroupTop?: boolean;

  calendarTimeStart?: number;

  resizingItem?: string;
  handleResizingItem: Function;
  onResizedItemEdge: Function;
  onResizedItemMiddle: Function;
  onItemClick?: Function;
  onItemDoubleClick?: Function;
  draggingCalendar?: boolean;
}

const GanttNode: React.FC<NodeProps> = (props) => {
  const {
    node,
    unitWidth,
    isGroupTop,
    calendarTimeStart,
    resizingItem,
    handleResizingItem,
    onResizedItemEdge,
    onResizedItemMiddle,
    onItemClick,
    onItemDoubleClick,
    draggingCalendar,
  } = props;
  const { id, title, percent, color, begin_at, end_at } = node;

  const onResizedItem = (
    edge: 'left' | 'right' | 'middle',
    draggingOffset: number,
    resetResize: () => void,
  ) => {
    const width = Math.round((end_at - begin_at) * unitWidth);
    if (edge === 'left') {
      const calculateOffset = draggingOffset >= width ? width - 1 : draggingOffset;
      const newBeginTime = begin_at + calculateOffset / unitWidth;
      onResizedItemEdge(id, edge, newBeginTime, resetResize);
    } else if (edge === 'right') {
      const calculateOffset = width + draggingOffset > 0 ? draggingOffset : 1 - width;
      const newEndTime = end_at + calculateOffset / unitWidth;
      onResizedItemEdge(id, edge, newEndTime, resetResize);
    } else if (edge === 'middle') {
      let percentWidth = Math.round(width * (percent / 100));
      percentWidth += draggingOffset;
      percentWidth = percentWidth < 0 ? 0 : percentWidth;
      percentWidth = percentWidth > width ? width : percentWidth;

      const newPercent = percentWidth / width;
      onResizedItemMiddle(id, newPercent, resetResize);
    }
  };

  let rowStyle;
  if (isGroupTop) {
    rowStyle = {
      borderTop: '1px solid #E8E8E8',
    };
  }
  if (!calendarTimeStart || !end_at || !begin_at) {
    return <div style={rowStyle} />;
  }

  // Todo 没有做 width 或 offset 数值过大的性能考虑
  const width = Math.round((end_at - begin_at) * unitWidth);
  const offset = Math.round((begin_at - calendarTimeStart) * unitWidth);

  return (
    <GanttRow
      id={node.id}
      offset={offset}
      width={width}
      percentage={percent}
      percentageColor={color || 'grey'}
      tipTitle={title}
      resizingItem={resizingItem}
      handleResizingItem={handleResizingItem}
      onResizedItem={onResizedItem}
      handleClick={onItemClick}
      handleDoubleClick={onItemDoubleClick}
      draggingCalendar={draggingCalendar}
      rowStyle={rowStyle}
      operable={node.operable}
    />
  );
};

export interface GanttNodeWrapperProps {
  nodeId: string;
  unitWidth: number;
  isGroupTop?: boolean;
}

const GanttNodeWrapper: React.FC<GanttNodeWrapperProps> = ({ nodeId, unitWidth, isGroupTop }) => {
  return (
    <GanttContext.Consumer>
      {(context) => {
        if (context) {
          const {
            dataMap,
            calendarTimeStart,

            resizingItem,
            handleResizingItem,
            onResizedItemEdge,
            onResizedItemMiddle,
            onItemClick,
            onItemDoubleClick,
            draggingCalendar,
          } = context;
          const node = dataMap?.[nodeId];
          if (!node) {
            return null;
          }
          return (
            <GanttNode
              node={node}
              unitWidth={unitWidth}
              isGroupTop={isGroupTop}
              calendarTimeStart={calendarTimeStart}
              resizingItem={resizingItem}
              handleResizingItem={handleResizingItem}
              onResizedItemEdge={onResizedItemEdge}
              onResizedItemMiddle={onResizedItemMiddle}
              onItemClick={onItemClick}
              onItemDoubleClick={onItemDoubleClick}
              draggingCalendar={draggingCalendar}
            />
          );
        }
      }}
    </GanttContext.Consumer>
  );
};

export default GanttNodeWrapper;
