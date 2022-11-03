import React, { ReactNode } from 'react';

type ExpandType = {
  closedNodes?: Record<string, Record<string, boolean> | undefined>;
  handleChange?: (groupId: string, nodeId: string, value: boolean) => void;
  getNodeExpand?: (groupId: string, nodeId: string) => boolean;
};

const { Consumer, Provider } = React.createContext<ExpandType>({});

type Props = { children: ReactNode };
type State = { closedNodes: Record<string, Record<string, boolean> | undefined> };
export class ExpandProvider extends React.PureComponent<Props, State> {
  public state: State = {
    // closedNodes: {[groupId]: {[nodeId]: [closed], ...}, ...}
    // 因为页面初始化的时候是全部展开的，所以这里values记录closed
    closedNodes: {},
  };

  handleChange = (groupId: string, nodeId: string, value: boolean) => {
    this.setState(({ closedNodes }) => {
      const groupClose = closedNodes[groupId];
      const nextGroupClose = {
        ...groupClose,
        [nodeId]: value,
      };

      return {
        closedNodes: {
          ...closedNodes,
          [groupId]: nextGroupClose,
        },
      };
    });
  };

  getNodeExpand = (groupId: string, nodeId: string) => {
    const groupClose = this.state.closedNodes[groupId];
    const nodeClosed = groupClose && groupClose[nodeId];

    return !nodeClosed;
  };

  render() {
    return (
      <Provider
        value={{
          closedNodes: this.state.closedNodes,
          handleChange: this.handleChange,
          getNodeExpand: this.getNodeExpand,
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}

export const ExpandConsumer = Consumer;
