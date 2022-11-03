import React, { useState, useEffect, useRef } from 'react';
import { changeOpacity } from '../utils/utils';

import Icon from 'components/icon';

export interface GanttRowProps {
  id: string;

  /**
   * hover 提示
   */
  tipTitle?: string;

  /**
   * 自定义百分比Bar的主色
   */
  percentageColor: string;

  /**
   * 任务百分比
   */
  percentage: number;

  offset: number;
  width: number;
  resizingItem?: string;
  handleResizingItem: Function;
  onResizedItem?: Function;
  draggingCalendar?: boolean;

  handleClick?: Function;
  handleDoubleClick?: Function;
  rowStyle?: object;
  operable?: boolean;
}

const defaultProps: Partial<GanttRowProps> = {
  rowStyle: {},
};

const GanttRow: React.FC<GanttRowProps> = (props) => {
  const {
    id,
    tipTitle,
    percentageColor,
    percentage,
    offset,
    width,
    resizingItem,
    handleResizingItem,
    onResizedItem,
    draggingCalendar,
    handleClick,
    handleDoubleClick,
    rowStyle,
    operable,
  } = props;
  const [isDraggingItem, setDragging] = useState(false);
  const [edge, setEdge] = useState('');
  const [draggingOffset, setOffset] = useState(0);

  const clickItemTrigger = useRef<number | null>(null);
  const afterDragging = useRef(false);
  const dragStartPosition = useRef(0);

  useEffect(() => {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isDraggingItem) {
      const handlePointX = e.pageX;
      setOffset(handlePointX - dragStartPosition.current);
    }
  };

  const handleGlobalMouseUp = async () => {
    if (isDraggingItem) {
      afterDragging.current = true;

      // 避免resized的计算过程draggingOffset被更改，但如果忽略误差也可去掉await
      await setDragging(false);
      if (draggingOffset && onResizedItem) {
        onResizedItem(edge, draggingOffset, resetResize);
      } else {
        resetResize();
      }
    }
  };

  const resetResize = () => {
    setEdge('');
    setOffset(0);
    handleResizingItem('');
    dragStartPosition.current = 0;
  };

  const handleClickItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (clickItemTrigger.current || afterDragging.current) {
      afterDragging.current = false;
      return;
    }

    clickItemTrigger.current = window.setTimeout(() => {
      clickItemTrigger.current = null;
      if (handleClick) {
        handleClick(id);
      }
    }, 200);
  };

  const handleDoubleClickItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (clickItemTrigger.current) {
      clearTimeout(clickItemTrigger.current);
      clickItemTrigger.current = null;
      if (handleDoubleClick) {
        handleDoubleClick(id);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, edge: string) => {
    if (resizingItem) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setEdge(edge);
    handleResizingItem(id);
    dragStartPosition.current = e.pageX;
  };

  // 阻止在item上发生Drag Calendar事件后触发的Item Click事件
  const onItemMouseUp = () => {
    if (draggingCalendar) {
      afterDragging.current = true;
    }
  };

  const renderDragBtn = (btnPosition: 'left' | 'right' | 'middle', progressWidth = 0) => {
    let extraStyle;
    let extraIcon;
    if (btnPosition === 'left') {
      extraStyle = { left: 0, transform: 'translateX(-50%)' };
    } else if (btnPosition === 'right') {
      extraStyle = { right: 0, transform: 'translateX(50%)' };
    } else if (btnPosition === 'middle') {
      extraStyle = {
        left: `${progressWidth}px`,
        transform: 'translateX(-10px)',
        fontSize: '20px',
        color: '#C6C6C6',
        bottom: isDraggingItem ? '-15px' : '-13px',
        top: 'unset',
        zIndex: 2,
      };
      extraIcon = <Icon type="solid_arrow-up" />;
    } else {
      return null;
    }
    return (
      <div
        className="gantt-row-drag-btn"
        onMouseDown={(e) => handleMouseDown(e, btnPosition)}
        style={extraStyle}
      >
        {extraIcon}
      </div>
    );
  };

  let progressWidth: number;
  if (percentage >= 100) {
    progressWidth = width;
  } else if (percentage < 0) {
    return null;
  } else {
    progressWidth = Math.round(width * (percentage / 100));
  }

  let draggingBorderWidth = 0;
  if (isDraggingItem) {
    progressWidth -= 2;
    draggingBorderWidth = 2;
  }

  let itemWidth = width || 1;
  if (progressWidth <= 0 && percentage) {
    progressWidth = 1;
  }

  let itemOffset = offset;

  if (edge === 'left') {
    const calculateOffset = draggingOffset >= itemWidth ? itemWidth - 1 : draggingOffset;
    itemOffset += calculateOffset;
    itemWidth -= calculateOffset;
  } else if (edge === 'right') {
    const progressRatio = progressWidth / itemWidth;
    itemWidth += draggingOffset;
    itemWidth = itemWidth >= 1 ? itemWidth : 1;
    progressWidth = itemWidth * progressRatio;
  } else if (edge === 'middle') {
    progressWidth += draggingOffset;
    progressWidth = progressWidth < 0 ? 0 : progressWidth;
    progressWidth = progressWidth > itemWidth ? itemWidth : progressWidth;
  }

  let operation;
  if (operable) {
    operation = (
      <>
        {renderDragBtn('left')}
        {renderDragBtn('middle', progressWidth)}
        {renderDragBtn('right')}
      </>
    );
  }

  return (
    <div className="gantt-row-item" style={{ ...rowStyle }}>
      <div
        className="gantt-row-item-bar"
        style={{
          color: percentageColor,
          marginLeft: itemOffset,
          width: itemWidth,
          borderStyle: 'solid',
          borderColor: changeOpacity(percentageColor, 0.4),
          borderWidth: `${draggingBorderWidth}px`,
          boxShadow: isDraggingItem ? '0 2px 16px rgba(0, 0, 0, .1)' : '',
        }}
        onClick={handleClickItem}
        onDoubleClick={handleDoubleClickItem}
        onMouseUp={onItemMouseUp}
      >
        <div
          style={{
            backgroundImage: `linear-gradient(to right,
                              ${changeOpacity(percentageColor, 0.4)},
                              ${changeOpacity(percentageColor, 0.4)} ${progressWidth}px,
                              ${changeOpacity(percentageColor, 0.08)} ${progressWidth}px,
                              ${changeOpacity(percentageColor, 0.08)}
                          )`,
            width: '100%',
            borderRadius: '20px',
          }}
        >
          <div className="gantt-row-bar-text">
            {`${percentage}%`}
            <span>{tipTitle}</span>
          </div>
          {operation}
        </div>
      </div>
    </div>
  );
};

GanttRow.defaultProps = defaultProps;
export default GanttRow;
