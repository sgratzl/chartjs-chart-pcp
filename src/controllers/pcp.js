import { helpers, defaults, DatasetController, controllers } from 'chart.js';
import { LinearAxis, LineSegment } from '../elements';
import { PCPScale } from '../scales';

export class ParallelCoordinates extends DatasetController {
  linkScales() {
    const ds = this.getDataset();
    ds.yAxisID = ds.label;
    super.linkScales();
  }

  addElements() {
    super.addElements(this);
    const meta = this._cachedMeta;
    const scale = meta.dataset;
    meta.yScale = meta.vScale = scale;

    scale.id = meta.yAxisID;
    scale.axis = 'y';
    scale.type = this.dataElementType.id;
    scale.options = {}; // helpers.merge({}, [this.chart.options.elements[this.datasetElementType]]);
    scale.chart = this.chart;
    scale.ctx = this.chart.ctx;
  }

  _getValueScale() {
    return this._cachedMeta.dataset;
  }

  update(mode) {
    // from front to back

    const meta = this._cachedMeta;
    meta._metas = this.chart.getSortedVisibleDatasetMetas();
    meta._metaIndex = meta._metas.indexOf(meta);
    if (meta._metaIndex < 0) {
      return;
    }

    const axis = meta.dataset;
    this.updateAxis(axis, mode);

    const elements = meta.data || [];
    this.updateElements(elements, 0, mode);
  }

  draw() {
    // from back to front
    const meta = this._cachedMeta;
    const elements = meta.data || [];
    const ctx = this.chart.ctx;
    if (meta._metaIndex < 0) {
      return;
    }

    if (meta.dataset) {
      meta.dataset.draw(ctx);
    }
    if (meta._metaIndex === 0) {
      return;
    }
    elements.forEach((elem) => {
      elem.draw(ctx);
    });
  }

  updateAxis(axis, mode) {
    const meta = this._cachedMeta;
    const xScale = this._getIndexScale();
    const x = xScale.getPixelForTick(meta._metaIndex);

    const properties = {
      x,
      top: this.chart.chartArea.top,
      bottom: this.chart.chartArea.bottom,
      options: helpers.merge({}, [
        this.chart.options.elements[this.datasetElementType._type],
        this.resolveDatasetElementOptions(),
        {
          position: meta._metaIndex > 0 ? 'right' : 'left',
        },
      ]),
    };
    super.updateElement(axis, undefined, properties, mode);
    axis.update();
  }

  updateElements(rectangles, start, mode) {
    const reset = mode === 'reset';
    const meta = this._cachedMeta;
    const xScale = meta.xScale;

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, rectangles[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const getPoint = (metaIndex, index, defaultValue) => {
      const m = meta._metas[metaIndex];
      if (!m) {
        return defaultValue;
      }
      const x = xScale.getPixelForTick(metaIndex);
      const yScale = m.vScale;
      const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(m._parsed[index][yScale.axis]);

      return {
        x,
        y: Number.isNaN(y) ? defaultValue.y : y,
      };
    };

    for (let i = 0; i < rectangles.length; i++) {
      const index = start + i;
      const options = this.resolveDataElementOptions(index, mode);

      const xy = getPoint(meta._metaIndex, index);
      const xy_prev = getPoint(meta._metaIndex - 1, index, xy);

      const properties = {
        x: xy_prev.x,
        y: xy_prev.y,
        x1: xy.x,
        y1: xy.y,
      };

      if (options.tension) {
        const xy_prevprev = getPoint(meta._metaIndex - 2, index, xy_prev);
        const xy_next = getPoint(meta._metaIndex + 1, index, xy);

        const controlPoints = helpers.curve.splineCurve(xy_prevprev, xy_prev, xy, options.tension);
        const controlPoints1 = helpers.curve.splineCurve(xy_prev, xy, xy_next, options.tension);

        properties.xCPn = controlPoints.next.x;
        properties.yCPn = controlPoints.next.y;
        properties.xCPp1 = controlPoints1.previous.x;
        properties.yCPp1 = controlPoints1.previous.y;
      }

      if (includeOptions) {
        properties.options = options;
      }
      this.updateElement(rectangles[i], index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);
  }

  _findOtherControllers() {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    return metas.filter((meta) => meta.controller._type === this._type && meta.controller !== this);
  }

  removeHoverStyle(element, datasetIndex, index, rec) {
    super.removeHoverStyle(element, datasetIndex, index);
    if (rec) {
      return;
    }
    this._findOtherControllers().forEach((meta) => {
      meta.controller.removeHoverStyle(meta.data[index], meta.index, index, true);
    });
  }
  setHoverStyle(element, datasetIndex, index, rec) {
    super.setHoverStyle(element, datasetIndex, index);
    if (rec) {
      return;
    }
    this._findOtherControllers().forEach((meta) => {
      meta.controller.setHoverStyle(meta.data[index], meta.index, index, true);
    });
  }
}

ParallelCoordinates.id = 'pcp';
ParallelCoordinates.register = () => {
  ParallelCoordinates.prototype.datasetElementType = LinearAxis.register();
  ParallelCoordinates.prototype.datasetElementOptions = ['axisWidth'];
  ParallelCoordinates.prototype.dataElementType = LineSegment.register();
  ParallelCoordinates.prototype.dataElementOptions = controllers.line.prototype.datasetElementOptions.concat([
    'tension',
    'hoverBackgroundColor',
    'hoverBorderColor',
    'hoverBorderWidth',
  ]);

  controllers[ParallelCoordinates.id] = ParallelCoordinates;

  defaults.set(ParallelCoordinates.id, {
    datasets: {
      animation: {
        numbers: {
          type: 'number',
          properties: ['x', 'y', 'x1', 'y1', 'axisWidth', 'xCPn', 'yCPn', 'xCPp1', 'yCPp1', 'borderWidth'],
        },
      },
    },
    scales: {
      x: {
        type: PCPScale.register().id,
        offset: true,
        gridLines: {
          drawBorder: false,
          display: false,
        },
      },
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
};
