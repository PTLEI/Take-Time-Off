// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';
import { message, Modal } from 'antd';

import {
  getInitVisibleDateRange,
  getCalendarBoundariesFromVisibleTime,
  getGridNumber,
  iterateTimes,
  calculateScrollCalendar,
} from 'utils/calendar_utils';
import { DATE_PERIOD } from 'utils/constant/channel';

import { GanttContext } from './context/gantt_context';
import CalendarHeader from './components/calendar_header';
import CalendarContent from './components/calendar_content';

const CALENDAR_SCREEN = 3;

export default class ChannelViewGantt extends React.PureComponent {
  static propTypes = {
    // 初始化的可见开始时间
    initVisibleTimeStart: PropTypes.number,

    /**
     * 组件渲染所需的数据来源
     */
    channelsProfile: PropTypes.object,
    channelComputedInfo: PropTypes.object,

    /**
     * groupItem: {id, groupName, treeIds, channelRelations}
     */
    groups: PropTypes.array,

    /**
     * 自定义日历变更处理
     */
    onTimeChange: PropTypes.func,

    /**
     * 日历渲染区间的回调，params: calendarTimeStart, calendarTimeEnd,
     */
    onBoundsChange: PropTypes.func,

    /**
     * 日历可见区间的回调，params: visibleTimeStart, visibleTimeEnd,
     */
    onVisibleTimeChange: PropTypes.func,

    onItemClick: PropTypes.func,
    onItemDoubleClick: PropTypes.func,

    /**
     * item的边界变更
     */
    onResizedItemEdge: PropTypes.func,

    /**
     * item的中间变更
     */
    onResizedItemMiddle: PropTypes.func,

    /**
     * 决定calendar距离边界多远时，加载新的calendar列表
     */
    reachedThreshold: PropTypes.number,

    /**
     * 日历模式 暂时只支持周、月, defaultValue: 'month'
     */
    datePeriod: PropTypes.string.isRequired,

    /**
     * defaultValue: 260
     */
    sidebarWidth: PropTypes.number.isRequired,

    /**
     * 提供甘特图可展示区域的高度。也可在外层组件定义高度，甘特图组件自身拥有height: 100%
     */
    scrollHeight: PropTypes.number,
  };

  static defaultProps = {
    onTimeChange: (visibleTimeStart, visibleTimeEnd, updateScrollCalendar) => {
      updateScrollCalendar(visibleTimeStart, visibleTimeEnd);
    },

    reachedThreshold: 0.5,
    datePeriod: DATE_PERIOD.MONTH,
    sidebarWidth: 260,
  };

  constructor(props) {
    super();

    const { datePeriod, sidebarWidth } = props;
    const { visibleTimeStart, visibleTimeEnd } = getInitVisibleDateRange(
      datePeriod,
      props.initVisibleTimeStart,
    );
    const { calendarTimeStart, calendarTimeEnd } = getCalendarBoundariesFromVisibleTime(
      visibleTimeStart,
      datePeriod,
    );

    const containerWidth = 830;
    const contentVisibleWidth = containerWidth - sidebarWidth;
    const calendarWidth = contentVisibleWidth * CALENDAR_SCREEN;
    const gridNumber = getGridNumber(datePeriod);
    const columnWidth = contentVisibleWidth / gridNumber;

    const intervals = iterateTimes(calendarTimeStart, calendarTimeEnd, datePeriod);

    this.state = {
      channelsProfile: props.channelsProfile,
      channelComputedInfo: props.channelComputedInfo,
      groups: props.groups,

      sidebarWidth,

      containerWidth,
      contentVisibleWidth,
      calendarWidth,
      columnWidth,

      datePeriod,
      visibleTimeStart,
      visibleTimeEnd,
      calendarTimeStart,
      calendarTimeEnd,
      intervals,

      resizingItem: '',
      handleResizingItem: this.handleResizingItem,
      onResizedItemEdge: this.onResizedItemEdge,
      onResizedItemMiddle: this.onResizedItemMiddle,

      draggingCalendar: false,
      onCalendarDragging: this.onCalendarDragging,

      onItemClick: props.onItemClick,
      onItemDoubleClick: props.onItemDoubleClick,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      state.groups !== props.groups ||
      state.channelsProfile !== props.channelsProfile ||
      state.channelComputedInfo !== props.channelComputedInfo
    ) {
      return {
        groups: props.groups,
        channelsProfile: props.channelsProfile,
        channelComputedInfo: props.channelComputedInfo,
      };
    }

    if (state.datePeriod !== props.datePeriod) {
      return { datePeriod: props.datePeriod };
    }
    return null;
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
    const { onBoundsChange, onVisibleTimeChange } = this.props;
    if (onBoundsChange) {
      onBoundsChange(this.state.calendarTimeStart, this.state.calendarTimeEnd);
    }
    if (onVisibleTimeChange) {
      onVisibleTimeChange(this.state.visibleTimeStart, this.state.visibleTimeEnd, false);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onBoundsChange && this.state.calendarTimeStart !== prevState.calendarTimeStart) {
      this.props.onBoundsChange(this.state.calendarTimeStart, this.state.calendarTimeEnd);
    }

    const newZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const oldZoom = prevState.visibleTimeEnd - prevState.visibleTimeStart;

    // Check the scroll is correct
    const scrollLeft = Math.round(
      this.state.contentVisibleWidth *
        ((this.state.visibleTimeStart - this.state.calendarTimeStart) / newZoom),
    );
    const componentScrollLeft = Math.round(
      prevState.contentVisibleWidth *
        ((prevState.visibleTimeStart - prevState.calendarTimeStart) / oldZoom),
    );

    if (componentScrollLeft !== scrollLeft) {
      this.scrollContainerRef.scrollLeft = scrollLeft;
      this.headerRef.scrollLeft = scrollLeft;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    const { width: containerWidth } = this.container.getBoundingClientRect();
    const { datePeriod } = this.props;
    const { visibleTimeStart } = this.state;

    const contentVisibleWidth = containerWidth - this.props.sidebarWidth;

    let changedState = { contentVisibleWidth };
    if (containerWidth !== this.state.containerWidth) {
      const calendarWidth = contentVisibleWidth * CALENDAR_SCREEN;
      const gridNumber = getGridNumber(datePeriod);
      const columnWidth = contentVisibleWidth / gridNumber;
      changedState = {
        ...changedState,
        containerWidth,
        calendarWidth,
        columnWidth,
      };
    }

    const { calendarTimeStart, calendarTimeEnd } = getCalendarBoundariesFromVisibleTime(
      visibleTimeStart,
      datePeriod,
    );
    if (calendarTimeStart !== this.state.calendarTimeStart) {
      const intervals = iterateTimes(calendarTimeStart, calendarTimeEnd);
      changedState = {
        ...changedState,
        calendarTimeStart,
        calendarTimeEnd,
        intervals,
      };
    }

    this.setState(changedState);

    this.scrollContainerRef.scrollLeft = contentVisibleWidth;
    this.headerRef.scrollLeft = contentVisibleWidth;
  };

  getContainerRef = (el) => {
    this.container = el;
  };

  getHeaderRef = (el) => {
    this.headerRef = el;
  };

  getScrollContainerRef = (el) => {
    this.scrollContainerRef = el;
  };

  onScroll = (scrollX) => {
    const zoom = this.state.visibleTimeEnd - this.state.visibleTimeStart;
    const visibleTimeStart =
      this.state.calendarTimeStart + zoom * (scrollX / this.state.contentVisibleWidth);
    const visibleTimeEnd = visibleTimeStart + zoom;

    if (
      this.state.visibleTimeStart !== visibleTimeStart ||
      this.state.visibleTimeEnd !== visibleTimeEnd
    ) {
      this.props.onTimeChange(visibleTimeStart, visibleTimeEnd, this.updateScrollCalendar);
      if (this.props.onVisibleTimeChange) {
        this.props.onVisibleTimeChange(visibleTimeStart, visibleTimeEnd, true);
      }
    }
  };

  updateScrollCalendar = (visibleTimeStart, visibleTimeEnd) => {
    this.setState(
      calculateScrollCalendar(visibleTimeStart, visibleTimeEnd, this.state, this.props),
    );
  };

  handleResizingItem = (itemId) => {
    this.setState({
      resizingItem: itemId,
    });
  };

  onResizedItemEdge = async (nodeId, edge, value, resetResize) => {
    if (this.props.onResizedItemEdge) {
      let hasEffect;

      if (hasEffect) {
        Modal.confirm({
          title: '拖动提示',
          content: '将影响其上级任务的起止时间，确定继续拖动吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.props.onResizedItemEdge(nodeId, edge, value, resetResize);
          },
          onCancel: () => {
            resetResize();
          },
          icon: null,
        });
      } else {
        this.props.onResizedItemEdge(nodeId, edge, value, resetResize);
      }
    } else {
      resetResize();
    }
  };

  onResizedItemMiddle = (nodeId, value, resetResize) => {
    if (this.props.onResizedItemMiddle) {
      const { channelsProfile } = this.props;
      const changedProfile = channelsProfile[nodeId];
      this.props.onResizedItemMiddle(changedProfile, value, resetResize);
    } else {
      resetResize();
    }
  };

  onCalendarDragging = (dragging) => {
    this.setState({
      draggingCalendar: dragging,
    });
  };

  render() {
    if (!this.props.channelsProfile || !this.props.channelComputedInfo) {
      return (
        <div
          ref={this.getContainerRef}
          id="channel-Gantt_diagram"
          className="channel-view-gantt-diagram"
        />
      );
    }
    return (
      <GanttContext.Provider value={this.state}>
        <div
          ref={this.getContainerRef}
          id="channel-Gantt_diagram"
          className="channel-view-gantt-diagram"
        >
          <CalendarHeader handleHeaderRef={this.getHeaderRef} />
          <CalendarContent
            handleScrollRef={this.getScrollContainerRef}
            onScroll={this.onScroll}
            resizingItem={this.state.resizingItem}
            scrollHeight={this.props.scrollHeight}
          />
        </div>
      </GanttContext.Provider>
    );
  }
}
