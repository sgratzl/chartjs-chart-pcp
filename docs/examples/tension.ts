import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';
import { data } from './basic';

// #region config
export const config: ChartConfiguration<'pcp'> = {
  type: 'pcp',
  data,
  options: {
    elements: {
      lineSegment: {
        tension: 0.3,
      },
    },
  },
};
// #endregion config
