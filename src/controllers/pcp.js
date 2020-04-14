'use strict';

import * as Chart from 'chart.js';
import { LinearAxis } from '../elements';

Chart.defaults.pcp = Chart.helpers.configMerge(Chart.defaults.global, {
  hover: {
    mode: 'single',
  },
  scales: {
    xAxes: [
      {
        type: 'pcp',
        offset: true,
        gridLines: {
          display: false,
        },
      },
    ],
    yAxes: [],
  },

  tooltips: {
    callbacks: {
      title() {
        return '';
      },
      label(tooltipItem, data) {
        const label = data.labels[tooltipItem.index];
        const ds = data.datasets
          .filter((d) => !d._meta || !d._meta.hidden)
          .map((d) => `${d.label}=${d.data[tooltipItem.index]}`);

        return `${label}(${ds.join(', ')})`;
      },
    },
  },
});

const superClass = Chart.DatasetController.prototype;
export const ParallelCoordinates = (Chart.controllers.pcp = Chart.DatasetController.extend({
  datasetElementType: LinearAxis,
  dataElementType: Chart.elements.LineSegment,
  _dataElementOptions: [
    'backgroundColor',
    'borderCapStyle',
    'borderColor',
    'borderDash',
    'borderDashOffset',
    'borderJoinStyle',
    'borderWidth',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'hoverBorderWidth',
    'tension',
  ],
  _datasetElementOptions: ['axisWidth'],

  linkScales() {
    const ds = this.getDataset();
    ds.yAxisID = ds.label;
    superClass.linkScales.call(this);
  },

  addElements() {
    superClass.addElements.call(this);
    const axis = this._getValueScale();
    Object.assign(axis.options, this.getDataset().axis);
  },

  _getValueScale() {
    return this.getMeta().dataset;
  },

  _getPreviousDataSetMeta(index = this.index) {
    for (let position = index - 1; position >= 0; position--) {
      const meta = this.chart.getDatasetMeta(position);
      if (!meta.hidden) {
        return meta;
      }
    }
    return null;
  },

  _getNextDataSetMeta(index = this.index) {
    for (let position = index + 1; position < this.chart.data.datasets.length; position++) {
      const meta = this.chart.getDatasetMeta(position);
      if (!meta.hidden) {
        return meta;
      }
    }
    return null;
  },

  _getVisibleDatasetIndex(index) {
    let visibleIndex = index;
    for (let position = index - 1; position >= 0; position--) {
      const meta = this.chart.getDatasetMeta(position);
      if (meta.hidden) {
        visibleIndex--;
      }
    }
    return visibleIndex;
  },

  update(reset) {
    // from front to back

    const meta = this.getMeta();
    const axis = meta.dataset;
    this.updateAxis(axis, reset);

    if (!this._getPreviousDataSetMeta()) {
      return;
    }
    const elements = meta.data || [];

    elements.forEach((elem, i) => {
      this.updateElement(elem, i, reset);
      elem.pivot();
    });
  },

  draw() {
    // from back to front

    const meta = this.getMeta();
    const elements = meta.data || [];

    if (meta.dataset) {
      meta.dataset.draw();
    }

    if (!this._getPreviousDataSetMeta()) {
      return;
    }
    elements.forEach((elem, i) => {
      elem.draw();
    });
  },

  updateAxis(axis) {
    axis._configure();
    const options = this._resolveDatasetElementOptions(axis);

    const xScale = this._getIndexScale();
    const x = xScale.getPixelForValue(undefined, this._getVisibleDatasetIndex(this.index));

    axis.id = this.getDataset().label;
    axis.options.position = this._getPreviousDataSetMeta() ? 'right' : 'left';
    axis._model = Object.assign(
      {
        x,
        top: this.chart.chartArea.top,
        bottom: this.chart.chartArea.bottom,
      },
      options
    );
    axis.update();
    axis.pivot();
  },

  updateElement(line, index, reset) {
    const prev = this._getPreviousDataSetMeta();
    const prevprev = this._getPreviousDataSetMeta(prev.index);
    const current = this.getMeta();
    const next = this._getNextDataSetMeta();

    const options = this._resolveDataElementOptions(line, index);

    const xScale = this._getIndexScale();

    const getPoint = (meta, defaultValue) => {
      if (!meta) {
        return defaultValue;
      }
      const x = xScale.getPixelForValue(undefined, this._getVisibleDatasetIndex(meta.index));
      const yScale = meta.dataset;
      const y = reset
        ? yScale.getBasePixel()
        : yScale.getPixelForValue(this.chart.data.datasets[meta.index].data[index], index, meta.index);

      return { x, y };
    };

    const xy = getPoint(current);
    const xy_prev = getPoint(prev, xy);

    const model = {
      x: xy_prev.x,
      y: xy_prev.y,
      x1: xy.x,
      y1: xy.y,
    };

    if (options.tension) {
      const xy_prevprev = getPoint(prevprev, xy_prev);
      const xy_next = getPoint(next, xy);

      const controlPoints = Chart.helpers.splineCurve(xy_prevprev, xy_prev, xy, options.tension);
      const controlPoints1 = Chart.helpers.splineCurve(xy_prev, xy, xy_next, options.tension);

      model.xCPn = controlPoints.next.x;
      model.yCPn = controlPoints.next.y;
      model.xCPp1 = controlPoints1.previous.x;
      model.yCPp1 = controlPoints1.previous.y;
    }

    // Desired view properties
    line._model = Object.assign(model, options);
  },

  _findOtherSegments(element) {
    const index = element._index;
    const r = [];
    const metas = this.chart._getSortedVisibleDatasetMetas();
    metas.forEach((meta) => {
      if (meta.controller._type !== this._type || meta.controller === this) {
        return;
      }
      const elem = meta.data[index];
      if (!elem._model) {
        return;
      }
      r.push(elem);
    });
    return r;
  },

  removeHoverStyle(element) {
    superClass.removeHoverStyle.call(this, element);

    this._findOtherSegments(element).forEach((elem) => {
      superClass.removeHoverStyle.call(this, elem);
    });
  },

  _setHoverStyleImpl(element) {
    const dataset = this.chart.data.datasets[element._datasetIndex];
    const index = element._index;
    const custom = element.custom || {};
    const model = element._model;
    const getHoverColor = Chart.helpers.getHoverColor;

    element.$previousStyle = {
      backgroundColor: model.backgroundColor,
      borderColor: model.borderColor,
      borderWidth: model.borderWidth,
    };

    model.backgroundColor = Chart.helpers.options.resolve(
      [
        custom.hoverBackgroundColor,
        dataset.hoverBackgroundColor,
        model.hoverBackgroundColor,
        getHoverColor(model.backgroundColor),
      ],
      undefined,
      index
    );
    model.borderColor = Chart.helpers.options.resolve(
      [custom.hoverBorderColor, dataset.hoverBorderColor, model.hoverBorderColor, getHoverColor(model.borderColor)],
      undefined,
      index
    );
    model.borderWidth = Chart.helpers.options.resolve(
      [custom.hoverBorderWidth, dataset.hoverBorderWidth, model.hoverBorderWidth, model.borderWidth],
      undefined,
      index
    );
  },

  setHoverStyle(element) {
    this._setHoverStyleImpl(element);

    this._findOtherSegments(element).forEach((elem) => {
      this._setHoverStyleImpl(elem);
    });
  },
}));
