import * as Chart from 'chart.js';

const defaults = {};

const superClassC = Chart.scaleService.getScaleConstructor('category');
// const superClass = superClassC.prototype;

export const PCPScale = superClassC.extend({
  _getLabels() {
    const datasets = this.chart.data.datasets;
    return this._getMatchingVisibleMetas().map((meta) => {
      const ds = datasets[meta.index];
      return ds.label;
    });
  },
});

Chart.scaleService.registerScaleType(
  'pcp',
  PCPScale,
  Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('category'), defaults])
);
