import { scaleService, helpers } from 'chart.js';

export class PCPScale extends scaleService.getScaleConstructor('category') {
  getLabels() {
    const datasets = this.chart.data.datasets;
    return this.getMatchingVisibleMetas().map((meta) => {
      const ds = datasets[meta.index];
      return ds.label;
    });
  }
}

PCPScale.id = 'pcp';
PCPScale.defaults = helpers.merge({}, [scaleService.getScaleDefaults('category'), {}]);
PCPScale.register = () => {
  scaleService.registerScale(PCPScale);
  return PCPScale;
};
