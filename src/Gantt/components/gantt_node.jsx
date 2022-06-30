// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

import { ExpandConsumer } from '../context/expand_context';
import { GanttContext } from '../context/gantt_context';

import GanttRow from './gantt_row';
class GanttNode extends React.PureComponent {
  static propTypes = {
    nodeId: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    unitWidth: PropTypes.number.isRequired,
    isGroupTop: PropTypes.bool,
    channelRelations: PropTypes.object.isRequired,

    channelsProfile: PropTypes.object.isRequired,
    channelComputedInfo: PropTypes.object.isRequired,
    permissionsModifyTaskTime: PropTypes.object.isRequired,

    calendarWidth: PropTypes.number.isRequired,
    calendarTimeStart: PropTypes.number.isRequired,

    resizingItem: PropTypes.string.isRequired,
    handleResizingItem: PropTypes.func.isRequired,
    onResizedItemEdge: PropTypes.func.isRequired,
    onResizedItemMiddle: PropTypes.func.isRequired,
    onItemClick: PropTypes.func,
    onItemDoubleClick: PropTypes.func,
    draggingCalendar: PropTypes.bool,

    nodeExpand: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    channelRelations: {},
  };

  onResizedItem = (edge, draggingOffset, resetResize) => {
    const {
      channelsProfile,
      nodeId,
      unitWidth,
      channelComputedInfo,
      onResizedItemEdge,
      onResizedItemMiddle,
    } = this.props;
    const { percent } = channelComputedInfo[nodeId];
    const channelProfile = channelsProfile[nodeId];

    const width = Math.round((channelProfile.end_at - channelProfile.begin_at) * unitWidth);
    if (edge === 'left') {
      const calculateOffset = draggingOffset >= width ? width - 1 : draggingOffset;
      const newBeginTime = channelProfile.begin_at + calculateOffset / unitWidth;
      onResizedItemEdge(nodeId, edge, newBeginTime, resetResize);
    } else if (edge === 'right') {
      const calculateOffset = width + draggingOffset > 0 ? draggingOffset : 1 - width;
      const newEndTime = channelProfile.end_at + calculateOffset / unitWidth;
      onResizedItemEdge(nodeId, edge, newEndTime, resetResize);
    } else if (edge === 'middle') {
      let percentWidth = Math.round(width * (percent / 100));
      percentWidth += draggingOffset;
      percentWidth = percentWidth < 0 ? 0 : percentWidth;
      percentWidth = percentWidth > width ? width : percentWidth;

      const newPercent = percentWidth / width;
      onResizedItemMiddle(nodeId, newPercent, resetResize);
    }
  };

  render() {
    const {
      nodeId,
      groupId,
      unitWidth,
      isGroupTop,
      channelsProfile,
      channelRelations,
      channelComputedInfo,
      permissionsModifyTaskTime,

      calendarWidth,
      calendarTimeStart,

      resizingItem,
      handleResizingItem,
      onItemClick,
      onItemDoubleClick,
      draggingCalendar,

      nodeExpand,
    } = this.props;

    let rowStyle;
    if (isGroupTop) {
      rowStyle = {
        borderTop: '1px solid #E8E8E8',
      };
    }
    const channelProfile = channelsProfile[nodeId];
    if (!channelProfile || !channelProfile.end_at || !channelProfile.begin_at) {
      return <div style={rowStyle} />;
    }

    let children;
    if (channelRelations[nodeId] && nodeExpand) {
      children = channelRelations[nodeId].map((childId) => {
        return (
          <GanttNodeWrapper
            key={childId}
            nodeId={childId}
            groupId={groupId}
            unitWidth={this.props.unitWidth}
            channelRelations={channelRelations}
          />
        );
      });
    }

    const { percent, color } = channelComputedInfo[nodeId];

    // Todo 没有做 width 或 offset 数值过大的性能考虑
    const width = Math.round((channelProfile.end_at - channelProfile.begin_at) * unitWidth);
    const offset = Math.round((channelProfile.begin_at - calendarTimeStart) * unitWidth);
    const able = !permissionsModifyTaskTime[nodeId] || permissionsModifyTaskTime[nodeId].able;

    return (
      <>
        <GanttRow
          key={nodeId}
          id={nodeId}
          rowWidth={calendarWidth}
          offset={offset}
          width={width}
          percentage={percent}
          percentageColor={color}
          tipTitle={channelProfile.name}
          resizingItem={resizingItem}
          handleResizingItem={handleResizingItem}
          onResizedItem={this.onResizedItem}
          handleClick={onItemClick}
          handleDoubleClick={onItemDoubleClick}
          draggingCalendar={draggingCalendar}
          rowStyle={rowStyle}
          operable={channelProfile.participant && able}
          channelComputedInfo={channelComputedInfo[nodeId]}
        />
        {children}
      </>
    );
  }
}

const GanttNodeWrapper = ({ ...props }) => {
  return (
    <GanttContext.Consumer>
      {({
        channelsProfile,
        channelComputedInfo,
        permissionsModifyTaskTime,

        calendarWidth,
        calendarTimeStart,

        resizingItem,
        handleResizingItem,
        onResizedItemEdge,
        onResizedItemMiddle,
        onItemClick,
        onItemDoubleClick,
        draggingCalendar,
      }) => (
        <ExpandConsumer>
          {({ getNodeExpand }) => (
            // Todo 优化成类似index文件的取值
            <GanttNode
              channelsProfile={channelsProfile}
              channelComputedInfo={channelComputedInfo}
              permissionsModifyTaskTime={permissionsModifyTaskTime}
              calendarWidth={calendarWidth}
              calendarTimeStart={calendarTimeStart}
              resizingItem={resizingItem}
              handleResizingItem={handleResizingItem}
              onResizedItemEdge={onResizedItemEdge}
              onResizedItemMiddle={onResizedItemMiddle}
              onItemClick={onItemClick}
              onItemDoubleClick={onItemDoubleClick}
              draggingCalendar={draggingCalendar}
              nodeExpand={getNodeExpand(props.groupId, props.nodeId)}
              {...props}
            />
          )}
        </ExpandConsumer>
      )}
    </GanttContext.Consumer>
  );
};

GanttNodeWrapper.propTypes = {
  nodeId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  unitWidth: PropTypes.number.isRequired,
  channelRelations: PropTypes.object,
};

export default GanttNodeWrapper;
