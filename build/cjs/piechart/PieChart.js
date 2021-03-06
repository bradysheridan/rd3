'use strict';

var d3 = require('d3');
var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');

var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    Tooltip = _require.Tooltip;

var TooltipMixin = require('../mixins').TooltipMixin;

module.exports = createReactClass({

  displayName: 'PieChart',

  propTypes: {
    data: PropTypes.array,
    radius: PropTypes.number,
    cx: PropTypes.number,
    cy: PropTypes.number,
    labelTextFill: PropTypes.string,
    valueTextFill: PropTypes.string,
    valueTextFormatter: PropTypes.func,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    title: PropTypes.string,
    showInnerLabels: PropTypes.bool,
    showOuterLabels: PropTypes.bool,
    sectorBorderColor: PropTypes.string,
    hoverAnimation: PropTypes.bool
  },

  mixins: [TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      title: '',
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      },
      valueTextFormatter: function valueTextFormatter(val) {
        return val + '%';
      },
      hoverAnimation: true
    };
  },
  render: function render() {
    var props = this.props;

    if (props.data && props.data.length < 1) {
      return null;
    }
    var transform = 'translate(' + (props.cx || props.width / 2) + ',' + (props.cy || props.height / 2) + ')';

    var values = props.data.map(function (item) {
      return item.value;
    });
    var labels = props.data.map(function (item) {
      return item.label;
    });

    return React.createElement(
      'span',
      null,
      React.createElement(
        Chart,
        {
          width: props.width,
          height: props.height,
          title: props.title,
          shouldUpdate: !this.state.changeState
        },
        React.createElement(
          'g',
          { className: 'rd3-piechart' },
          React.createElement(DataSeries, {
            selectedValueTextFill: props.selectedValueTextFill,
            selectedArcFill: props.selectedArcFill,
            labelTextFill: props.labelTextFill,
            valueTextFill: props.valueTextFill,
            valueTextFormatter: props.valueTextFormatter,
            data: props.data,
            values: values,
            labels: labels,
            colors: props.colors,
            colorAccessor: props.colorAccessor,
            transform: transform,
            width: props.width,
            height: props.height,
            radius: props.radius,
            innerRadius: props.innerRadius,
            showInnerLabels: props.showInnerLabels,
            showOuterLabels: props.showOuterLabels,
            sectorBorderColor: props.sectorBorderColor,
            hoverAnimation: props.hoverAnimation

            // added props
            , onMouseOver: props.onMouseOver,
            onMouseLeave: props.onMouseLeave,
            onClickArc: props.onClickArc,
            preventDeselection: props.preventDeselection,
            selectedLabel: props.selectedLabel,
            unselectableLabels: props.unselectableLabels
          })
        )
      ),
      props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null
    );
  }
});