'use strict';

import * as Chart from 'chart.js';
import { LinearAxis } from '../elements';

Chart.defaults.pcp = Chart.helpers.configMerge(Chart.defaults.global, {
  scales: {
    xAxes: [
      {
        type: 'category',
        offset: true,
        gridLines: {
          display: false,
        },
      },
    ],
    yAxes: [],
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

  update(reset) {
    const meta = this.getMeta();
    // TODO

    const axis = meta.dataset;
    this.updateAxis(axis, reset);

    if (this.index === 0) {
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

    if (this.index === 0) {
      return;
    }
    elements.forEach((elem) => elem.draw());
  },

  updateAxis(axis) {
    axis._configure();
    const options = this._resolveDatasetElementOptions(axis);
    const datasetIndex = this.index;

    const xScale = this._getIndexScale();
    const x0 = xScale.getPixelForValue(undefined, datasetIndex);

    axis.id = this.getDataset().label;
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
    const custom = line.custom || {};
    const dataset = this.getDataset();
    const datasetIndex = this.index;
    const value = dataset.data[index];

    const options = this._resolveDataElementOptions(line, index);

    const xScale = this._getIndexScale();
    const yScale0 = this.chart.getDatasetMeta(datasetIndex - 1).dataset;
    const yScale1 = meta.dataset;

    const x0 = xScale.getPixelForValue(undefined, datasetIndex - 1) + yScale0.width;
    const x1 = xScale.getPixelForValue(undefined, datasetIndex) + yScale1.width;

    const y0 = reset
      ? yScale0.getBasePixel()
      : yScale0.getPixelForValue(this.chart.data.datasets[datasetIndex - 1].data[index], index, datasetIndex - 1);
    const y1 = reset ? yScale1.getBasePixel() : yScale1.getPixelForValue(value, index, datasetIndex);

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
}));
