'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');

var _require = require('react-dom'),
    findDOMNode = _require.findDOMNode;

var shade = require('../utils').shade;
var Arc = require('./Arc');

module.exports = createReactClass({

  displayName: 'ArcContainer',

  propTypes: {
    fill: PropTypes.string,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    dataPoint: PropTypes.any // TODO prop type?
  },

  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill
    };
  },
  _mouseover: function _mouseover() {
    this.props.onMouseOver(this.props.label);
    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _mouseleave: function _mouseleave() {
    this.props.onMouseLeave(this.props.label);
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;
    var isSelected = props.selectedArc === props.label;

    return React.createElement(Arc, _extends({}, this.props, {
      fill: isSelected ? props.selectedArcFill : this.state.fill,
      valueTextFill: isSelected ? props.selectedValueTextFill : props.valueTextFill,
      hoverAnimation: props.hoverAnimation,
      handleMouseOver: props.hoverAnimation ? this._mouseover : null,
      handleMouseLeave: props.hoverAnimation ? this._mouseleave : null,
      handleClick: props.onClickArc
    }));
  }
});