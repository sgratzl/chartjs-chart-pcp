import Theme from 'vitepress/theme';
import { createTypedChart } from 'vue-chartjs';
import { CategoryScale, Tooltip } from 'chart.js';
import {
  LineSegment,
  ParallelCoordinatesController,
  PCPScale,
  LinearAxis,
  LogarithmicAxis,
  LogarithmicParallelCoordinatesController,
} from '../../../src';

export default {
  ...Theme,
  enhanceApp({ app }) {
    app.component(
      'PCPtChart',
      createTypedChart('pcp', [
        CategoryScale,
        Tooltip,
        LineSegment,
        LinearAxis,
        LogarithmicAxis,
        PCPScale,
        ParallelCoordinatesController,
        LogarithmicParallelCoordinatesController,
      ])
    );
  },
};
