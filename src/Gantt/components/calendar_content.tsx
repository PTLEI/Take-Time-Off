import React from 'react';

import { GanttContext } from '../context/gantt_context';
import { ExpandProvider } from '../context/expand_context';
import { GruopItem } from '../types';
import { IntervalItemType } from '../types/calendar';

import SidebarContainer from './sidebar_container';
import ScrollContainer from './scroll_container';
import GanttNode from './gantt_node';

const HEADER_HEIGHT = 40;

type Props = {
  handleScrollRef: (element: HTMLDivElement) => void;
  onScroll: (scrollX: number) => void;
  resizingItem: string;
  scrollHeight: number;
};
export default class CalendarContent extends React.PureComponent<Props> {
  wrapper: HTMLDivElement | null = null;
  wrapperRef = (wrapper: HTMLDivElement) => {
    this.wrapper = wrapper;
  };

  renderColumns = (columnWidth?: number, intervals?: IntervalItemType[]) => {
    return (
      <div className="content-columns">
        {intervals?.map((item) => {
          let baseClassName = 'gannt-columns';
          if (item.extraClassName) {
            baseClassName = baseClassName + ' ' + item.extraClassName;
          }
          return (
            <div
              className={baseClassName}
              key={item.startTime}
              style={{
                width: columnWidth,
                height: '100%',
              }}
            />
          );
        })}
      </div>
    );
  };

  renderItems = (
    groups: GruopItem[] = [],
    calendarTimeStart: number,
    calendarTimeEnd: number,
    calendarWidth: number,
  ) => {
    const unitWidth = calendarWidth / (calendarTimeEnd - calendarTimeStart);
    return (
      <div className="content-rows">
        {groups.map((group, groupIndex) => {
          if (group && group.treeIds && group.treeIds.length) {
            const treeIds = group.treeIds;
            return treeIds.map((treeId, treeIndex) => {
              let isGroupTop;
              if (groupIndex !== 0 && treeIndex === 0) {
                isGroupTop = true;
              }
              return (
                <GanttNode
                  key={treeId}
                  nodeId={treeId}
                  unitWidth={unitWidth}
                  isGroupTop={isGroupTop}
                />
              );
            });
          }
          return null;
        })}
      </div>
    );
  };

  render() {
    return (
      <GanttContext.Consumer>
        {(context) => {
          if (!context) {
            return null;
          }
          const {
            groups,

            sidebarWidth,
            contentVisibleWidth,
            calendarWidth,
            columnWidth,

            calendarTimeStart,
            calendarTimeEnd,
            intervals,

            draggingCalendar,
            onCalendarDragging,
          } = context;
          let sidebar;
          if (sidebarWidth) {
            sidebar = <SidebarContainer sidebarWidth={sidebarWidth} groups={groups} />;
          }
          const { scrollHeight } = this.props;
          let extraStyle;
          if (scrollHeight) {
            extraStyle = { maxHeight: scrollHeight - HEADER_HEIGHT };
          }

          return (
            <ExpandProvider>
              <div
                ref={this.wrapperRef}
                className="gantt-calendar-content-wrapper"
                style={extraStyle}
              >
                <div className="gantt-calendar-content">
                  {sidebar}
                  <ScrollContainer
                    contentRef={this.wrapper}
                    scrollRef={this.props.handleScrollRef}
                    onScroll={this.props.onScroll}
                    draggingCalendar={draggingCalendar}
                    onCalendarDragging={onCalendarDragging}
                    isInteractingWithItem={Boolean(this.props.resizingItem)}
                    width={contentVisibleWidth}
                  >
                    <div className="calendar-render-area" style={{ width: calendarWidth }}>
                      {this.renderColumns(columnWidth, intervals)}
                      {this.renderItems(groups, calendarTimeStart, calendarTimeEnd, calendarWidth)}
                    </div>
                  </ScrollContainer>
                </div>
              </div>
            </ExpandProvider>
          );
        }}
      </GanttContext.Consumer>
    );
  }
}
