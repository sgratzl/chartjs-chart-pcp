'use strict';

import * as Chart from 'chart.js';
import { LinearAxis } from '../elements';

Chart.defaults.pcp = Chart.helpers.configMerge(Chart.defaults.global, {
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
}));
