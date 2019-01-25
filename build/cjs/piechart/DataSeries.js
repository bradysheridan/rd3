'use strict';

var PropTypes = require('prop-types');
var React = require('react');
var createReactClass = require('create-react-class');

var d3 = require('d3');
var ArcContainer = require('./ArcContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    data: PropTypes.array,
    values: PropTypes.array,
    labels: PropTypes.array,
    transform: PropTypes.string,
    innerRadius: PropTypes.number,
    radius: PropTypes.number,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    showInnerLabels: PropTypes.bool,
    showOuterLabels: PropTypes.bool,
    sectorBorderColor: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      innerRadius: 0,
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      }
    };
  },
  getInitialState: function getInitialState() {
    return {
      selectedArc: null
    };
  },
  render: function render() {
    var _this = this;

    var props = this.props;

    var pie = d3.layout.pie().sort(null);

    var arcData = pie(props.values);

    var arcs = arcData.map(function (arc, idx) {
      return React.createElement(ArcContainer, {
        key: idx,
        startAngle: arc.startAngle,
        endAngle: arc.endAngle,
        outerRadius: props.radius,
        innerRadius: props.innerRadius,
        selectedValueTextFill: props.selectedValueTextFill,
        selectedArcFill: props.selectedArcFill,
        labelTextFill: props.labelTextFill,
        valueTextFill: props.valueTextFill,
        valueTextFormatter: props.valueTextFormatter,
        fill: props.colors(props.colorAccessor(props.data[idx], idx)),
        value: props.values[idx],
        label: props.labels[idx],
        width: props.width,
        showInnerLabels: props.showInnerLabels,
        showOuterLabels: props.showOuterLabels,
        sectorBorderColor: props.sectorBorderColor,
        hoverAnimation: props.hoverAnimation,
        dataPoint: { yValue: props.values[idx], seriesName: props.labels[idx] }

        // added props
        , selectedArc: _this.state.selectedArc,
        onMouseOver: props.onMouseOver,
        onMouseLeave: props.onMouseLeave,
        onClickArc: function onClickArc() {
          var label = props.labels[idx];
          _this.setState({
            selectedArc: _this.state.selectedArc === label ? null : label
          }, function () {
            props.onClickArc({
              label: label,
              isSelected: _this.state.selectedArc === label
            });
          });
        }
      });
    });
    return React.createElement(
      'g',
      { className: 'rd3-piechart-pie', transform: props.transform },
      arcs
    );
  }
});