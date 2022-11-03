import React, { useContext } from 'react';

import { GanttContext } from '../context/gantt_context';

const CalendarHeader = React.forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => {
  const context = useContext(GanttContext);
  if (!context) {
    return null;
  }
  const { sidebarWidth, contentVisibleWidth, columnWidth, intervals } = context;

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
      <div ref={ref} className="gantt-date-header" style={{ width: contentVisibleWidth }}>
        {intervals?.map((item) => {
          let baseClassName = 'gannt-columns gantt-date-header-items';
          if (item.extraClassName) {
            baseClassName = baseClassName + ' ' + item.extraClassName;
          }
          return (
            <div key={item.startTime} className={baseClassName} style={{ width: columnWidth }}>
              {item.dateText}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CalendarHeader;
