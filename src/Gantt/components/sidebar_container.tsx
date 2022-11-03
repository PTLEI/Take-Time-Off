import React, { PureComponent } from 'react';

import { GruopItem } from '../types';
import SidebarTreeNode from './sidebar_tree_node';

type Props = {
  sidebarWidth: number;
  groups?: GruopItem[];
};

export default class SidebarContainer extends PureComponent<Props> {
  renderContent = () => {
    const { groups } = this.props;
    if (!groups || groups.length === 0) {
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
          style={groupName ? { borderLeft: '1px solid #E8E8E8' } : undefined}
        >
          {group.treeIds.map((treeId) => {
            return (
              <SidebarTreeNode
                key={treeId}
                nodeId={treeId}
                groupId={group.id}
                depth={0}
                relations={group.relations}
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
