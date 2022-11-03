import React from 'react';

import {
  getInitVisibleDateRange,
  getCalendarBoundariesFromVisibleTime,
  getGridNumber,
  iterateTimes,
  calculateScrollCalendar,
  DATE_PERIOD,
} from './utils/calendar_utils';

import { GanttContext } from './context/gantt_context';
import CalendarHeader from './components/calendar_header';
import CalendarContent from './components/calendar_content';
import { EdgeType, NodeItemType, GruopItem } from './types';
import { IntervalItemType } from './types/calendar';

const CALENDAR_SCREEN = 3;

export type Props = {
  initVisibleTimeStart: number;

  /**
   * 组件渲染所需的数据来源
   */
  dataMap?: Record<string, NodeItemType>;

  /**
   *
   */
  groups?: GruopItem[];

  /**
   * 自定义日历变更处理
   */
  onTimeChange: (
    startTime: number,
    endTime: number,
    updateScrollCalendar: (visibleTimeStart: number, visibleTimeEnd: number) => void,
  ) => void;

  /**
   * 日历渲染区间的回调
   */
  onBoundsChange: (calendarTimeStart: number, calendarTimeEnd: number) => void;

  /**
   * 日历可见区间的回调
   */
  onVisibleTimeChange: (
    visibleTimeStart: number,
    visibleTimeEnd: number,
    triggerByScroll: boolean,
  ) => void;

  onItemClick?: (id: string) => void;
  onItemDoubleClick?: (id: string) => void;

  /**
   * item的边界变更
   */
  onResizedItemEdge?: (
    nodeId: string,
    edge: EdgeType,
    value: number,
    resetResize: () => void,
  ) => void;

  /**
   * item的中间变更
   */
  onResizedItemMiddle?: (nodeId: string, percent: number, resetResize: () => void) => void;

  /**
   * 决定calendar距离边界多远时，加载新的calendar列表
   */
  reachedThreshold: number;

  /**
   * 日历模式 暂时只支持周、月, defaultValue: 'month'
   */
  datePeriod: 'month' | 'week';

  /**
   * defaultValue: 260
   */
  sidebarWidth: number;

  /**
   * 提供甘特图可展示区域的高度。也可在外层组件定义高度，甘特图组件自身拥有height: 100%
   */
  scrollHeight: number;
};

export type State = {
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
  draggingCalendar: boolean;
};

export default class ChannelViewGantt extends React.PureComponent<Props, State> {
  static defaultProps = {
    onTimeChange: (visibleTimeStart: number, visibleTimeEnd: number, updateScrollCalendar: any) => {
      updateScrollCalendar(visibleTimeStart, visibleTimeEnd);
    },
    reachedThreshold: 0.5,
    datePeriod: DATE_PERIOD.MONTH,
    sidebarWidth: 260,
  };

  constructor(props: Props) {
    super(props);

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
      containerWidth,
      contentVisibleWidth,
      calendarWidth,
      columnWidth,

      visibleTimeStart,
      visibleTimeEnd,
      calendarTimeStart,
      calendarTimeEnd,
      intervals,

      resizingItem: '',

      draggingCalendar: false,
    };
  }

  container: HTMLDivElement | null = null;
  headerRef: HTMLDivElement | null = null;
  scrollContainerRef: HTMLDivElement | null = null;

  componentDidMount(): void {
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

  componentDidUpdate(prevProps: Props, prevState: State): void {
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
      if (this.scrollContainerRef) {
        this.scrollContainerRef.scrollLeft = scrollLeft;
      }
      if (this.headerRef) {
        this.headerRef.scrollLeft = scrollLeft;
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    if (this.container) {
      const { width: containerWidth } = this.container.getBoundingClientRect();
      const { datePeriod } = this.props;
      const { visibleTimeStart } = this.state;

      const contentVisibleWidth = containerWidth - this.props.sidebarWidth;

      this.setState({ contentVisibleWidth });
      if (containerWidth !== this.state.containerWidth) {
        const calendarWidth = contentVisibleWidth * CALENDAR_SCREEN;
        const gridNumber = getGridNumber(datePeriod);
        const columnWidth = contentVisibleWidth / gridNumber;
        this.setState({
          containerWidth,
          calendarWidth,
          columnWidth,
        });
      }

      const { calendarTimeStart, calendarTimeEnd } = getCalendarBoundariesFromVisibleTime(
        visibleTimeStart,
        datePeriod,
      );
      if (calendarTimeStart !== this.state.calendarTimeStart) {
        const intervals = iterateTimes(calendarTimeStart, calendarTimeEnd);
        this.setState({
          calendarTimeStart,
          calendarTimeEnd,
          intervals,
        });
      }

      if (this.scrollContainerRef) {
        this.scrollContainerRef.scrollLeft = contentVisibleWidth;
      }
      if (this.headerRef) {
        this.headerRef.scrollLeft = contentVisibleWidth;
      }
    }
  };

  getContainerRef = (el: HTMLDivElement) => {
    this.container = el;
  };

  getHeaderRef = (el: HTMLDivElement) => {
    this.headerRef = el;
  };

  getScrollContainerRef = (el: HTMLDivElement) => {
    this.scrollContainerRef = el;
  };

  onScroll = (scrollX: number) => {
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

  updateScrollCalendar = (visibleTimeStart: number, visibleTimeEnd: number) => {
    this.setState({ visibleTimeStart, visibleTimeEnd });

    this.setState(
      calculateScrollCalendar({
        visibleTimeStart,
        visibleTimeEnd,
        originCalendarTimeStart: this.state.calendarTimeStart,
        datePeriod: this.props.datePeriod,
        reachedThreshold: this.props.reachedThreshold,
      }),
    );
  };

  handleResizingItem = (itemId: string) => {
    this.setState({
      resizingItem: itemId,
    });
  };

  onResizedItemEdge = (nodeId: string, edge: EdgeType, value: number, resetResize: () => void) => {
    if (this.props.onResizedItemEdge) {
      this.props.onResizedItemEdge(nodeId, edge, value, resetResize);
    } else {
      resetResize();
    }
  };

  onResizedItemMiddle = (nodeId: string, percent: number, resetResize: () => void) => {
    if (this.props.onResizedItemMiddle) {
      this.props.onResizedItemMiddle(nodeId, percent, resetResize);
    } else {
      resetResize();
    }
  };

  onCalendarDragging = (dragging?: boolean) => {
    if (dragging !== undefined) {
      this.setState({
        draggingCalendar: dragging,
      });
    }
  };

  render() {
    if (!this.props.groups || !this.props.dataMap) {
      return (
        <div
          ref={this.getContainerRef}
          id="channel-Gantt_diagram"
          className="channel-view-gantt-diagram"
        />
      );
    }
    const {
      containerWidth,
      contentVisibleWidth,
      calendarWidth,
      columnWidth,
      visibleTimeStart,
      visibleTimeEnd,
      calendarTimeStart,
      calendarTimeEnd,
      intervals,
      resizingItem,
      draggingCalendar,
    } = this.state;
    return (
      <GanttContext.Provider
        value={{
          groups: this.props.groups,
          dataMap: this.props.dataMap,
          sidebarWidth: this.props.sidebarWidth,

          containerWidth,
          contentVisibleWidth,
          calendarWidth,
          columnWidth,

          visibleTimeStart,
          visibleTimeEnd,
          calendarTimeStart,
          calendarTimeEnd,
          intervals,
          resizingItem,

          handleResizingItem: this.handleResizingItem,
          onResizedItemEdge: this.onResizedItemEdge,
          onResizedItemMiddle: this.onResizedItemMiddle,

          draggingCalendar,
          onCalendarDragging: this.onCalendarDragging,

          onItemClick: this.props.onItemClick,
          onItemDoubleClick: this.props.onItemDoubleClick,
        }}
      >
        <div
          ref={this.getContainerRef}
          id="channel-Gantt_diagram"
          className="channel-view-gantt-diagram"
        >
          <CalendarHeader ref={this.getHeaderRef} />
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
