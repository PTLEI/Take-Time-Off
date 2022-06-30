// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import PropTypes from 'prop-types';

const defaultContextState = {};

const { Consumer, Provider } = React.createContext(defaultContextState);

export class ExpandProvider extends React.PureComponent {
  static propTypes = {
    children: PropTypes.element.isRequired,
  };

  constructor() {
    super();
    this.state = {
      // closedNodes: {[groupId]: {[nodeId]: [closed], ...}, ...}
      // 因为页面初始化的时候是全部展开的，所以这里values记录closed
      closedNodes: {},
    };
  }

  handleChange = (groupId, nodeId, value) => {
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

  getNodeExpand = (groupId, nodeId) => {
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
