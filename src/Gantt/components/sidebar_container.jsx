// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import SidebarTreeNode from './sidebar_tree_node';

export default class SidebarContainer extends PureComponent {
  static propTypes = {
    sidebarWidth: PropTypes.number.isRequired,
    groups: PropTypes.array.isRequired,
  };

  renderContent = () => {
    const { groups } = this.props;
    if (groups && groups.length === 0) {
      return null;
    }
    return groups.map((group) => {
      if (!group.treeIds || group.treeIds.length === 0) {
        return null;
      }

      let groupName;
      if (group.groupName && group.id !== 'myself') {
        groupName = <div className="sidebar-group-name">{group.groupName}</div>;
      }

      const trees = (
        <div
          className="sidebar-group-trees"
          style={groupName ? { borderLeft: '1px solid #E8E8E8' } : null}
        >
          {group.treeIds.map((treeId) => {
            return (
              <SidebarTreeNode
                key={treeId}
                nodeId={treeId}
                groupId={group.id}
                depth={0}
                channelRelations={group.channelRelations}
              />
            );
          })}
        </div>
      );

      return (
        <div key={group.id} className="sidebar-group-item">
          {groupName}
          {trees}
        </div>
      );
    });
  };

  render() {
    const { sidebarWidth } = this.props;

    const content = this.renderContent();

    return (
      <div className="gantt-sidebar-content-wrapper" style={{ width: sidebarWidth }}>
        <div className="gantt-sidebar-content">{content}</div>
      </div>
    );
  }
}
