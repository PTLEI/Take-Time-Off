import React, { PureComponent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  contentRef: HTMLDivElement | null;
  scrollRef: (element: HTMLDivElement) => void;
  draggingCalendar?: boolean;
  onCalendarDragging: (dragging: boolean) => void;
  isInteractingWithItem: boolean;
  onScroll: (scrollX: number) => void;
  width?: number;
};

export default class ScrollContainer extends PureComponent<Props> {
  dragStartPosition?: number;
  dragLastPosition?: number;
  isDragging = false;

  singleTouchStart: { x: number; y: number; screenY: number } | null = null;
  lastSingleTouch: { x: number; y: number } | null = null;

  scrollComponent: HTMLDivElement | null = null;

  scrollHandler = (el: HTMLDivElement) => {
    this.scrollComponent = el;
    this.props.scrollRef(el);
  };

  /**
   * needed to handle scrolling with trackpad
   */
  handleScroll = () => {
    if (this.scrollComponent) {
      const scrollX = this.scrollComponent.scrollLeft;
      this.props.onScroll(scrollX);
    }
  };

  handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      this.dragStartPosition = e.pageX;
      this.dragLastPosition = e.pageX;
      this.isDragging = true;
    }
  };

  handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (this.isDragging && !this.props.isInteractingWithItem) {
      const handlePointX = e.pageX;

      // This virtual scroll event needs to be throttle?
      // Test result: the action is very slow
      if (
        this.dragStartPosition !== undefined &&
        Math.abs(this.dragStartPosition - handlePointX) > 3
      ) {
        if (this.scrollComponent && this.dragLastPosition !== undefined) {
          this.props.onScroll(
            this.scrollComponent.scrollLeft + (this.dragLastPosition - handlePointX),
          );
        }
        this.dragLastPosition = handlePointX;
        this.props.onCalendarDragging(true);
      }
    }
  };

  handleMouseUp = () => {
    this.dragStartPosition = undefined;
    this.dragLastPosition = undefined;
    this.isDragging = false;
    this.props.onCalendarDragging(false);
  };

  handleMouseLeave = () => {
    this.dragStartPosition = undefined;
    this.dragLastPosition = undefined;
    this.isDragging = false;
    this.props.onCalendarDragging(false);
  };

  handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
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

  handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const { isInteractingWithItem } = this.props;
    e.preventDefault();
    if (isInteractingWithItem) {
      return;
    }
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    if (this.scrollComponent && this.singleTouchStart && this.lastSingleTouch) {
      const deltaX = x - this.lastSingleTouch.x;
      const deltaX0 = x - this.singleTouchStart.x;
      const deltaY0 = y - this.singleTouchStart.y;
      const moveX = Math.abs(deltaX0) * 3 > Math.abs(deltaY0);
      const moveY = Math.abs(deltaY0) * 3 > Math.abs(deltaX0);
      if (Math.abs(deltaX) > 3 && moveX) {
        this.props.onScroll(this.scrollComponent.scrollLeft - deltaX);
      }
      if (moveY && this.props.contentRef) {
        this.props.contentRef.scrollTo(0, this.singleTouchStart.screenY - deltaY0);
      }
    }
    this.lastSingleTouch = { x, y };
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
