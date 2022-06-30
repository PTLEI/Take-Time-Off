// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

import { GanttContext } from '../context/gantt_context';

export default class CalendarHeader extends React.PureComponent {
  static propTypes = {
    handleHeaderRef: PropTypes.func,
  };

  render() {
    return (
      <GanttContext.Consumer>
        {({ sidebarWidth, contentVisibleWidth, columnWidth, intervals }) => {
          let sidebarHeader;
          if (sidebarWidth) {
            sidebarHeader = (
              <div
                className="gantt-sidebar-header"
                style={{ width: sidebarWidth, borderRight: '1px solid #E8E8E8' }}
              />
            );
          }

          return (
            <div className="gantt-calendar-header">
              {sidebarHeader}
              <div
                ref={this.props.handleHeaderRef}
                className="gantt-date-header"
                style={{ width: contentVisibleWidth }}
              >
                {intervals.map((item) => {
                  let baseClassName = 'gannt-columns gantt-date-header-items';
                  if (item.extraClassName) {
                    baseClassName = baseClassName + ' ' + item.extraClassName;
                  }
                  return (
                    <div
                      key={item.startTime}
                      className={baseClassName}
                      style={{ width: columnWidth }}
                    >
                      {item.dateText}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </GanttContext.Consumer>
    );
  }
}
