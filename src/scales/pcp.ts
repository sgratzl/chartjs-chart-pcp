import { CategoryScale } from 'chart.js';

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

declare module 'chart.js' {
  export enum ScaleTypeEnum {
    pcp = 'pcp',
  }

  export interface IScaleTypeRegistry {
    pcp: IScaleTypeRegistry['category'];
  }
}
