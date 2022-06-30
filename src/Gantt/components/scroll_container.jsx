// Copyright (c) 2019-present Ithpower, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class ScrollContainer extends PureComponent {
  static propTypes = {
    children: PropTypes.element.isRequired,
    contentRef: PropTypes.object,
    scrollRef: PropTypes.func.isRequired,
    draggingCalendar: PropTypes.bool,
    onCalendarDragging: PropTypes.func.isRequired,
    isInteractingWithItem: PropTypes.bool.isRequired,
    onScroll: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.isDragging = false;
  }

  scrollHandler = (el) => {
    this.scrollComponent = el;
    this.props.scrollRef(el);
  };

  /**
   * needed to handle scrolling with trackpad
   */
  handleScroll = () => {
    const scrollX = this.scrollComponent.scrollLeft;
    this.props.onScroll(scrollX);
  };

  handleMouseDown = (e) => {
    if (e.button === 0) {
      this.dragStartPosition = e.pageX;
      this.dragLastPosition = e.pageX;
      this.isDragging = true;
    }
  };

  handleMouseMove = (e) => {
    if (this.isDragging && !this.props.isInteractingWithItem) {
      const handlePointX = e.pageX;

      // This virtual scroll event needs to be throttle?
      // Test result: the action is very slow
      if (Math.abs(this.dragStartPosition - handlePointX) > 3) {
        this.props.onScroll(
          this.scrollComponent.scrollLeft + (this.dragLastPosition - handlePointX),
        );
        this.dragLastPosition = handlePointX;
        this.props.onCalendarDragging(true);
      }
    }
  };

  handleMouseUp = () => {
    this.dragStartPosition = null;
    this.dragLastPosition = null;
    this.isDragging = false;
    this.props.onCalendarDragging(false);
  };

  handleMouseLeave = () => {
    this.dragStartPosition = null;
    this.dragLastPosition = null;
    this.isDragging = false;
    this.props.onCalendarDragging(false);
  };

  handleTouchStart = (e) => {
    e.preventDefault();

    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    this.singleTouchStart = {
      x,
      y,
      screenY: this.props.contentRef ? this.props.contentRef.scrollTop : 0,
    };
    this.lastSingleTouch = { x, y };
  };

  handleTouchMove = (e) => {
    const { isInteractingWithItem } = this.props;
    if (isInteractingWithItem) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const deltaX = x - this.lastSingleTouch.x;
    const deltaX0 = x - this.singleTouchStart.x;
    const deltaY0 = y - this.singleTouchStart.y;
    this.lastSingleTouch = { x, y };
    const moveX = Math.abs(deltaX0) * 3 > Math.abs(deltaY0);
    const moveY = Math.abs(deltaY0) * 3 > Math.abs(deltaX0);
    if (Math.abs(deltaX) > 3 && moveX) {
      this.props.onScroll(this.scrollComponent.scrollLeft - deltaX);
    }
    if (moveY && this.props.contentRef) {
      this.props.contentRef.scrollTo(0, this.singleTouchStart.screenY - deltaY0);
    }
  };

  handleTouchEnd = () => {
    if (this.lastSingleTouch) {
      this.lastSingleTouch = null;
      this.singleTouchStart = null;
    }
  };

  render() {
    const { children, draggingCalendar } = this.props;

    const scrollComponentStyle = {
      cursor: draggingCalendar ? 'move' : 'default',
      width: this.props.width,
    };

    return (
      <div
        ref={this.scrollHandler}
        className="calendar-scroll"
        style={scrollComponentStyle}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        onScroll={this.handleScroll}
      >
        {children}
      </div>
    );
  }
}
