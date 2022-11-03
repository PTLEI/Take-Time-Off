import React from 'react';

require('./iconfont.js');

export interface IconProps {
  type: string;
  className?: string;
  style?: object;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onClick?: () => void;
  id?: string;
  size?: number;
  color?: string;
  disable?: boolean;
}
export default class Icon extends React.PureComponent<IconProps> {
  static defaultProps = {
    className: '',
    style: {},
  };

  render() {
    const {
      className,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onClick,
      type,
      size,
      color,
      style,
      disable,
    } = this.props;
    let containerClassName = 'iai-icon';
    if (disable) {
      containerClassName += ' disabled';
    } else if (onClick) {
      containerClassName += ' pointer-icon';
    }
    if (className) {
      containerClassName += ` ${className}`;
    }

    const extraStyle: any = { ...style };
    if (size) {
      extraStyle.fontSize = size + 'px';
    }
    if (color) {
      extraStyle.color = color;
    }

    let context = (
      <svg aria-hidden="true">
        <use xlinkHref={`#icon-${type}`} />
      </svg>
    );

    return (
      <span
        id={this.props.id}
        className={containerClassName}
        style={extraStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onClick={onClick}
      >
        {context}
      </span>
    );
  }
}

export const IconWithHighlight: React.FC<IconProps> = ({ className, ...props }) => {
  let highlightClass = 'highlight-icon';
  if (className) {
    highlightClass += ` ${className}`;
  }
  return <Icon {...props} className={highlightClass} />;
};
