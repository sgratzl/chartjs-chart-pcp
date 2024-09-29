import { CategoryScale, CategoryScaleOptions } from 'chart.js';

export class PCPScale extends CategoryScale {
  getLabels(): string[] {
    const { datasets } = this.chart.data;
    return this.getMatchingVisibleMetas().map((meta) => {
      const ds = datasets[meta.index];
      return ds.label ?? '';
    });
  }

  static readonly id = 'pcp';

  /**
   * @hidden
   */
  static readonly defaults: any = CategoryScale.defaults;
}

declare module 'chart.js' {
  export interface ScaleTypeRegistry {
    pcp: {
      options: CategoryScaleOptions;
    };
  }
}
