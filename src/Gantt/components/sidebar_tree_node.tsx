import React from 'react';

import Icon from 'components/icon';

import { ExpandConsumer } from '../context/expand_context';
import { GanttContext } from '../context/gantt_context';

type Props = {
  nodeId: string;
  groupId: string;
  depth: number;
  relations: Record<string, string[]>;

  /**
   * 节点之间连线需要使用到的参考参数
   * {[offsetIndex]: true, ...}
   * 命名？
   */
  offsetLine: Record<number, boolean>;
};

// Todo, use the shouldComponentUpdate to reduce rerender
// 使用Consumer包裹Node, 而不是Node包裹Consumer
export default class SidebarTreeNode extends React.PureComponent<Props> {
  static defaultProps = {
    offsetLine: {},
    relations: {},
  };

  renderIndent = (
    childIds: string[],
    nodeExpand: boolean,
    handleChange?: (groupId: string, nodeId: string, value: boolean) => void,
  ) => {
    const { nodeId, groupId, depth, offsetLine } = this.props;
    const offsets = [];
    for (let i = 0; i < depth; i++) {
      let baseClassName = 'sidebar-tree-node-indent';
      if (i === depth - 1) {
        if (offsetLine[i]) {
          baseClassName += ' sidebar-tree-indent-middle';
        } else {
          baseClassName += ' sidebar-tree-indent-end';
        }
      } else if (offsetLine[i]) {
        baseClassName += ' sidebar-tree-indent-cross';
      }
      offsets.push(<span key={i} className={baseClassName} />);
    }

    if (childIds && childIds.length) {
      let nodeClassName = 'sidebar-tree-node-indent';
      if (depth) {
        nodeClassName += ' not-root';
      }
      if (nodeExpand) {
        nodeClassName += ' expanded';
      }

      offsets.push(
        <span key={'node'} className={nodeClassName}>
          <Icon
            type="solid_arrow-left"
            className="sidebar-tree-node-icon"
            onClick={() => handleChange?.(groupId, nodeId, nodeExpand)}
          />
        </span>,
      );
    } else if (depth) {
      offsets.push(
        <span key={'leaf'} className="sidebar-tree-node-indent sidebar-tree-node-leaf" />,
      );
    } else {
      offsets.push(<span key={'node'} className="sidebar-tree-node-indent" />);
    }

    return offsets;
  };

  render() {
    const { nodeId, groupId, depth, offsetLine, relations } = this.props;
    if (!nodeId) {
      return null;
    }
    return (
      <GanttContext.Consumer>
        {(GContext) => {
          if (GContext) {
            const { dataMap } = GContext;
            return (
              <ExpandConsumer>
                {({ handleChange, getNodeExpand }) => {
                  const renderData = dataMap?.[nodeId];
                  if (!renderData || !renderData.endAt) {
                    return null;
                  }

                  const nodeExpand = getNodeExpand?.(groupId, nodeId) || false;

                  const childIds = relations[nodeId];
                  const children = [];
                  if (childIds && childIds.length && nodeExpand) {
                    const childrenLength = childIds.length;
                    for (let i = 0; i < childrenLength; i++) {
                      const nextOffsetLine = { ...offsetLine };

                      // 当前节点是不是同级节点的最后一个
                      if (i !== childrenLength - 1) {
                        nextOffsetLine[depth] = true;
                      }
                      children.push(
                        <SidebarTreeNode
                          key={childIds[i]}
                          nodeId={childIds[i]}
                          groupId={groupId}
                          depth={depth + 1}
                          offsetLine={nextOffsetLine}
                          relations={relations}
                        />,
                      );
                    }
                  }

                  return (
                    <>
                      <div className="sidebar-tree-node">
                        {this.renderIndent(childIds, nodeExpand, handleChange)}
                        <span className="sidebar-tree-node-content">{renderData.title}</span>
                      </div>
                      {children}
                    </>
                  );
                }}
              </ExpandConsumer>
            );
          }
        }}
      </GanttContext.Consumer>
    );
  }
}
