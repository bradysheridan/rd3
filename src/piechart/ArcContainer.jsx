'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const createReactClass = require('create-react-class');

const { findDOMNode } = require('react-dom');
const shade = require('../utils').shade;
const Arc = require('./Arc');


module.exports = createReactClass({

  displayName: 'ArcContainer',

  propTypes: {
    fill: PropTypes.string,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    dataPoint: PropTypes.any, // TODO prop type?
  },

  getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill,
    };
  },

  _mouseover() {
    if ('function' === typeof this.props.onMouseOver) {
      this.props.onMouseOver(this.props.label);
    }

    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },

  _mouseleave() {
    if ('function' === typeof this.props.onMouseLeave) {
      this.props.onMouseLeave(this.props.label);
    }

    this.setState({
      fill: this.props.fill
    });
  },

  render() {
    const props = this.props;
    const isSelected = props.selectedLabel === props.label;
    const isSelectable = (!props.unselectableLabels) ? true : props.unselectableLabels.indexOf(props.label) < 0;

    return (
      <Arc
        {...this.props}
        fill={(isSelected) ? props.selectedArcFill : this.state.fill}
        valueTextFill={(isSelected) ? props.selectedValueTextFill : props.valueTextFill}
        hoverAnimation={props.hoverAnimation}
        handleMouseOver={props.hoverAnimation ? this._mouseover : null}
        handleMouseLeave={props.hoverAnimation ? this._mouseleave : null}
        handleClick={() => (isSelectable) ? props.onClickArc(props.label) : null}
      />
    );
  },
});
