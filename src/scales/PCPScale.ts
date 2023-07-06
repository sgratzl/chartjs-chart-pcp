import { CategoryScale, CategoryScaleOptions } from 'chart.js';

export class PCPScale extends CategoryScale {
  getLabels(): string[] {
    const { datasets } = this.chart.data;
    return this.getMatchingVisibleMetas().map((meta) => {
      const ds = datasets[meta.index];
      return ds.label ?? '';
    });
  }

  /**
   * @internal
   */
  static readonly id = 'pcp';

  /**
   * @internal
   */
  static readonly defaults = CategoryScale.defaults;
}

declare module 'chart.js' {
  export interface ScaleTypeRegistry {
    pcp: {
      options: CategoryScaleOptions;
    };
  }
}
