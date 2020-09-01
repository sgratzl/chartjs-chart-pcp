import { CategoryScale } from '@sgratzl/chartjs-esm-facade';

export class PCPScale extends CategoryScale {
  getLabels() {
    const datasets = this.chart.data.datasets;
    return this.getMatchingVisibleMetas().map((meta) => {
      const ds = datasets[meta.index];
      return ds.label!;
    });
  }

  static readonly id = 'pcp';
  static readonly defaults = CategoryScale.defaults;
}
