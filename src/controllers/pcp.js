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

  _getPreviousDataSetMeta() {
    for (let position = this.index - 1; position >= 0; position--) {
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
    const meta = this.getMeta();
    const elements = meta.data || [];

    if (meta.dataset) {
      meta.dataset.draw();
    }

    if (!this._getPreviousDataSetMeta()) {
      return;
    }
    elements.forEach((elem) => elem.draw());
  },

  updateAxis(axis) {
    axis._configure();
    const options = this._resolveDatasetElementOptions(axis);

    const xScale = this._getIndexScale();
    const x0 = xScale.getPixelForValue(undefined, this._getVisibleDatasetIndex(this.index));

    axis.id = this.getDataset().label;
    axis.options.position = this._getPreviousDataSetMeta() ? 'right' : 'left';
    axis._model = Object.assign(
      {
        x0,
        top: this.chart.chartArea.top,
        bottom: this.chart.chartArea.bottom,
      },
      options
    );
    axis.update();
    axis.pivot();
  },

  updateElement(line, index, reset) {
    const meta = this.getMeta();
    const prev = this._getPreviousDataSetMeta();
    const dataset = this.getDataset();
    const value = dataset.data[index];

    const options = this._resolveDataElementOptions(line, index);

    const xScale = this._getIndexScale();
    const yScale0 = prev.dataset;
    const yScale1 = meta.dataset;

    const x0 = xScale.getPixelForValue(undefined, this._getVisibleDatasetIndex(prev.index));
    const x1 = xScale.getPixelForValue(undefined, this._getVisibleDatasetIndex(meta.index));

    const y0 = reset
      ? yScale0.getBasePixel()
      : yScale0.getPixelForValue(this.chart.data.datasets[prev.index].data[index], index, prev.index);
    const y1 = reset ? yScale1.getBasePixel() : yScale1.getPixelForValue(value, index, meta.index);

    // Desired view properties
    line._model = Object.assign(
      {
        x0,
        x1,
        y0,
        y1,
      },
      options
    );
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
