import type { ChartConfiguration } from 'chart.js';
import type {} from '../../src';
import { Chart } from 'chart.js';
import { LinearAxis, LogarithmicAxis } from '../../src';

// #region data
import mtcars from './data/index.json';

const attrs = ['mpg', 'hp', 'wt', 'qsec', 'gear', 'drat', 'disp', 'cyl', 'am'];

export const data: ChartConfiguration<'pcp'>['data'] = {
  labels: mtcars.map((c) => c.model),
  datasets: attrs.map((attr, i) => ({
    type: i === 1 ? 'logarithmicPcp' : undefined,
    label: attr,
    data: mtcars.map((c) => c[attr]),
  })),
};

// #endregion

Chart.registry.addElements(LinearAxis, LogarithmicAxis);

// #region config
export const config: ChartConfiguration<'pcp'> = {
  type: 'pcp',
  data,
};
// #endregion config
