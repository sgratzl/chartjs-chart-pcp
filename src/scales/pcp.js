import { merge, CategoryScale, scaleService } from '../chart';

export class PCPScale extends CategoryScale {
  getLabels() {
    const datasets = this.chart.data.datasets;
    return this.getMatchingVisibleMetas().map((meta) => {
      const ds = datasets[meta.index];
      return ds.label;
    });
  }
}

PCPScale.id = 'pcp';
PCPScale.defaults = merge({}, [CategoryScale.defaults, {}]);
PCPScale.register = () => {
  scaleService.registerScale(PCPScale);
  return PCPScale;
};
