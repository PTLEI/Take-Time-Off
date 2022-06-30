// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';
import { changeOpacity } from 'utils/utils';

import Icon from 'components/icon';

export default class GanttRow extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,

    /**
     * hover 提示
     */
    tipTitle: PropTypes.string,

    /**
     * 自定义百分比Bar的主色
     * */
    percentageColor: PropTypes.string.isRequired,

    /**
     * 任务百分比
     */
    percentage: PropTypes.number.isRequired,

    offset: PropTypes.number.isRequired,

    width: PropTypes.number.isRequired,

    resizingItem: PropTypes.string,
    handleResizingItem: PropTypes.func.isRequired,
    onResizedItem: PropTypes.func,
    draggingCalendar: PropTypes.bool.isRequired,

    handleClick: PropTypes.func,

    handleDoubleClick: PropTypes.func,

    rowStyle: PropTypes.object,

    operable: PropTypes.bool,
  };

  static defaultProps = {
    rowStyle: {},
  };

  constructor() {
    super();

    this.state = {
      isDraggingItem: false,
      edge: '',
      draggingOffset: 0,
    };
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.handleGlobalMouseMove);
    document.addEventListener('mouseup', this.handleGlobalMouseUp);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.percentage !== prevProps.percentage ||
      this.props.width !== prevProps.width ||
      this.props.offset !== prevProps.offset
    ) {
      this.resetResize();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleGlobalMouseMove);
    document.removeEventListener('mouseup', this.handleGlobalMouseUp);

    if (this.props.id === this.props.resizingItem) {
      this.resetResize();
    }
  }

  // todo 组件杂糅事物逻辑，需拿出去
  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.clickItemTrigger || this.afterDragging) {
      this.afterDragging = false;
      return;
    }

    this.clickItemTrigger = setTimeout(() => {
      this.clickItemTrigger = null;
      const { handleClick, id } = this.props;
      if (handleClick) {
        handleClick(id);
      }
    }, 200);
  };

  handleDoubleClick = (e) => {
    e.preventDefault();
    if (this.clickItemTrigger) {
      clearTimeout(this.clickItemTrigger);
      this.clickItemTrigger = null;
      if (this.props.handleDoubleClick) {
        this.props.handleDoubleClick(this.props.id);
      }
    }
  };

  handleMouseDown = (e, edge) => {
    if (this.props.resizingItem) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      isDraggingItem: true,
      edge,
    });
    this.props.handleResizingItem(this.props.id);
    this.dragStartPosition = e.pageX;
  };

  handleGlobalMouseMove = (e) => {
    if (this.state.isDraggingItem) {
      const handlePointX = e.pageX;
      this.handleDraggingEdge(handlePointX - this.dragStartPosition);
    }
  };

  // todo 鼠标的偏移量在这里直接计算出需要的真实的偏移量
  handleDraggingEdge = (offset) => {
    this.setState({
      draggingOffset: offset,
    });
  };

  handleGlobalMouseUp = async () => {
    if (this.state.isDraggingItem) {
      this.afterDragging = true;

      // 避免resized的计算过程draggingOffset被更改，但如果忽略误差也可去掉await
      await this.setState({ isDraggingItem: false });
      const { edge, draggingOffset } = this.state;
      if (draggingOffset) {
        this.props.onResizedItem(edge, draggingOffset, this.resetResize);
      } else {
        this.resetResize();
      }
    }
  };

  resetResize = () => {
    this.setState({
      edge: '',
      draggingOffset: 0,
    });
    this.props.handleResizingItem('');
    this.dragStartPosition = 0;
  };

  // 阻止在item上发生Drag Calendar事件后触发的Item Click事件
  onItemMouseUp = () => {
    if (this.props.draggingCalendar) {
      this.afterDragging = true;
    }
  };

  renderDragBtn = (btnPosition, progressWidth = 0) => {
    const { isDraggingItem } = this.state;
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
        onMouseDown={(e) => this.handleMouseDown(e, btnPosition)}
        style={extraStyle}
      >
        {extraIcon}
      </div>
    );
  };

  render() {
    const { tipTitle, percentageColor, offset, width, percentage, rowStyle, operable } = this.props;
    const { draggingOffset, edge, isDraggingItem } = this.state;

    let progressWidth;
    if (percentage >= 100) {
      progressWidth = width;
    } else if (percentage < 0) {
      return null;
    } else {
      progressWidth = Math.round(width * (percentage / 100));
    }

    let draggingBorderWidth = 0;
    if (this.state.isDraggingItem) {
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
          {this.renderDragBtn('left')}
          {this.renderDragBtn('middle', progressWidth)}
          {this.renderDragBtn('right')}
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
          onClick={this.handleClick}
          onDoubleClick={this.handleDoubleClick}
          onMouseUp={this.onItemMouseUp}
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
  }
}
