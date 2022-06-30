// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

import { GanttContext } from '../context/gantt_context';
import { ExpandProvider } from '../context/expand_context';

import SidebarContainer from './sidebar_container';
import ScrollContainer from './scroll_container';
import GanttNode from './gantt_node';

const HEADER_HEIGHT = 40;
export default class CalendarContent extends React.PureComponent {
  static propTypes = {
    handleScrollRef: PropTypes.func,
    onScroll: PropTypes.func,
    resizingItem: PropTypes.string,
    scrollHeight: PropTypes.number,
  };

  wrapperRef = (wrapper) => {
    this.wrapper = wrapper;
  };

  renderColumns = (columnWidth, intervals) => {
    return (
      <div className="content-columns">
        {intervals.map((item) => {
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

  renderItems = (groups, calendarTimeStart, calendarTimeEnd, calendarWidth) => {
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
                  groupId={group.id}
                  unitWidth={unitWidth}
                  isGroupTop={isGroupTop}
                  channelRelations={group.channelRelations}
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
        {({
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
        }) => {
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
