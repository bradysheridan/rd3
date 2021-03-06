'use strict';

var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');

var d3 = require('d3');

module.exports = createReactClass({

  displayName: 'Arc',

  propTypes: {
    fill: PropTypes.string,
    d: PropTypes.string,
    startAngle: PropTypes.number,
    endAngle: PropTypes.number,
    innerRadius: PropTypes.number,
    outerRadius: PropTypes.number,
    labelTextFill: PropTypes.string,
    valueTextFill: PropTypes.string,
    sectorBorderColor: PropTypes.string,
    showInnerLabels: PropTypes.bool,
    showOuterLabels: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      labelTextFill: 'black',
      valueTextFill: 'white',
      showInnerLabels: true,
      showOuterLabels: true
    };
  },
  renderInnerLabel: function renderInnerLabel(props, arc) {
    // make value text can be formatted
    var formattedValue = props.valueTextFormatter(props.value);
    return React.createElement(
      'text',
      {
        className: 'rd3-piechart-value',
        transform: 'translate(' + arc.centroid() + ')',
        dy: '.35em',
        style: {
          shapeRendering: 'crispEdges',
          textAnchor: 'middle',
          fill: props.valueTextFill,
          pointerEvents: 'none'
        }
      },
      formattedValue
    );
  },
  renderOuterLabel: function renderOuterLabel(props) {
    var rotate = 'rotate(' + (props.startAngle + props.endAngle) / 2 * (180 / Math.PI) + ')';
    var radius = props.outerRadius;
    var dist = radius + 35;
    var angle = (props.startAngle + props.endAngle) / 2;
    var x = dist * (1.2 * Math.sin(angle));
    var y = -dist * Math.cos(angle);
    var t = 'translate(' + x + ',' + y + ')';

    return React.createElement(
      'g',
      null,
      React.createElement('line', {
        x1: '0',
        x2: '0',
        y1: -radius - 2,
        y2: -radius - 26,
        stroke: props.labelTextFill,
        transform: rotate,
        style: {
          fill: props.labelTextFill,
          strokeWidth: 2
        }
      }),
      React.createElement(
        'text',
        {
          className: 'rd3-piechart-label',
          transform: t,
          dy: '.35em',
          style: {
            textAnchor: 'middle',
            fill: props.labelTextFill,
            shapeRendering: 'crispEdges',
            pointerEvents: 'none'
          }
        },
        props.label
      )
    );
  },
  render: function render() {
    var props = this.props;

    var arc = d3.svg.arc().innerRadius(props.innerRadius).outerRadius(props.outerRadius).startAngle(props.startAngle).endAngle(props.endAngle);

    return React.createElement(
      'g',
      { className: 'rd3-piechart-arc' },
      React.createElement('path', {
        d: arc(),
        fill: props.fill,
        stroke: props.stroke,
        strokeWidth: props.isSelected ? 2 : 1,
        shapeRendering: 'crisp-edges',
        onMouseOver: props.handleMouseOver,
        onMouseLeave: props.handleMouseLeave,
        onClick: props.handleClick,
        style: { cursor: props.hoverAnimation ? 'pointer' : 'default', zIndex: props.isSelected ? 2 : 1 }
      }),
      props.showOuterLabels ? this.renderOuterLabel(props, arc) : null,
      props.showInnerLabels ? this.renderInnerLabel(props, arc) : null
    );
  }
});