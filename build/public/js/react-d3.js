(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.rd3 = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Area',

  propTypes: {
    path: PropTypes.string,
    fill: PropTypes.string,
    handleMouseOver: PropTypes.func,
    handleMouseLeave: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: '#3182bd'
    };
  },
  render: function render() {
    return React.createElement('path', {
      className: 'rd3-areachart-area',
      d: this.props.path,
      fill: this.props.fill,
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave
    });
  }
});

},{}],2:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis;

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin;

module.exports = createReactClass({

  displayName: 'AreaChart',

  propTypes: {
    margins: PropTypes.object,
    interpolate: PropTypes.bool,
    interpolationType: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    data: PropTypes.array.isRequired
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      margins: { top: 10, right: 20, bottom: 40, left: 45 },
      yAxisTickCount: 4,
      interpolate: false,
      interpolationType: null,
      className: 'rd3-areachart',
      hoverAnimation: true,
      data: []
    };
  },
  render: function render() {
    var props = this.props;
    var data = props.data;
    var interpolationType = props.interpolationType || (props.interpolate ? 'cardinal' : 'linear');

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();

    if (!Array.isArray(data)) {
      data = [data];
    }
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    var yScale = d3.scale.linear().range([innerHeight, 0]);

    var xValues = [];
    var yValues = [];
    var seriesNames = [];
    var yMaxValues = [];
    var domain = props.domain || {};
    var xDomain = domain.x || [];
    var yDomain = domain.y || [];
    data.forEach(function (series) {
      var upper = 0;
      seriesNames.push(series.name);
      series.values.forEach(function (val) {
        upper = Math.max(upper, props.yAccessor(val));
        xValues.push(props.xAccessor(val));
        yValues.push(props.yAccessor(val));
      });
      yMaxValues.push(upper);
    });

    var xScale = void 0;
    if (xValues.length > 0 && Object.prototype.toString.call(xValues[0]) === '[object Date]' && props.xAxisTickInterval) {
      xScale = d3.time.scale().range([0, innerWidth]);
    } else {
      xScale = d3.scale.linear().range([0, innerWidth]);
    }

    var xdomain = d3.extent(xValues);
    if (xDomain[0] !== undefined && xDomain[0] !== null) xdomain[0] = xDomain[0];
    if (xDomain[1] !== undefined && xDomain[1] !== null) xdomain[1] = xDomain[1];
    xScale.domain(xdomain);
    var ydomain = [0, d3.sum(yMaxValues)];
    if (yDomain[0] !== undefined && yDomain[0] !== null) ydomain[0] = yDomain[0];
    if (yDomain[1] !== undefined && yDomain[1] !== null) ydomain[1] = yDomain[1];
    yScale.domain(ydomain);

    props.colors.domain(seriesNames);

    var stack = d3.layout.stack().x(props.xAccessor).y(props.yAccessor).values(function (d) {
      return d.values;
    });

    var layers = stack(data);

    var dataSeries = layers.map(function (d, idx) {
      return React.createElement(DataSeries, {
        key: idx,
        seriesName: d.name,
        fill: props.colors(props.colorAccessor(d, idx)),
        index: idx,
        xScale: xScale,
        yScale: yScale,
        data: d.values,
        xAccessor: props.xAccessor,
        yAccessor: props.yAccessor,
        interpolationType: interpolationType,
        hoverAnimation: props.hoverAnimation
      });
    });

    return React.createElement(Chart, {
      viewBox: this.getViewBox(),
      legend: props.legend,
      data: data,
      margins: props.margins,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      width: props.width,
      height: props.height,
      title: props.title
    }, React.createElement('g', { transform: trans, className: props.className }, React.createElement(XAxis, {
      xAxisClassName: 'rd3-areachart-xaxis',
      xScale: xScale,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisTickCount: props.xAxisTickCount,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YAxis, {
      yAxisClassName: 'rd3-areachart-yaxis',
      yScale: yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickInterval: props.yAxisTickInterval,
      yAxisTickCount: props.yAxisTickCount,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: props.height,
      horizontalChart: props.horizontal,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), dataSeries));
  }
});

},{"../common":31,"../mixins":43,"./DataSeries":4}],3:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var shade = require('../utils').shade;
var Area = require('./Area');

module.exports = createReactClass({

  displayName: 'AreaContainer',

  propTypes: {
    fill: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: '#3182bd'
    };
  },
  getInitialState: function getInitialState() {
    return {
      fill: this.props.fill
    };
  },
  _animateArea: function _animateArea() {
    this.setState({
      fill: shade(this.props.fill, 0.02)
    });
  },
  _restoreArea: function _restoreArea() {
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateArea;
      handleMouseLeave = this._restoreArea;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement(Area, _extends({
      handleMouseOver: handleMouseOver,
      handleMouseLeave: handleMouseLeave
    }, props, {
      fill: this.state.fill
    }));
  }
});

},{"../utils":59,"./Area":1}],4:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var AreaContainer = require('./AreaContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    fill: PropTypes.string,
    interpolationType: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      interpolationType: 'linear'
    };
  },
  render: function render() {
    var props = this.props;

    var area = d3.svg.area().x(function (d) {
      return props.xScale(props.xAccessor(d));
    }).y0(function (d) {
      return props.yScale(d.y0);
    }).y1(function (d) {
      return props.yScale(d.y0 + props.yAccessor(d));
    }).interpolate(props.interpolationType);

    var path = area(props.data);

    return React.createElement(AreaContainer, {
      fill: props.fill,
      hoverAnimation: props.hoverAnimation,
      path: path
    });
  }
});

},{"./AreaContainer":3}],5:[function(require,module,exports){
'use strict';

exports.AreaChart = require('./AreaChart');

},{"./AreaChart":2}],6:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
  displayName: 'exports',

  propTypes: {
    fill: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    className: PropTypes.string,
    handleMouseOver: PropTypes.func,
    handleMouseLeave: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      offset: 0,
      className: 'rd3-barchart-bar'
    };
  },
  render: function render() {
    return React.createElement('rect', _extends({
      className: 'rd3-barchart-bar'
    }, this.props, {
      fill: this.props.fill,
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave
    }));
  }
});

},{}],7:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    Tooltip = _require.Tooltip;

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin,
    TooltipMixin = _require2.TooltipMixin;

module.exports = createReactClass({

  displayName: 'BarChart',

  propTypes: {
    chartClassName: PropTypes.string,
    data: PropTypes.array.isRequired,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    rangeRoundBandsPadding: PropTypes.number,
    // https://github.com/mbostock/d3/wiki/Stack-Layout#offset
    stackOffset: PropTypes.oneOf(['silhouette', 'expand', 'wigget', 'zero']),
    grouped: PropTypes.bool,
    valuesAccessor: PropTypes.func,
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
    y0Accessor: PropTypes.func,
    title: PropTypes.string,
    xAxisClassName: PropTypes.string,
    yAxisClassName: PropTypes.string,
    yAxisTickCount: PropTypes.number
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      chartClassName: 'rd3-barchart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 40, left: 45 },
      rangeRoundBandsPadding: 0.25,
      stackOffset: 'zero',
      grouped: false,
      valuesAccessor: function valuesAccessor(d) {
        return d.values;
      },
      y0Accessor: function y0Accessor(d) {
        return d.y0;
      },
      xAxisClassName: 'rd3-barchart-xaxis',
      yAxisClassName: 'rd3-barchart-yaxis',
      yAxisTickCount: 4
    };
  },
  _getStackedValuesMaxY: function _getStackedValuesMaxY(_data) {
    var _this = this;

    // in stacked bar chart, the maximum height we need for
    // yScale domain is the sum of y0 + y
    var valuesAccessor = this.props.valuesAccessor;

    return d3.max(_data, function (d) {
      return d3.max(valuesAccessor(d), function (d2) {
        return (
          // where y0, y is generated by d3.layout.stack()
          _this.props.y0Accessor(d2) + _this.props.yAccessor(d2)
        );
      });
    });
  },
  _getStackedValuesMinY: function _getStackedValuesMinY(_data) {
    var _this2 = this;

    var valuesAccessor = this.props.valuesAccessor;

    return d3.min(_data, function (d) {
      return d3.min(valuesAccessor(d), function (d2) {
        return (
          // where y0, y is generated by d3.layout.stack()
          _this2.props.y0Accessor(d2) + _this2.props.yAccessor(d2)
        );
      });
    });
  },
  _getLabels: function _getLabels(firstSeries) {
    // we only need first series to get all the labels
    var _props = this.props,
        valuesAccessor = _props.valuesAccessor,
        xAccessor = _props.xAccessor;

    return valuesAccessor(firstSeries).map(xAccessor);
  },
  _stack: function _stack() {
    // Only support columns with all positive or all negative values
    // https://github.com/mbostock/d3/issues/2265
    var _props2 = this.props,
        stackOffset = _props2.stackOffset,
        xAccessor = _props2.xAccessor,
        yAccessor = _props2.yAccessor,
        valuesAccessor = _props2.valuesAccessor;

    return d3.layout.stack().offset(stackOffset).x(xAccessor).y(yAccessor).values(valuesAccessor);
  },
  render: function render() {
    var props = this.props;
    var yOrient = this.getYOrient();

    var domain = props.domain || {};

    if (props.data.length === 0) {
      return null;
    }
    var _data = this._stack()(props.data);

    var _getDimensions = this.getDimensions(),
        innerHeight = _getDimensions.innerHeight,
        innerWidth = _getDimensions.innerWidth,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var xDomain = domain.x || this._getLabels(_data[0]);
    var xScale = d3.scale.ordinal().domain(xDomain).rangeRoundBands([0, innerWidth], props.rangeRoundBandsPadding);

    var minYDomain = Math.min(0, this._getStackedValuesMinY(_data));
    var maxYDomain = this._getStackedValuesMaxY(_data);
    var yDomain = domain.y || [minYDomain, maxYDomain];
    var yScale = d3.scale.linear().range([innerHeight, 0]).domain(yDomain);

    var series = props.data.map(function (item) {
      return item.name;
    });

    return React.createElement('span', null, React.createElement(Chart, {
      viewBox: this.getViewBox(),
      legend: props.legend,
      data: props.data,
      margins: props.margins,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      width: props.width,
      height: props.height,
      title: props.title,
      shouldUpdate: !this.state.changeState
    }, React.createElement('g', { transform: trans, className: props.chartClassName }, React.createElement(YAxis, {
      yAxisClassName: props.yAxisClassName,
      yAxisTickValues: props.yAxisTickValues,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      yScale: yScale,
      margins: svgMargins,
      yAxisTickCount: props.yAxisTickCount,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      xOrient: props.xOrient,
      yOrient: yOrient,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), React.createElement(XAxis, {
      xAxisClassName: props.xAxisClassName,
      xAxisTickValues: props.xAxisTickValues,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xScale: xScale,
      margins: svgMargins,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      xOrient: props.xOrient,
      yOrient: yOrient,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(DataSeries, {
      yScale: yScale,
      xScale: xScale,
      margins: svgMargins,
      _data: _data,
      series: series,
      width: innerWidth,
      height: innerHeight,
      grouped: props.grouped,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      hoverAnimation: props.hoverAnimation,
      valuesAccessor: props.valuesAccessor,
      xAccessor: props.xAccessor,
      yAccessor: props.yAccessor,
      y0Accessor: props.y0Accessor,
      onMouseOver: this.onMouseOver,
      onMouseLeave: this.onMouseLeave
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":31,"../mixins":43,"./DataSeries":9}],8:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = window.ReactDOM,
    findDOMNode = _require.findDOMNode;

var Bar = require('./Bar');
var shade = require('../utils').shade;

module.exports = createReactClass({
  displayName: 'exports',

  propTypes: {
    fill: PropTypes.string,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    dataPoint: PropTypes.any // TODO: prop types?
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: '#3182BD'
    };
  },
  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill
    };
  },
  _animateBar: function _animateBar() {
    var rect = findDOMNode(this).getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.dataPoint);
    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _restoreBar: function _restoreBar() {
    this.props.onMouseLeave.call(this);
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    return React.createElement(Bar, _extends({}, props, {
      fill: this.state.fill,
      handleMouseOver: props.hoverAnimation ? this._animateBar : null,
      handleMouseLeave: props.hoverAnimation ? this._restoreBar : null
    }));
  }
});

},{"../utils":59,"./Bar":6}],9:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var BarContainer = require('./BarContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    _data: PropTypes.array,
    series: PropTypes.array,
    grouped: PropTypes.bool,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    valuesAccessor: PropTypes.func,
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
    y0Accessor: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    hoverAnimation: PropTypes.any, // TODO: prop types?
    xScale: PropTypes.any,
    yScale: PropTypes.any
  },

  _renderBarSeries: function _renderBarSeries() {
    var _this = this;

    var _props = this.props,
        _data = _props._data,
        valuesAccessor = _props.valuesAccessor;

    return _data.map(function (layer, seriesIdx) {
      return valuesAccessor(layer).map(function (segment) {
        return _this._renderBarContainer(segment, seriesIdx);
      });
    });
  },
  _renderBarContainer: function _renderBarContainer(segment, seriesIdx) {
    var _props2 = this.props,
        colors = _props2.colors,
        colorAccessor = _props2.colorAccessor,
        grouped = _props2.grouped,
        hoverAnimation = _props2.hoverAnimation,
        series = _props2.series,
        xScale = _props2.xScale,
        yScale = _props2.yScale;

    var barHeight = Math.abs(yScale(0) - yScale(this.props.yAccessor(segment)));
    var yWidth = yScale(this.props.y0Accessor(segment) + this.props.yAccessor(segment));
    var y = grouped ? yScale(this.props.yAccessor(segment)) : yWidth;
    return React.createElement(BarContainer, {
      height: barHeight,
      width: grouped ? xScale.rangeBand() / series.length : xScale.rangeBand(),
      x: grouped ? xScale(this.props.xAccessor(segment)) + xScale.rangeBand() / series.length * seriesIdx : xScale(this.props.xAccessor(segment)),
      y: this.props.yAccessor(segment) >= 0 ? y : y - barHeight,
      fill: colors(colorAccessor(segment, seriesIdx)),
      hoverAnimation: hoverAnimation,
      onMouseOver: this.props.onMouseOver,
      onMouseLeave: this.props.onMouseLeave,
      dataPoint: {
        xValue: this.props.xAccessor(segment),
        yValue: this.props.yAccessor(segment),
        seriesName: this.props.series[seriesIdx]
      }
    });
  },
  render: function render() {
    return React.createElement('g', null, this._renderBarSeries());
  }
});

},{"./BarContainer":8}],10:[function(require,module,exports){
'use strict';

exports.BarChart = require('./BarChart');

},{"./BarChart":7}],11:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Candle',

  propTypes: {
    className: PropTypes.string,
    shapeRendering: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-candle',
      shapeRendering: 'crispEdges',
      stroke: '#000',
      strokeWidth: 1
    };
  },
  render: function render() {
    var props = this.props;

    return React.createElement('rect', {
      className: props.className,
      fill: props.candleFill,
      x: props.candleX,
      y: props.candleY,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      style: { shapeRendering: props.shapeRendering },
      width: props.candleWidth,
      height: props.candleHeight,
      onMouseOver: props.handleMouseOver,
      onMouseLeave: props.handleMouseLeave
    });
  }
});

},{}],12:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var utils = require('../utils');
var DataSeries = require('./DataSeries');

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis;

var _require2 = require('../mixins'),
    ViewBoxMixin = _require2.ViewBoxMixin,
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin;

module.exports = createReactClass({

  displayName: 'CandleStickChart',

  propTypes: {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    fillUp: PropTypes.func,
    fillUpAccessor: PropTypes.func,
    fillDown: PropTypes.func,
    fillDownAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool,
    xAxisFormatter: PropTypes.func,
    xAxisTickInterval: PropTypes.object,
    xAxisTickValues: PropTypes.array,
    yAxisFormatter: PropTypes.func,
    yAxisTickCount: PropTypes.number,
    yAxisTickValues: PropTypes.array
  },

  mixins: [CartesianChartPropsMixin, ViewBoxMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick',
      xAxisClassName: 'rd3-candlestick-xaxis',
      yAxisClassName: 'rd3-candlestick-yaxis',
      data: [],
      fillUp: function fillUp() {
        return '#ffffff';
      },
      fillUpAccessor: function fillUpAccessor(d, idx) {
        return idx;
      },
      fillDown: d3.scale.category20c(),
      fillDownAccessor: function fillDownAccessor(d, idx) {
        return idx;
      },
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 30, left: 45 },
      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return { open: d.open, high: d.high, low: d.low, close: d.close };
      }
    };
  },
  render: function render() {
    var props = this.props;

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    if (!Array.isArray(props.data)) {
      props.data = [props.data];
    }
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }
    var flattenedData = utils.flattenData(props.data, props.xAccessor, props.yAccessor);

    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;
    var scales = utils.calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);

    var dataSeries = props.data.map(function (series, idx) {
      return React.createElement(DataSeries, {
        key: idx,
        seriesName: series.name,
        index: idx,
        xScale: scales.xScale,
        yScale: scales.yScale,
        data: series.values,
        fillUp: props.fillUp(props.fillUpAccessor(series, idx)),
        fillDown: props.fillDown(props.fillDownAccessor(series, idx)),
        xAccessor: props.xAccessor,
        yAccessor: props.yAccessor,
        hoverAnimation: props.hoverAnimation
      });
    });

    return React.createElement(Chart, {
      viewBox: this.getViewBox(),
      width: props.width,
      height: props.height,
      margins: props.margins,
      title: props.title
    }, React.createElement('g', { transform: trans, className: props.className }, React.createElement(XAxis, {
      xAxisClassName: props.xAxisClassName,
      xScale: scales.xScale,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YAxis, {
      yAxisClassName: props.yAxisClassName,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisOffset: props.yAxisOffset,
      yAxisTickCount: props.yAxisTickCount,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: props.height,
      horizontalChart: props.horizontal,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), dataSeries));
  }
});

},{"../common":31,"../mixins":43,"../utils":59,"./DataSeries":14}],13:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var utils = require('../utils');
var Candle = require('./Candle');
var Wick = require('./Wick');

module.exports = createReactClass({

  displayName: 'CandleStickContainer',

  propTypes: {
    candleX: PropTypes.number,
    candleY: PropTypes.number,
    className: PropTypes.string,
    candleFill: PropTypes.string,
    candleHeight: PropTypes.number,
    candleWidth: PropTypes.number,
    wickX1: PropTypes.number,
    wickX2: PropTypes.number,
    wickY1: PropTypes.number,
    wickY2: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-container'
    };
  },
  getInitialState: function getInitialState() {
    // state for animation usage
    return {
      candleWidth: this.props.candleWidth,
      candleFill: this.props.candleFill
    };
  },
  _animateCandle: function _animateCandle() {
    this.setState({
      candleWidth: this.props.candleWidth * 1.5,
      candleFill: utils.shade(this.props.candleFill, -0.2)
    });
  },
  _restoreCandle: function _restoreCandle() {
    this.setState({
      candleWidth: this.props.candleWidth,
      candleFill: this.props.candleFill
    });
  },
  render: function render() {
    var props = this.props;
    var state = this.state;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateCandle;
      handleMouseLeave = this._restoreCandle;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement('g', { className: props.className }, React.createElement(Wick, {
      wickX1: props.wickX1,
      wickX2: props.wickX2,
      wickY1: props.wickY1,
      wickY2: props.wickY2
    }), React.createElement(Candle, {
      candleFill: state.candleFill,
      candleWidth: state.candleWidth,
      candleX: props.candleX - (state.candleWidth - props.candleWidth) / 2,
      candleY: props.candleY,
      candleHeight: props.candleHeight,
      handleMouseOver: handleMouseOver,
      handleMouseLeave: handleMouseLeave
    }));
  }
});

},{"../utils":59,"./Candle":11,"./Wick":15}],14:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var CandlestickContainer = require('./CandlestickContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    fillUp: PropTypes.string.isRequired,
    fillDown: PropTypes.string.isRequired
  },

  render: function render() {
    var props = this.props;

    var xRange = props.xScale.range();
    var width = Math.abs(xRange[0] - xRange[1]);
    var candleWidth = width / (props.data.length + 2) * 0.5;

    var dataSeriesArray = props.data.map(function (d, idx) {
      // Candles
      var ohlc = props.yAccessor(d);
      var candleX = props.xScale(props.xAccessor(d)) - 0.5 * candleWidth;
      var candleY = props.yScale(Math.max(ohlc.open, ohlc.close));
      var candleHeight = Math.abs(props.yScale(ohlc.open) - props.yScale(ohlc.close));
      var wickY2 = props.yScale(ohlc.low);
      var candleFill = ohlc.open <= ohlc.close ? props.fillUp : props.fillDown;

      // Wicks
      var wickX1 = props.xScale(props.xAccessor(d));
      var wickY1 = props.yScale(ohlc.high);
      var wickX2 = wickX1;

      return React.createElement(CandlestickContainer, {
        key: idx,
        candleFill: candleFill,
        candleHeight: candleHeight,
        candleWidth: candleWidth,
        candleX: candleX,
        candleY: candleY,
        wickX1: wickX1,
        wickX2: wickX2,
        wickY1: wickY1,
        wickY2: wickY2,
        hoverAnimation: props.hoverAnimation
      });
    }, this);

    return React.createElement('g', null, dataSeriesArray);
  }
});

},{"./CandlestickContainer":13}],15:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Wick',

  propTypes: {
    className: PropTypes.string,
    shapeRendering: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-candlestick-wick',
      stroke: '#000',
      strokeWidth: 1,
      shapeRendering: 'crispEdges'
    };
  },
  render: function render() {
    var props = this.props;
    return React.createElement('line', {
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      style: { shapeRendering: props.shapeRendering },
      className: props.className,
      x1: props.wickX1,
      y1: props.wickY1,
      x2: props.wickX2,
      y2: props.wickY2
    });
  }
});

},{}],16:[function(require,module,exports){
'use strict';

exports.CandlestickChart = require('./CandlestickChart');

},{"./CandlestickChart":12}],17:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;

module.exports = createReactClass({

  displayName: 'Legend',

  propTypes: {
    className: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array.isRequired,
    itemClassName: PropTypes.string,
    margins: PropTypes.object,
    text: PropTypes.string,
    width: PropTypes.number.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-legend',
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      },
      itemClassName: 'rd3-legend-item',
      text: '#000'
    };
  },
  render: function render() {
    var props = this.props;

    var textStyle = {
      color: 'black',
      fontSize: '50%',
      verticalAlign: 'top'
    };

    var legendItems = [];

    props.data.forEach(function (series, idx) {
      var itemStyle = {
        color: props.colors(props.colorAccessor(series, idx)),
        lineHeight: '60%',
        fontSize: '200%'
      };

      legendItems.push(React.createElement('li', {
        key: idx,
        className: props.itemClassName,
        style: itemStyle
      }, React.createElement('span', {
        style: textStyle
      }, series.name)));
    });

    var topMargin = props.margins.top;

    var legendBlockStyle = {
      wordWrap: 'break-word',
      width: props.width,
      paddingLeft: 0,
      marginBottom: 0,
      marginTop: topMargin,
      listStylePosition: 'inside'
    };

    return React.createElement('ul', {
      className: props.className,
      style: legendBlockStyle
    }, legendItems);
  }
});

},{}],18:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
  displayName: 'exports',

  // TODO: PropTypes.any
  propTypes: {
    structure: PropTypes.any,
    id: PropTypes.any,
    vnode: PropTypes.any
  },

  _animateCircle: function _animateCircle() {
    this.props.structure.cursor('voronoi').cursor(this.props.id).update(function () {
      return 'active';
    });
    // this.props.pubsub.emit('animate', this.props.id);
  },
  _restoreCircle: function _restoreCircle() {
    this.props.structure.cursor('voronoi').cursor(this.props.id).update(function () {
      return 'inactive';
    });
    // this.props.pubsub.emit('restore', this.props.id);
  },
  _drawPath: function _drawPath(d) {
    if (d === undefined) {
      return '';
    }
    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    return React.createElement('path', {
      onMouseOver: this._animateCircle,
      onMouseOut: this._restoreCircle,
      fill: 'white',
      opacity: '0',
      d: this._drawPath(this.props.vnode)
    });
  }
});

},{}],19:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({
  displayName: 'exports',

  propTypes: {
    x: PropTypes.number,
    y: PropTypes.number,
    child: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.element]),
    show: PropTypes.bool
  },

  render: function render() {
    var props = this.props;
    var display = this.props.show ? 'inherit' : 'none';
    var containerStyles = {
      position: 'fixed',
      top: props.y,
      left: props.x,
      display: display,
      opacity: 0.8
    };

    // TODO: add 'right: 0px' style when tooltip is off the chart
    var tooltipStyles = {
      position: 'absolute',
      backgroundColor: 'white',
      border: '1px solid',
      borderColor: '#ddd',
      borderRadius: '2px',
      padding: '10px',
      marginLeft: '10px',
      marginRight: '10px',
      marginTop: '-15px'
    };
    return React.createElement('div', { style: containerStyles }, React.createElement('div', { style: tooltipStyles }, props.child));
  }
});

},{}],20:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var d3 = window.d3;
var Polygon = require('./Polygon');

module.exports = createReactClass({

  displayName: 'Voronoi',

  // TODO: PropTypes.any
  propTypes: {
    xScale: PropTypes.any,
    yScale: PropTypes.any,
    width: PropTypes.any,
    height: PropTypes.any,
    structure: PropTypes.any,
    data: PropTypes.any
  },

  render: function render() {
    var _this = this;

    var xScale = this.props.xScale;
    var yScale = this.props.yScale;

    var voronoi = d3.geom.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).clipExtent([[0, 0], [this.props.width, this.props.height]]);

    var regions = voronoi(this.props.data).map(function (vnode, idx) {
      return React.createElement(Polygon, { structure: _this.props.structure, key: idx, id: vnode.point.id, vnode: vnode });
    });

    return React.createElement('g', null, regions);
  }
});

},{"./Polygon":18}],21:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'AxisLine',

  propTypes: {
    scale: PropTypes.func.isRequired,
    innerTickSize: PropTypes.number,
    outerTickSize: PropTypes.number,
    tickPadding: PropTypes.number,
    tickArguments: PropTypes.array,
    fill: PropTypes.string,
    stroke: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      innerTickSize: 6,
      outerTickSize: 6,
      tickPadding: 3,
      fill: 'none',
      tickArguments: [10],
      tickValues: null,
      tickFormat: null
    };
  },
  _d3_scaleExtent: function _d3_scaleExtent(domain) {
    var start = domain[0];
    var stop = domain[domain.length - 1];
    return start < stop ? [start, stop] : [stop, start];
  },
  _d3_scaleRange: function _d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : this._d3_scaleExtent(scale.range());
  },
  render: function render() {
    var props = this.props;
    var sign = props.orient === 'top' || props.orient === 'left' ? -1 : 1;

    var range = this._d3_scaleRange(props.scale);

    var d = void 0;
    if (props.orient === 'bottom' || props.orient === 'top') {
      d = 'M' + range[0] + ',' + sign * props.outerTickSize + 'V0H' + range[1] + 'V' + sign * props.outerTickSize;
    } else {
      d = 'M' + sign * props.outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + sign * props.outerTickSize;
    }

    return React.createElement('path', {
      className: 'domain',
      d: d,
      style: { shapeRendering: 'crispEdges' },
      fill: props.fill,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth
    });
  }
});

},{}],22:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var React = window.React;
var PropTypes = window.PropTypes;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'AxisTick',

  propTypes: {
    scale: PropTypes.func.isRequired,
    orient: PropTypes.oneOf(['top', 'bottom', 'left', 'right']).isRequired,
    orient2nd: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    horizontal: PropTypes.bool,
    tickArguments: PropTypes.array,
    tickValues: PropTypes.array,
    innerTickSize: PropTypes.number,
    outerTickSize: PropTypes.number,
    tickPadding: PropTypes.number,
    tickFormat: PropTypes.func,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    gridHorizontal: PropTypes.bool,
    gridVertical: PropTypes.bool,
    gridHorizontalStroke: PropTypes.string,
    gridVerticalStroke: PropTypes.string,
    gridHorizontalStrokeWidth: PropTypes.number,
    gridVerticalStrokeWidth: PropTypes.number,
    gridHorizontalStrokeDash: PropTypes.string,
    gridVerticalStrokeDash: PropTypes.string
  },
  getDefaultProps: function getDefaultProps() {
    return {
      innerTickSize: 6,
      outerTickSize: 6,
      tickStroke: '#000',
      tickPadding: 3,
      tickArguments: [10],
      tickValues: null,
      gridHorizontal: false,
      gridVertical: false,
      gridHorizontalStroke: '#D8D7D7',
      gridVerticalStroke: '#D8D7D7',
      gridHorizontalStrokeWidth: 1,
      gridVerticalStrokeWidth: 1,
      gridHorizontalStrokeDash: '5, 5',
      gridVerticalStrokeDash: '5, 5'
    };
  },
  render: function render() {
    var props = this.props;

    var tr = void 0;
    var textAnchor = void 0;
    var textTransform = void 0;
    var tickFormat = void 0;
    var y1 = void 0;
    var y2 = void 0;
    var dy = void 0;
    var x1 = void 0;
    var x2 = void 0;

    var gridStrokeWidth = void 0;
    var gridStroke = void 0;
    var gridStrokeDashArray = void 0;
    var x2grid = void 0;
    var y2grid = void 0;
    var gridOn = false;

    var sign = props.orient === 'top' || props.orient === 'right' ? -1 : 1;
    var tickSpacing = Math.max(props.innerTickSize, 0) + props.tickPadding;

    var scale = props.scale;

    var ticks = void 0;
    if (props.tickValues) {
      ticks = props.tickValues;
    } else if (scale.ticks) {
      ticks = scale.ticks.apply(scale, props.tickArguments);
    } else {
      ticks = scale.domain();
    }

    if (props.tickFormatting) {
      tickFormat = props.tickFormatting;
    } else if (scale.tickFormat) {
      tickFormat = scale.tickFormat.apply(scale, props.tickArguments);
    } else {
      tickFormat = function tickFormat(d) {
        return d;
      };
    }

    var adjustedScale = scale.rangeBand ? function (d) {
      return scale(d) + scale.rangeBand() / 2;
    } : scale;

    // Still working on this
    // Ticks and lines are not fully aligned
    // in some orientations
    switch (props.orient) {
      case 'top':
        tr = function tr(tick) {
          return 'translate(' + adjustedScale(tick) + ',0)';
        };
        textAnchor = 'middle';
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy = sign < 0 ? '0em' : '.71em';
        x2grid = 0;
        y2grid = -props.height;
        break;
      case 'bottom':
        tr = function tr(tick) {
          return 'translate(' + adjustedScale(tick) + ',0)';
        };
        textAnchor = 'middle';
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy = sign < 0 ? '0em' : '.71em';
        x2grid = 0;
        y2grid = -props.height;
        break;
      case 'left':
        tr = function tr(tick) {
          return 'translate(0,' + adjustedScale(tick) + ')';
        };
        textAnchor = 'end';
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = '.32em';
        x2grid = props.width;
        y2grid = 0;
        break;
      case 'right':
        tr = function tr(tick) {
          return 'translate(0,' + adjustedScale(tick) + ')';
        };
        textAnchor = 'start';
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = '.32em';
        x2grid = -props.width;
        y2grid = 0;
        break;
      default:
        break;
    }

    if (props.horizontalChart) {
      textTransform = 'rotate(-90)';
      var _ref = [x1, -y1 || 0];
      y1 = _ref[0];
      x1 = _ref[1];

      switch (props.orient) {
        case 'top':
          textAnchor = 'start';
          dy = '.32em';
          break;
        case 'bottom':
          textAnchor = 'end';
          dy = '.32em';
          break;
        case 'left':
          textAnchor = 'middle';
          dy = sign < 0 ? '.71em' : '0em';
          break;
        case 'right':
          textAnchor = 'middle';
          dy = sign < 0 ? '.71em' : '0em';
          break;
        default:
          break;
      }
    }

    if (props.gridHorizontal) {
      gridOn = true;
      gridStrokeWidth = props.gridHorizontalStrokeWidth;
      gridStroke = props.gridHorizontalStroke;
      gridStrokeDashArray = props.gridHorizontalStrokeDash;
    } else if (props.gridVertical) {
      gridOn = true;
      gridStrokeWidth = props.gridVerticalStrokeWidth;
      gridStroke = props.gridVerticalStroke;
      gridStrokeDashArray = props.gridVerticalStrokeDash;
    }

    // return grid line if grid is enabled and grid line is not on at same position as other axis.
    var gridLine = function gridLine(pos) {
      if (gridOn && !(props.orient2nd === 'left' && pos === 0) && !(props.orient2nd === 'right' && pos === props.width) && !((props.orient === 'left' || props.orient === 'right') && pos === props.height)) {
        return React.createElement('line', { style: {
            strokeWidth: gridStrokeWidth,
            shapeRendering: 'crispEdges',
            stroke: gridStroke,
            strokeDasharray: gridStrokeDashArray
          }, x2: x2grid, y2: y2grid
        });
      }
      return null;
    };

    var optionalTextProps = textTransform ? {
      transform: textTransform
    } : {};

    return React.createElement('g', null, ticks.map(function (tick, idx) {
      return React.createElement('g', { key: idx, className: 'tick', transform: tr(tick) }, gridLine(adjustedScale(tick)), React.createElement('line', {
        style: {
          shapeRendering: 'crispEdges',
          opacity: '1',
          stroke: props.tickStroke
        },
        x2: x2,
        y2: y2
      }), React.createElement('text', _extends({
        strokeWidth: '0.01',
        dy: dy, x: x1, y: y1,
        style: { stroke: props.tickTextStroke, fill: props.tickTextStroke },
        textAnchor: textAnchor
      }, optionalTextProps), ('' + tickFormat(tick)).split('\n').map(function (tickLabel, index) {
        return React.createElement('tspan', { x: x1 || 0, dy: dy, key: index }, tickLabel);
      })));
    }));
  }
});

},{}],23:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Label',

  propTypes: {
    height: PropTypes.number,
    horizontalChart: PropTypes.bool,
    horizontalTransform: PropTypes.string,
    label: PropTypes.string.isRequired,
    width: PropTypes.number,
    strokeWidth: PropTypes.number,
    textAnchor: PropTypes.string,
    verticalTransform: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      horizontalTransform: 'rotate(270)',
      strokeWidth: 0.01,
      textAnchor: 'middle',
      verticalTransform: 'rotate(0)'
    };
  },
  render: function render() {
    var props = this.props;

    if (!props.label) {
      return React.createElement('text', null);
    }

    var transform = void 0;
    var x = void 0;
    var y = void 0;
    if (props.orient === 'top' || props.orient === 'bottom') {
      transform = props.verticalTransform;
      x = props.width / 2;
      y = props.offset;

      if (props.horizontalChart) {
        transform = 'rotate(180 ' + x + ' ' + y + ') ' + transform;
      }
    } else {
      // left, right
      transform = props.horizontalTransform;
      x = -props.height / 2;
      if (props.orient === 'left') {
        y = -props.offset;
      } else {
        y = props.offset;
      }
    }

    return React.createElement('text', {
      strokeWidth: props.strokeWidth.toString(),
      textAnchor: props.textAnchor,
      transform: transform,
      y: y,
      x: x
    }, props.label);
  }
});

},{}],24:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;
var d3 = window.d3;
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = createReactClass({

  displayName: 'XAxis',

  propTypes: {
    fill: PropTypes.string,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    horizontalChart: PropTypes.bool,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.string,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    xAxisClassName: PropTypes.string,
    xAxisLabel: PropTypes.string,
    xAxisTickValues: PropTypes.array,
    xAxisOffset: PropTypes.number,
    xScale: PropTypes.func.isRequired,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    yOrient: PropTypes.oneOf(['left', 'right']),
    gridVertical: PropTypes.bool,
    gridVerticalStroke: PropTypes.string,
    gridVerticalStrokeWidth: PropTypes.number,
    gridVerticalStrokeDash: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: 'none',
      strokeWidth: '1',
      tickStroke: '#000',
      xAxisClassName: 'rd3-x-axis',
      xAxisLabel: '',
      xAxisLabelOffset: 10,
      xAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = 'translate(0 ,' + (props.xAxisOffset + props.height) + ')';

    var tickArguments = void 0;
    if (typeof props.xAxisTickCount !== 'undefined') {
      tickArguments = [props.xAxisTickCount];
    }

    if (typeof props.xAxisTickInterval !== 'undefined') {
      tickArguments = [d3.time[props.xAxisTickInterval.unit], props.xAxisTickInterval.interval];
    }

    return React.createElement('g', {
      className: props.xAxisClassName,
      transform: t
    }, React.createElement(AxisTicks, {
      tickValues: props.xAxisTickValues,
      tickFormatting: props.tickFormatting,
      tickArguments: tickArguments,
      tickStroke: props.tickStroke,
      tickTextStroke: props.tickTextStroke,
      innerTickSize: props.tickSize,
      scale: props.xScale,
      orient: props.xOrient,
      orient2nd: props.yOrient,
      height: props.height,
      width: props.width,
      horizontalChart: props.horizontalChart,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(AxisLine, _extends({
      scale: props.xScale,
      stroke: props.stroke,
      orient: props.xOrient,
      outerTickSize: props.tickSize
    }, props)), React.createElement(Label, {
      horizontalChart: props.horizontalChart,
      label: props.xAxisLabel,
      offset: props.xAxisLabelOffset,
      orient: props.xOrient,
      margins: props.margins,
      width: props.width
    }));
  }
});

},{"./AxisLine":21,"./AxisTicks":22,"./Label":23}],25:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var createReactClass = window.createReactClass;
var React = window.React;
var d3 = window.d3;
var AxisTicks = require('./AxisTicks');
var AxisLine = require('./AxisLine');
var Label = require('./Label');

module.exports = createReactClass({

  displayName: 'YAxis',

  propTypes: {
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.string,
    tickStroke: PropTypes.string,
    tickTextStroke: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    horizontalChart: PropTypes.bool,
    yAxisClassName: PropTypes.string,
    yAxisLabel: PropTypes.string,
    yAxisOffset: PropTypes.number,
    yAxisTickValues: PropTypes.array,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    yOrient: PropTypes.oneOf(['left', 'right']),
    yScale: PropTypes.func.isRequired,
    gridVertical: PropTypes.bool,
    gridVerticalStroke: PropTypes.string,
    gridVerticalStrokeWidth: PropTypes.number,
    gridVerticalStrokeDash: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fill: 'none',
      stroke: '#000',
      strokeWidth: '1',
      tickStroke: '#000',
      yAxisClassName: 'rd3-y-axis',
      yAxisLabel: '',
      yAxisOffset: 0,
      xOrient: 'bottom',
      yOrient: 'left'
    };
  },
  render: function render() {
    var props = this.props;

    var t = void 0;
    if (props.yOrient === 'right') {
      t = 'translate(' + (props.yAxisOffset + props.width) + ', 0)';
    } else {
      t = 'translate(' + props.yAxisOffset + ', 0)';
    }

    var tickArguments = void 0;
    if (props.yAxisTickCount) {
      tickArguments = [props.yAxisTickCount];
    }

    if (props.yAxisTickInterval) {
      tickArguments = [d3.time[props.yAxisTickInterval.unit], props.yAxisTickInterval.interval];
    }

    return React.createElement('g', {
      className: props.yAxisClassName,
      transform: t
    }, React.createElement(AxisTicks, {
      innerTickSize: props.tickSize,
      orient: props.yOrient,
      orient2nd: props.xOrient,
      tickArguments: tickArguments,
      tickFormatting: props.tickFormatting,
      tickStroke: props.tickStroke,
      tickTextStroke: props.tickTextStroke,
      tickValues: props.yAxisTickValues,
      scale: props.yScale,
      height: props.height,
      width: props.width,
      horizontalChart: props.horizontalChart,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), React.createElement(AxisLine, _extends({
      orient: props.yOrient,
      outerTickSize: props.tickSize,
      scale: props.yScale,
      stroke: props.stroke
    }, props)), React.createElement(Label, {
      height: props.height,
      horizontalChart: props.horizontalChart,
      label: props.yAxisLabel,
      margins: props.margins,
      offset: props.yAxisLabelOffset,
      orient: props.yOrient
    }));
  }
});

},{"./AxisLine":21,"./AxisTicks":22,"./Label":23}],26:[function(require,module,exports){
'use strict';

exports.XAxis = require('./XAxis');
exports.YAxis = require('./YAxis');

},{"./XAxis":24,"./YAxis":25}],27:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'BasicChart',

  propTypes: {
    children: PropTypes.node,
    className: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    svgClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-basic-chart',
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      title: ''
    };
  },
  _renderTitle: function _renderTitle() {
    var props = this.props;

    if (props.title !== '') {
      return React.createElement('h4', {
        className: props.titleClassName
      }, props.title);
    }
    return null;
  },
  _renderChart: function _renderChart() {
    var props = this.props;

    return React.createElement('svg', {
      className: props.svgClassName,
      height: props.height,
      viewBox: props.viewBox,
      width: props.width
    }, props.children);
  },
  render: function render() {
    var props = this.props;

    return React.createElement('div', {
      className: props.className
    }, this._renderTitle(), this._renderChart());
  }
});

},{}],28:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var LegendChart = require('./LegendChart');
var BasicChart = require('./BasicChart');

module.exports = createReactClass({

  displayName: 'Chart',

  propTypes: {
    legend: PropTypes.bool,
    svgClassName: PropTypes.string,
    titleClassName: PropTypes.string,
    shouldUpdate: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      legend: false,
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      shouldUpdate: true
    };
  },
  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {
    return nextProps.shouldUpdate;
  },
  render: function render() {
    var props = this.props;

    if (props.legend) {
      return React.createElement(LegendChart, _extends({
        svgClassName: props.svgClassName,
        titleClassName: props.titleClassName
      }, this.props));
    }
    return React.createElement(BasicChart, _extends({
      svgClassName: props.svgClassName,
      titleClassName: props.titleClassName
    }, this.props));
  }
});

},{"./BasicChart":27,"./LegendChart":29}],29:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var Legend = require('../Legend');
var d3 = window.d3;

module.exports = createReactClass({

  displayName: 'LegendChart',

  propTypes: {
    children: PropTypes.node,
    createClass: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array,
    height: PropTypes.node,
    legend: PropTypes.bool,
    legendPosition: PropTypes.string,
    margins: PropTypes.object,
    sideOffset: PropTypes.number,
    svgClassName: PropTypes.string,
    title: PropTypes.node,
    titleClassName: PropTypes.string,
    viewBox: PropTypes.string,
    width: PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-legend-chart',
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      },
      data: [],
      legend: false,
      legendPosition: 'right',
      sideOffset: 90,
      svgClassName: 'rd3-chart',
      titleClassName: 'rd3-chart-title',
      title: ''
    };
  },
  _renderLegend: function _renderLegend() {
    var props = this.props;

    if (props.legend) {
      return React.createElement(Legend, {
        colors: props.colors,
        colorAccessor: props.colorAccessor,
        data: props.data,
        legendPosition: props.legendPosition,
        margins: props.margins,
        width: props.sideOffset
      });
    }

    return null;
  },
  _renderTitle: function _renderTitle() {
    var props = this.props;

    if (props.title !== '') {
      return React.createElement('h4', {
        className: props.titleClassName
      }, props.title);
    }
    return null;
  },
  _renderChart: function _renderChart() {
    var props = this.props;

    return React.createElement('svg', {
      className: props.svgClassName,
      height: '100%',
      viewBox: props.viewBox,
      width: '100%'
    }, props.children);
  },
  render: function render() {
    var props = this.props;

    return React.createElement('div', {
      className: props.className,
      style: { width: props.width, height: props.height }
    }, this._renderTitle(), React.createElement('div', { style: { display: 'table', width: '100%', height: '100%' } }, React.createElement('div', { style: { display: 'table-cell', width: '100%', height: '100%' } }, this._renderChart()), React.createElement('div', { style: { display: 'table-cell', width: props.sideOffset, verticalAlign: 'top' } }, this._renderLegend())));
  }
});

},{"../Legend":17}],30:[function(require,module,exports){
'use strict';

exports.BasicChart = require('./BasicChart');
exports.Chart = require('./Chart');
exports.LegendChart = require('./LegendChart');

},{"./BasicChart":27,"./Chart":28,"./LegendChart":29}],31:[function(require,module,exports){
'use strict';

exports.XAxis = require('./axes').XAxis;
exports.YAxis = require('./axes').YAxis;
exports.Chart = require('./charts').Chart;
exports.LegendChart = require('./charts').LegendChart;
exports.Legend = require('./Legend');
exports.Tooltip = require('./Tooltip');
exports.Voronoi = require('./Voronoi');

},{"./Legend":17,"./Tooltip":19,"./Voronoi":20,"./axes":26,"./charts":30}],32:[function(require,module,exports){
'use strict';

exports.BarChart = require('./barchart').BarChart;
exports.LineChart = require('./linechart').LineChart;
exports.PieChart = require('./piechart').PieChart;
exports.AreaChart = require('./areachart').AreaChart;
exports.Treemap = require('./treemap').Treemap;
exports.ScatterChart = require('./scatterchart').ScatterChart;
exports.CandlestickChart = require('./candlestick').CandlestickChart;

},{"./areachart":5,"./barchart":10,"./candlestick":16,"./linechart":38,"./piechart":48,"./scatterchart":53,"./treemap":58}],33:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var VoronoiCircleContainer = require('./VoronoiCircleContainer');
var Line = require('./Line');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    color: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array,
    interpolationType: PropTypes.string,
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return d.y;
      },
      interpolationType: 'linear',
      hoverAnimation: false
    };
  },
  _isDate: function _isDate(d, accessor) {
    return Object.prototype.toString.call(accessor(d)) === '[object Date]';
  },
  render: function render() {
    var props = this.props;
    var xScale = props.xScale;
    var yScale = props.yScale;
    var xAccessor = props.xAccessor;
    var yAccessor = props.yAccessor;

    var interpolatePath = d3.svg.line().y(function (d) {
      return props.yScale(yAccessor(d));
    }).interpolate(props.interpolationType);

    if (this._isDate(props.data[0].values[0], xAccessor)) {
      interpolatePath.x(function (d) {
        return props.xScale(props.xAccessor(d).getTime());
      });
    } else {
      interpolatePath.x(function (d) {
        return props.xScale(props.xAccessor(d));
      });
    }

    var lines = props.data.map(function (series, idx) {
      return React.createElement(Line, {
        path: interpolatePath(series.values),
        stroke: props.colors(props.colorAccessor(series, idx)),
        strokeWidth: series.strokeWidth,
        strokeDashArray: series.strokeDashArray,
        seriesName: series.name,
        key: idx
      });
    });

    var voronoi = d3.geom.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).clipExtent([[0, 0], [props.width, props.height]]);

    var cx = void 0;
    var cy = void 0;
    var circleFill = void 0;
    var regions = voronoi(props.value).map(function (vnode, idx) {
      var point = vnode.point.coord;
      cx = props.xScale(point.x);
      cy = props.yScale(point.y);

      circleFill = props.colors(props.colorAccessor(vnode, vnode.point.seriesIndex));

      return React.createElement(VoronoiCircleContainer, {
        key: idx,
        circleFill: circleFill,
        vnode: vnode,
        hoverAnimation: props.hoverAnimation,
        cx: cx, cy: cy,
        circleRadius: props.circleRadius,
        onMouseOver: props.onMouseOver,
        dataPoint: {
          xValue: point.x,
          yValue: point.y,
          seriesName: vnode.point.series.name
        }
      });
    });

    return React.createElement('g', null, React.createElement('g', null, regions), React.createElement('g', null, lines));
  }
});

},{"./Line":34,"./VoronoiCircleContainer":37}],34:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Line',

  propTypes: {
    fill: PropTypes.string,
    path: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    strokeDashArray: PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      stroke: '#3182bd',
      fill: 'none',
      strokeWidth: 1,
      className: 'rd3-linechart-path'
    };
  },
  render: function render() {
    var props = this.props;
    return React.createElement('path', {
      d: props.path,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      strokeDasharray: props.strokeDashArray,
      fill: props.fill,
      className: props.className
    });
  }
});

},{}],35:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    Tooltip = _require.Tooltip;

var DataSeries = require('./DataSeries');
var utils = require('../utils');

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin,
    TooltipMixin = _require2.TooltipMixin;

module.exports = createReactClass({

  displayName: 'LineChart',

  propTypes: {
    circleRadius: PropTypes.number,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    data: PropTypes.array.isRequired
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      className: 'rd3-linechart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 50, left: 45 },
      xAxisClassName: 'rd3-linechart-xaxis',
      yAxisClassName: 'rd3-linechart-yaxis',
      data: []
    };
  },

  _calculateScales: utils.calculateScales,

  render: function render() {
    var props = this.props;

    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    if (!Array.isArray(props.data)) {
      props.data = [props.data];
    }

    // Returns an object of flattened allValues, xValues, and yValues
    var flattenedData = utils.flattenData(props.data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues;
    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;
    var scales = this._calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);

    return React.createElement('span', { onMouseLeave: this.onMouseLeave }, React.createElement(Chart, {
      viewBox: this.getViewBox(),
      legend: props.legend,
      sideOffset: props.sideOffset,
      data: props.data,
      margins: props.margins,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      width: props.width,
      height: props.height,
      title: props.title,
      shouldUpdate: !this.state.changeState
    }, React.createElement('g', { transform: trans, className: props.className }, React.createElement(XAxis, {
      xAxisClassName: props.xAxisClassName,
      strokeWidth: props.xAxisStrokeWidth,
      xAxisTickValues: props.xAxisTickValues,
      xAxisTickCount: props.xAxisTickCount,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisOffset: props.xAxisOffset,
      xScale: scales.xScale,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      data: props.data,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YAxis, {
      yAxisClassName: props.yAxisClassName,
      strokeWidth: props.yAxisStrokeWidth,
      yScale: scales.yScale,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yAxisOffset: props.yAxisOffset,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      xOrient: props.xOrient,
      yOrient: yOrient,
      margins: svgMargins,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      stroke: props.axesColor,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), React.createElement(DataSeries, {
      xScale: scales.xScale,
      yScale: scales.yScale,
      xAccessor: props.xAccessor,
      yAccessor: props.yAccessor,
      hoverAnimation: props.hoverAnimation,
      circleRadius: props.circleRadius,
      data: props.data,
      value: allValues,
      interpolationType: props.interpolationType,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      width: innerWidth,
      height: innerHeight,
      onMouseOver: this.onMouseOver
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":31,"../mixins":43,"../utils":59,"./DataSeries":33}],36:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'VoronoiCircle',

  // TODO: Check prop types
  propTypes: {
    handleMouseOver: PropTypes.any,
    handleMouseLeave: PropTypes.any,
    voronoiPath: PropTypes.any,
    cx: PropTypes.any,
    cy: PropTypes.any,
    circleRadius: PropTypes.any,
    circleFill: PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      circleFill: '#1f77b4'
    };
  },
  render: function render() {
    return React.createElement('g', null, React.createElement('path', {
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave,
      fill: 'transparent',
      d: this.props.voronoiPath
    }), React.createElement('circle', {
      onMouseOver: this.props.handleMouseOver,
      onMouseLeave: this.props.handleMouseLeave,
      cx: this.props.cx,
      cy: this.props.cy,
      r: this.props.circleRadius,
      fill: this.props.circleFill,
      className: 'rd3-linechart-circle'
    }));
  }
});

},{}],37:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = window.ReactDOM,
    findDOMNode = _require.findDOMNode;

var shade = require('../utils').shade;
var VoronoiCircle = require('./VoronoiCircle');

module.exports = createReactClass({

  displayName: 'VornoiCircleContainer',

  propTypes: {
    circleRadius: PropTypes.any,
    circleFill: PropTypes.any,
    onMouseOver: PropTypes.any,
    dataPoint: PropTypes.any
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      circleFill: '#1f77b4',
      hoverAnimation: true
    };
  },
  getInitialState: function getInitialState() {
    return {
      circleRadius: this.props.circleRadius,
      circleFill: this.props.circleFill
    };
  },
  _animateCircle: function _animateCircle() {
    var rect = findDOMNode(this).getElementsByTagName('circle')[0].getBoundingClientRect();
    this.props.onMouseOver.call(this, rect.right, rect.top, this.props.dataPoint);
    this.setState({
      circleRadius: this.props.circleRadius * (5 / 4),
      circleFill: shade(this.props.circleFill, 0.2)
    });
  },
  _restoreCircle: function _restoreCircle() {
    this.setState({
      circleRadius: this.props.circleRadius,
      circleFill: this.props.circleFill
    });
  },
  _drawPath: function _drawPath(d) {
    if (d === undefined) {
      return 'M Z';
    }
    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    var props = this.props;

    // animation controller
    var handleMouseOver = void 0;
    var handleMouseLeave = void 0;
    if (props.hoverAnimation) {
      handleMouseOver = this._animateCircle;
      handleMouseLeave = this._restoreCircle;
    } else {
      handleMouseOver = handleMouseLeave = null;
    }

    return React.createElement('g', null, React.createElement(VoronoiCircle, {
      handleMouseOver: handleMouseOver,
      handleMouseLeave: handleMouseLeave,
      voronoiPath: this._drawPath(props.vnode),
      cx: props.cx,
      cy: props.cy,
      circleRadius: this.state.circleRadius,
      circleFill: this.state.circleFill
    }));
  }
});

},{"../utils":59,"./VoronoiCircle":36}],38:[function(require,module,exports){
'use strict';

exports.LineChart = require('./LineChart');

},{"./LineChart":35}],39:[function(require,module,exports){
'use strict';

var d3 = window.d3;
var PropTypes = window.PropTypes;

module.exports = {

  propTypes: {
    axesColor: PropTypes.string,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    data: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    horizontal: PropTypes.bool,
    legend: PropTypes.bool,
    legendOffset: PropTypes.number,
    title: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    xAccessor: PropTypes.func,
    xAxisFormatter: PropTypes.func,
    xAxisLabel: PropTypes.string,
    xAxisLabelOffset: PropTypes.number,
    xAxisTickCount: PropTypes.number,
    xAxisTickInterval: PropTypes.object,
    xAxisTickValues: PropTypes.array,
    xAxisTickStroke: PropTypes.string,
    xAxisTickTextStroke: PropTypes.string,
    xAxisOffset: PropTypes.number,
    xOrient: PropTypes.oneOf(['top', 'bottom']),
    xScale: PropTypes.func,
    yAccessor: PropTypes.func,
    yAxisFormatter: PropTypes.func,
    yAxisLabel: PropTypes.string,
    yAxisLabelOffset: PropTypes.number,
    yAxisTickCount: PropTypes.number,
    yAxisTickInterval: PropTypes.object,
    yAxisTickValues: PropTypes.array,
    yAxisTickStroke: PropTypes.string,
    yAxisTickTextStroke: PropTypes.string,
    yAxisOffset: PropTypes.number,
    yOrient: PropTypes.oneOf(['default', 'left', 'right']),
    yScale: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      axesColor: '#000',
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      },
      height: 200,
      horizontal: false,
      legend: false,
      legendOffset: 120,
      title: '',
      width: 400,
      // xAxisFormatter: no predefined value right now
      xAxisLabel: '',
      xAxisLabelOffset: 38,
      xAxisOffset: 0,
      // xAxisTickCount: no predefined value right now
      // xAxisTickInterval: no predefined value right now
      // xAxisTickValues: no predefined value right now
      xAxisTickStroke: '#000',
      xAxisTickTextStroke: '#000',
      xOrient: 'bottom',
      // xScale: no predefined value right now
      // yAxisFormatter: no predefined value right now
      yAxisLabel: '',
      yAxisLabelOffset: 35,
      yAxisOffset: 0,
      // yAxisTickCount: no predefined value right now
      // yAxisTickInterval: no predefined value right now
      // yAxisTickValues: no predefined value right now
      yAxisTickStroke: '#000',
      yAxisTickTextStroke: '#000',
      yOrient: 'default'
      // yScale: no predefined value right now
    };
  },
  getYOrient: function getYOrient() {
    var yOrient = this.props.yOrient;

    if (yOrient === 'default') {
      return this.props.horizontal ? 'right' : 'left';
    }

    return yOrient;
  }
};

},{}],40:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;

module.exports = {
  propTypes: {
    xAccessor: PropTypes.func,
    yAccessor: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      xAccessor: function xAccessor(d) {
        return d.x;
      },
      yAccessor: function yAccessor(d) {
        return d.y;
      }
    };
  }
};

},{}],41:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;

module.exports = {

  propTypes: {
    showTooltip: PropTypes.bool,
    tooltipFormat: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      showTooltip: true,
      tooltipFormat: function tooltipFormat(d) {
        return String(d.yValue);
      }
    };
  },
  getInitialState: function getInitialState() {
    return {
      tooltip: {
        x: 0,
        y: 0,
        child: '',
        show: false
      },
      changeState: false
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps() {
    this.setState({
      changeState: false
    });
  },
  onMouseOver: function onMouseOver(x, y, dataPoint) {
    if (!this.props.showTooltip) {
      return;
    }
    this.setState({
      tooltip: {
        x: x,
        y: y,
        child: this.props.tooltipFormat.call(this, dataPoint),
        show: true
      },
      changeState: true
    });
  },
  onMouseLeave: function onMouseLeave() {
    if (!this.props.showTooltip) {
      return;
    }
    this.setState({
      tooltip: {
        x: 0,
        y: 0,
        child: '',
        show: false
      },
      changeState: true
    });
  }
};

},{}],42:[function(require,module,exports){

'use strict';

var PropTypes = window.PropTypes;

module.exports = {

  propTypes: {
    viewBox: PropTypes.string,
    viewBoxObject: PropTypes.object
  },

  getViewBox: function getViewBox() {
    if (this.props.viewBoxObject) {
      var v = this.props.viewBoxObject;
      return [v.x, v.y, v.width, v.height].join(' ');
    } else if (this.props.viewBox) {
      return this.props.viewBox;
    }
    return null;
  },
  getDimensions: function getDimensions() {
    var props = this.props;
    var horizontal = props.horizontal,
        margins = props.margins,
        viewBoxObject = props.viewBoxObject,
        xOrient = props.xOrient;

    var yOrient = this.getYOrient();

    var width = void 0;
    var height = void 0;
    if (viewBoxObject) {
      width = viewBoxObject.width;
      height = viewBoxObject.height;
    } else {
      width = props.width;
      height = props.height;
    }

    var svgWidth = void 0;
    var svgHeight = void 0;
    var svgMargins = void 0;
    var trans = void 0;
    if (horizontal) {
      var center = width / 2;
      trans = 'rotate(90 ' + center + ' ' + center + ') ';
      svgWidth = height;
      svgHeight = width;
      svgMargins = {
        left: margins.top,
        top: margins.right,
        right: margins.bottom,
        bottom: margins.left
      };
    } else {
      trans = '';
      svgWidth = width;
      svgHeight = height;
      svgMargins = margins;
    }

    var xAxisOffset = Math.abs(props.xAxisOffset || 0);
    var yAxisOffset = Math.abs(props.yAxisOffset || 0);

    var xOffset = svgMargins.left + (yOrient === 'left' ? yAxisOffset : 0);
    var yOffset = svgMargins.top + (xOrient === 'top' ? xAxisOffset : 0);
    trans += 'translate(' + xOffset + ', ' + yOffset + ')';

    return {
      innerHeight: svgHeight - svgMargins.top - svgMargins.bottom - xAxisOffset,
      innerWidth: svgWidth - svgMargins.left - svgMargins.right - yAxisOffset,
      trans: trans,
      svgMargins: svgMargins
    };
  }
};

},{}],43:[function(require,module,exports){
'use strict';

exports.CartesianChartPropsMixin = require('./CartesianChartPropsMixin');
exports.DefaultAccessorsMixin = require('./DefaultAccessorsMixin');
exports.ViewBoxMixin = require('./ViewBoxMixin');
exports.TooltipMixin = require('./TooltipMixin');

},{"./CartesianChartPropsMixin":39,"./DefaultAccessorsMixin":40,"./TooltipMixin":41,"./ViewBoxMixin":42}],44:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;

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
    return React.createElement('text', {
      className: 'rd3-piechart-value',
      transform: 'translate(' + arc.centroid() + ')',
      dy: '.35em',
      style: {
        shapeRendering: 'crispEdges',
        textAnchor: 'middle',
        fill: props.valueTextFill,
        pointerEvents: 'none'
      }
    }, formattedValue);
  },
  renderOuterLabel: function renderOuterLabel(props) {
    var rotate = 'rotate(' + (props.startAngle + props.endAngle) / 2 * (180 / Math.PI) + ')';
    var radius = props.outerRadius;
    var dist = radius + 35;
    var angle = (props.startAngle + props.endAngle) / 2;
    var x = dist * (1.2 * Math.sin(angle));
    var y = -dist * Math.cos(angle);
    var t = 'translate(' + x + ',' + y + ')';

    return React.createElement('g', null, React.createElement('line', {
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
    }), React.createElement('text', {
      className: 'rd3-piechart-label',
      transform: t,
      dy: '.35em',
      style: {
        textAnchor: 'middle',
        fill: props.labelTextFill,
        shapeRendering: 'crispEdges',
        pointerEvents: 'none'
      }
    }, props.label));
  },
  render: function render() {
    var props = this.props;

    var arc = d3.svg.arc().innerRadius(props.innerRadius).outerRadius(props.outerRadius).startAngle(props.startAngle).endAngle(props.endAngle);

    return React.createElement('g', { className: 'rd3-piechart-arc' }, React.createElement('path', {
      d: arc(),
      fill: props.fill,
      stroke: props.stroke,
      strokeWidth: props.isSelected ? 2 : 1,
      shapeRendering: 'crisp-edges',
      onMouseOver: props.handleMouseOver,
      onMouseLeave: props.handleMouseLeave,
      onClick: props.handleClick,
      style: { cursor: props.hoverAnimation ? 'pointer' : 'default', zIndex: props.isSelected ? 2 : 1 }
    }), props.showOuterLabels ? this.renderOuterLabel(props, arc) : null, props.showInnerLabels ? this.renderInnerLabel(props, arc) : null);
  }
});

},{}],45:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = window.ReactDOM,
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
    if ('function' === typeof this.props.onMouseOver) {
      this.props.onMouseOver(this.props.label);
    }

    this.setState({
      fill: shade(this.props.fill, 0.2)
    });
  },
  _mouseleave: function _mouseleave() {
    if ('function' === typeof this.props.onMouseLeave) {
      this.props.onMouseLeave(this.props.label);
    }

    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;
    var isSelected = props.selectedLabel === props.label;
    var isSelectable = !props.unselectableLabels ? true : props.unselectableLabels.indexOf(props.label) < 0;

    return React.createElement(Arc, _extends({}, this.props, {
      fill: '#1a1718',
      stroke: isSelected ? props.fill : '#373334',
      valueTextFill: isSelectable ? props.fill : '#70696a',
      hoverAnimation: props.hoverAnimation,
      handleMouseOver: props.hoverAnimation ? this._mouseover : null,
      handleMouseLeave: props.hoverAnimation ? this._mouseleave : null,
      handleClick: function handleClick() {
        return isSelectable ? props.onClickArc(props.label, props.idx) : null;
      }
    }));
  }
});

},{"../utils":59,"./Arc":44}],46:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
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
  render: function render() {
    var props = this.props;
    var pie = d3.layout.pie().sort(null);
    var arcData = pie(props.values);

    var arcs = arcData
    // .filter((arc, idx) => props.unselectableLabels.indexOf(props.labels[idx]) < 0) // hides unselectable arc segments
    .map(function (arc, idx) {
      return React.createElement(ArcContainer, {
        key: idx,
        idx: idx,
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
        dataPoint: { yValue: props.values[idx], seriesName: props.labels[idx]

          // added props
        }, selectedLabel: props.selectedLabel,
        onMouseOver: props.onMouseOver,
        onMouseLeave: props.onMouseLeave,
        onClickArc: props.onClickArc,
        unselectableLabels: props.unselectableLabels
      });
    });

    return React.createElement('g', { className: 'rd3-piechart-pie', transform: props.transform }, arcs);
  }
});

},{"./ArcContainer":45}],47:[function(require,module,exports){
'use strict';

var d3 = window.d3;
var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

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

    return React.createElement('span', null, React.createElement(Chart, {
      width: props.width,
      height: props.height,
      title: props.title,
      shouldUpdate: !this.state.changeState
    }, React.createElement('g', { className: 'rd3-piechart' }, React.createElement(DataSeries, {
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
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":31,"../mixins":43,"./DataSeries":46}],48:[function(require,module,exports){
'use strict';

exports.PieChart = require('./PieChart');

},{"./PieChart":47}],49:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var VoronoiCircleContainer = require('./VoronoiCircleContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    circleRadius: PropTypes.number.isRequired,
    className: PropTypes.string,
    colors: PropTypes.func.isRequired,
    colorAccessor: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    xAccessor: PropTypes.func.isRequired,
    xScale: PropTypes.func.isRequired,
    yAccessor: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-scatterchart-dataseries'
    };
  },
  render: function render() {
    var props = this.props;
    var xScale = props.xScale;
    var yScale = props.yScale;
    var xAccessor = props.xAccessor;
    var yAccessor = props.yAccessor;

    var voronoi = d3.geom.voronoi().x(function (d) {
      return xScale(d.coord.x);
    }).y(function (d) {
      return yScale(d.coord.y);
    }).clipExtent([[0, 0], [props.width, props.height]]);

    var regions = voronoi(props.data).map(function (vnode, idx) {
      var point = vnode.point;
      var coord = point.coord;

      var x = xAccessor(coord);
      var y = yAccessor(coord);

      // The circle coordinates
      var cx = void 0;
      var cy = void 0;

      if (Object.prototype.toString.call(x) === '[object Date]') {
        cx = xScale(x.getTime());
      } else {
        cx = xScale(x);
      }

      if (Object.prototype.toString.call(y) === '[object Date]') {
        cy = yScale(y.getTime());
      } else {
        cy = yScale(y);
      }

      return React.createElement(VoronoiCircleContainer, {
        key: idx,
        circleFill: props.colors(props.colorAccessor(point.d, point.seriesIndex)),
        circleRadius: props.circleRadius,
        cx: cx,
        cy: cy,
        vnode: vnode,
        onMouseOver: props.onMouseOver,
        dataPoint: { xValue: x, yValue: y, seriesName: point.series.name }
      });
    });

    return React.createElement('g', {
      className: props.className
    }, regions);
  }
});

},{"./VoronoiCircleContainer":52}],50:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = require('../common'),
    Chart = _require.Chart,
    XAxis = _require.XAxis,
    YAxis = _require.YAxis,
    Tooltip = _require.Tooltip;

var DataSeries = require('./DataSeries');
var utils = require('../utils');

var _require2 = require('../mixins'),
    CartesianChartPropsMixin = _require2.CartesianChartPropsMixin,
    DefaultAccessorsMixin = _require2.DefaultAccessorsMixin,
    ViewBoxMixin = _require2.ViewBoxMixin,
    TooltipMixin = _require2.TooltipMixin;

module.exports = createReactClass({

  displayName: 'ScatterChart',

  propTypes: {
    circleRadius: PropTypes.number,
    className: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    margins: PropTypes.object,
    xAxisClassName: PropTypes.string,
    xAxisStrokeWidth: PropTypes.number,
    yAxisClassName: PropTypes.string,
    yAxisStrokeWidth: PropTypes.number
  },

  mixins: [CartesianChartPropsMixin, DefaultAccessorsMixin, ViewBoxMixin, TooltipMixin],

  getDefaultProps: function getDefaultProps() {
    return {
      circleRadius: 3,
      className: 'rd3-scatterchart',
      hoverAnimation: true,
      margins: { top: 10, right: 20, bottom: 50, left: 45 },
      xAxisClassName: 'rd3-scatterchart-xaxis',
      xAxisStrokeWidth: 1,
      yAxisClassName: 'rd3-scatterchart-yaxis',
      yAxisStrokeWidth: 1
    };
  },

  _calculateScales: utils.calculateScales,

  render: function render() {
    var props = this.props;
    var data = props.data;

    if (!data || data.length < 1) {
      return null;
    }

    var _getDimensions = this.getDimensions(),
        innerWidth = _getDimensions.innerWidth,
        innerHeight = _getDimensions.innerHeight,
        trans = _getDimensions.trans,
        svgMargins = _getDimensions.svgMargins;

    var yOrient = this.getYOrient();
    var domain = props.domain || {};

    // Returns an object of flattened allValues, xValues, and yValues
    var flattenedData = utils.flattenData(data, props.xAccessor, props.yAccessor);

    var allValues = flattenedData.allValues;
    var xValues = flattenedData.xValues;
    var yValues = flattenedData.yValues;

    var scales = this._calculateScales(innerWidth, innerHeight, xValues, yValues, domain.x, domain.y);
    var xScale = scales.xScale;
    var yScale = scales.yScale;

    return React.createElement('span', { onMouseLeave: this.onMouseLeave }, React.createElement(Chart, {
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      data: data,
      height: props.height,
      legend: props.legend,
      sideOffset: props.sideOffset,
      margins: props.margins,
      title: props.title,
      viewBox: this.getViewBox(),
      width: props.width,
      shouldUpdate: !this.state.changeState
    }, React.createElement('g', {
      className: props.className,
      transform: trans
    }, React.createElement(XAxis, {
      data: data,
      height: innerHeight,
      horizontalChart: props.horizontal,
      margins: svgMargins,
      stroke: props.axesColor,
      strokeWidth: props.xAxisStrokeWidth.toString(),
      tickFormatting: props.xAxisFormatter,
      tickStroke: props.xAxisTickStroke,
      tickTextStroke: props.xAxisTickTextStroke,
      width: innerWidth,
      xAxisClassName: props.xAxisClassName,
      xAxisLabel: props.xAxisLabel,
      xAxisLabelOffset: props.xAxisLabelOffset,
      xAxisOffset: props.xAxisOffset,
      xAxisTickInterval: props.xAxisTickInterval,
      xAxisTickValues: props.xAxisTickValues,
      xOrient: props.xOrient,
      yOrient: yOrient,
      xScale: xScale,
      gridVertical: props.gridVertical,
      gridVerticalStroke: props.gridVerticalStroke,
      gridVerticalStrokeWidth: props.gridVerticalStrokeWidth,
      gridVerticalStrokeDash: props.gridVerticalStrokeDash
    }), React.createElement(YAxis, {
      data: data,
      width: innerWidth,
      height: innerHeight,
      horizontalChart: props.horizontal,
      margins: svgMargins,
      stroke: props.axesColor,
      strokeWidth: props.yAxisStrokeWidth.toString(),
      tickFormatting: props.yAxisFormatter,
      tickStroke: props.yAxisTickStroke,
      tickTextStroke: props.yAxisTickTextStroke,
      yAxisClassName: props.yAxisClassName,
      yAxisLabel: props.yAxisLabel,
      yAxisLabelOffset: props.yAxisLabelOffset,
      yAxisOffset: props.yAxisOffset,
      yAxisTickValues: props.yAxisTickValues,
      yAxisTickCount: props.yAxisTickCount,
      yScale: yScale,
      xOrient: props.xOrient,
      yOrient: yOrient,
      gridHorizontal: props.gridHorizontal,
      gridHorizontalStroke: props.gridHorizontalStroke,
      gridHorizontalStrokeWidth: props.gridHorizontalStrokeWidth,
      gridHorizontalStrokeDash: props.gridHorizontalStrokeDash
    }), React.createElement(DataSeries, {
      circleRadius: props.circleRadius,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      data: allValues,
      height: innerHeight,
      hoverAnimation: props.hoverAnimation,
      width: innerWidth,
      xAccessor: function xAccessor(coord) {
        return coord.x;
      },
      xScale: xScale,
      yAccessor: function yAccessor(coord) {
        return coord.y;
      },
      yScale: yScale,
      onMouseOver: this.onMouseOver
    }))), props.showTooltip ? React.createElement(Tooltip, this.state.tooltip) : null);
  }
});

},{"../common":31,"../mixins":43,"../utils":59,"./DataSeries":49}],51:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'VoronoiCircle',

  propTypes: {
    circleFill: PropTypes.string.isRequired,
    circleRadius: PropTypes.number.isRequired,
    className: PropTypes.string,
    cx: PropTypes.number.isRequired,
    cy: PropTypes.number.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseOver: PropTypes.func.isRequired,
    pathFill: PropTypes.string,
    voronoiPath: PropTypes.string.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      className: 'rd3-scatterchart-voronoi-circle',
      pathFill: 'transparent'
    };
  },
  render: function render() {
    var props = this.props;

    return React.createElement('g', null, React.createElement('path', {
      d: props.voronoiPath,
      fill: props.pathFill,
      onMouseLeave: props.handleMouseLeave,
      onMouseOver: props.handleMouseOver
    }), React.createElement('circle', {
      cx: props.cx,
      cy: props.cy,
      className: props.className,
      fill: props.circleFill,
      onMouseLeave: props.handleMouseLeave,
      onMouseOver: props.handleMouseOver,
      r: props.circleRadius
    }));
  }
});

},{}],52:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var _require = window.ReactDOM,
    findDOMNode = _require.findDOMNode;

var shade = require('../utils').shade;
var VoronoiCircle = require('./VoronoiCircle');

module.exports = createReactClass({

  displayName: 'VornoiCircleContainer',

  propTypes: {
    circleFill: PropTypes.string,
    circleRadius: PropTypes.number,
    circleRadiusMultiplier: PropTypes.number,
    className: PropTypes.string,
    hoverAnimation: PropTypes.bool,
    shadeMultiplier: PropTypes.number,
    vnode: PropTypes.array.isRequired,
    onMouseOver: PropTypes.func
  },

  getDefaultProps: function getDefaultProps() {
    return {
      circleFill: '#1f77b4',
      circleRadius: 3,
      circleRadiusMultiplier: 1.25,
      className: 'rd3-scatterchart-voronoi-circle-container',
      hoverAnimation: true,
      shadeMultiplier: 0.2
    };
  },
  getInitialState: function getInitialState() {
    return {
      circleFill: this.props.circleFill,
      circleRadius: this.props.circleRadius
    };
  },
  _animateCircle: function _animateCircle() {
    var props = this.props;

    if (props.hoverAnimation) {
      var rect = findDOMNode(this).getElementsByTagName('circle')[0].getBoundingClientRect();
      this.props.onMouseOver.call(this, rect.right, rect.top, props.dataPoint);
      this.setState({
        circleFill: shade(props.circleFill, props.shadeMultiplier),
        circleRadius: props.circleRadius * props.circleRadiusMultiplier
      });
    }
  },
  _restoreCircle: function _restoreCircle() {
    var props = this.props;
    if (props.hoverAnimation) {
      this.setState({
        circleFill: props.circleFill,
        circleRadius: props.circleRadius
      });
    }
  },
  _drawPath: function _drawPath(d) {
    if (typeof d === 'undefined') {
      return 'M Z';
    }

    return 'M' + d.join(',') + 'Z';
  },
  render: function render() {
    var props = this.props;
    var state = this.state;

    return React.createElement('g', {
      className: props.className
    }, React.createElement(VoronoiCircle, {
      circleFill: state.circleFill,
      circleRadius: state.circleRadius,
      cx: props.cx,
      cy: props.cy,
      handleMouseLeave: this._restoreCircle,
      handleMouseOver: this._animateCircle,
      voronoiPath: this._drawPath(props.vnode)
    }));
  }
});

},{"../utils":59,"./VoronoiCircle":51}],53:[function(require,module,exports){
'use strict';

exports.ScatterChart = require('./ScatterChart');

},{"./ScatterChart":50}],54:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

module.exports = createReactClass({

  displayName: 'Cell',

  propTypes: {
    fill: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    label: PropTypes.string
  },

  render: function render() {
    var props = this.props;

    var textStyle = {
      textAnchor: 'middle',
      fill: props.textColor,
      fontSize: props.fontSize
    };

    var t = 'translate(' + props.x + ', ' + props.y + '  )';

    return React.createElement('g', { transform: t }, React.createElement('rect', {
      className: 'rd3-treemap-cell',
      width: props.width,
      height: props.height,
      fill: props.fill,
      onMouseOver: props.handleMouseOver,
      onMouseLeave: props.handleMouseLeave
    }), React.createElement('text', {
      x: props.width / 2,
      y: props.height / 2,
      dy: '.35em',
      style: textStyle,
      className: 'rd3-treemap-cell-text'
    }, props.label));
  }
});

},{}],55:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var shade = require('../utils').shade;
var Cell = require('./Cell');

module.exports = createReactClass({

  displayName: 'CellContainer',

  propTypes: {
    fill: PropTypes.string
  },

  getInitialState: function getInitialState() {
    return {
      // fill is named as fill instead of initialFill to avoid
      // confusion when passing down props from top parent
      fill: this.props.fill
    };
  },
  _animateCell: function _animateCell() {
    this.setState({
      fill: shade(this.props.fill, 0.05)
    });
  },
  _restoreCell: function _restoreCell() {
    this.setState({
      fill: this.props.fill
    });
  },
  render: function render() {
    var props = this.props;

    return React.createElement(Cell, _extends({}, props, {
      fill: this.state.fill,
      handleMouseOver: props.hoverAnimation ? this._animateCell : null,
      handleMouseLeave: props.hoverAnimation ? this._restoreCell : null
    }));
  }
});

},{"../utils":59,"./Cell":54}],56:[function(require,module,exports){
'use strict';

var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var d3 = window.d3;
var CellContainer = require('./CellContainer');

module.exports = createReactClass({

  displayName: 'DataSeries',

  propTypes: {
    data: PropTypes.array,
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      }
    };
  },
  render: function render() {
    var props = this.props;

    var treemap = d3.layout.treemap()
    // make sure calculation loop through all objects inside array
    .children(function (d) {
      return d;
    }).size([props.width, props.height]).sticky(true).value(function (d) {
      return d.value;
    });

    var tree = treemap(props.data);

    var cells = tree.map(function (node, idx) {
      return React.createElement(CellContainer, {
        key: idx,
        x: node.x,
        y: node.y,
        width: node.dx,
        height: node.dy,
        fill: props.colors(props.colorAccessor(node, idx)),
        label: node.label,
        fontSize: props.fontSize,
        textColor: props.textColor,
        hoverAnimation: props.hoverAnimation
      });
    }, this);

    return React.createElement('g', { transform: props.transform, className: 'treemap' }, cells);
  }
});

},{"./CellContainer":55}],57:[function(require,module,exports){
'use strict';

var d3 = window.d3;
var PropTypes = window.PropTypes;
var React = window.React;
var createReactClass = window.createReactClass;

var Chart = require('../common').Chart;
var DataSeries = require('./DataSeries');

module.exports = createReactClass({

  displayName: 'Treemap',

  propTypes: {
    data: PropTypes.array,
    margins: PropTypes.object,
    width: PropTypes.number,
    height: PropTypes.number,
    title: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    colors: PropTypes.func,
    colorAccessor: PropTypes.func,
    hoverAnimation: PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    return {
      hoverAnimation: true,
      data: [],
      width: 400,
      heigth: 200,
      title: '',
      textColor: '#f7f7f7',
      fontSize: '0.85em',
      colors: d3.scale.category20c(),
      colorAccessor: function colorAccessor(d, idx) {
        return idx;
      }
    };
  },
  render: function render() {
    var props = this.props;
    if (this.props.data && this.props.data.length < 1) {
      return null;
    }

    return React.createElement(Chart, {
      title: props.title,
      width: props.width,
      height: props.height
    }, React.createElement('g', { className: 'rd3-treemap' }, React.createElement(DataSeries, {
      data: props.data,
      width: props.width,
      height: props.height,
      colors: props.colors,
      colorAccessor: props.colorAccessor,
      textColor: props.textColor,
      fontSize: props.fontSize,
      hoverAnimation: props.hoverAnimation
    })));
  }
});

},{"../common":31,"./DataSeries":56}],58:[function(require,module,exports){
'use strict';

exports.Treemap = require('./Treemap');

},{"./Treemap":57}],59:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var d3 = window.d3;

exports.calculateScales = function (width, height, xValues, yValues) {
  var xDomain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var yDomain = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

  var xScale = void 0;
  if (xValues.length > 0 && Object.prototype.toString.call(xValues[0]) === '[object Date]') {
    xScale = d3.time.scale().range([0, width]);
  } else {
    xScale = d3.scale.linear().range([0, width]);
  }
  var xdomain = d3.extent(xValues);
  if (xDomain[0] !== undefined && xDomain[0] !== null) xdomain[0] = xDomain[0];
  if (xDomain[1] !== undefined && xDomain[1] !== null) xdomain[1] = xDomain[1];
  xScale.domain(xdomain);

  var yScale = void 0;
  if (yValues.length > 0 && Object.prototype.toString.call(yValues[0]) === '[object Date]') {
    yScale = d3.time.scale().range([height, 0]);
  } else {
    yScale = d3.scale.linear().range([height, 0]);
  }

  var ydomain = d3.extent(yValues);
  if (yDomain[0] !== undefined && yDomain[0] !== null) ydomain[0] = yDomain[0];
  if (yDomain[1] !== undefined && yDomain[1] !== null) ydomain[1] = yDomain[1];
  yScale.domain(ydomain);

  return {
    xScale: xScale,
    yScale: yScale
  };
};

// debounce from Underscore.js
// MIT License: https://raw.githubusercontent.com/jashkenas/underscore/master/LICENSE
// Copyright (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative
// Reporters & Editors
exports.debounce = function (func, wait, immediate) {
  var timeout = void 0;
  return function debounce() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var context = this;
    var later = function later() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

exports.flattenData = function (data, xAccessor, yAccessor) {
  var allValues = [];
  var xValues = [];
  var yValues = [];
  var coincidentCoordinateCheck = {};

  data.forEach(function (series, i) {
    series.values.forEach(function (item, j) {
      var x = xAccessor(item);

      // Check for NaN since d3's Voronoi cannot handle NaN values
      // Go ahead and Proceed to next iteration since we don't want NaN
      // in allValues or in xValues or yValues
      if (isNaN(x)) {
        return;
      }
      xValues.push(x);

      var y = yAccessor(item);
      // when yAccessor returns an object (as in the case of candlestick)
      // iterate over the keys and push all the values to yValues array
      var yNode = void 0;
      if ((typeof y === 'undefined' ? 'undefined' : _typeof(y)) === 'object' && Object.keys(y).length > 0) {
        Object.keys(y).forEach(function (key) {
          // Check for NaN since d3's Voronoi cannot handle NaN values
          // Go ahead and Proceed to next iteration since we don't want NaN
          // in allValues or in xValues or yValues
          if (isNaN(y[key])) {
            return;
          }
          yValues.push(y[key]);
          // if multiple y points are to be plotted for a single x
          // as in the case of candlestick, default to y value of 0
          yNode = 0;
        });
      } else {
        // Check for NaN since d3's Voronoi cannot handle NaN values
        // Go ahead and Proceed to next iteration since we don't want NaN
        // in allValues or in xValues or yValues
        if (isNaN(y)) {
          return;
        }
        yValues.push(y);
        yNode = y;
      }

      var xyCoords = x + '-' + yNode;
      if (coincidentCoordinateCheck.hasOwnProperty(xyCoords)) {
        // Proceed to next iteration if the x y pair already exists
        // d3's Voronoi cannot handle NaN values or coincident coords
        // But we push them into xValues and yValues above because
        // we still may handle them there (labels, etc.)
        return;
      }
      coincidentCoordinateCheck[xyCoords] = '';

      var pointItem = {
        coord: {
          x: x,
          y: yNode
        },
        d: item,
        id: series.name + j,
        series: series,
        seriesIndex: i
      };
      allValues.push(pointItem);
    });
  });

  return { allValues: allValues, xValues: xValues, yValues: yValues };
};

exports.shade = function (hex, percent) {
  var red = void 0;
  var green = void 0;
  var blue = void 0;
  var min = Math.min;
  var round = Math.round;
  if (hex.length !== 7) {
    return hex;
  }
  var number = parseInt(hex.slice(1), 16);
  var R = number >> 16;
  var G = number >> 8 & 0xFF;
  var B = number & 0xFF;
  red = min(255, round((1 + percent) * R)).toString(16);
  if (red.length === 1) red = '0' + red;
  green = min(255, round((1 + percent) * G)).toString(16);
  if (green.length === 1) green = '0' + green;
  blue = min(255, round((1 + percent) * B)).toString(16);
  if (blue.length === 1) blue = '0' + blue;
  return '#' + red + green + blue;
};

},{}]},{},[32])(32)
});

//# sourceMappingURL=react-d3.js.map
