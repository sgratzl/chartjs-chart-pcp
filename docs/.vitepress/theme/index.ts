import Theme from 'vitepress/theme';
import { createTypedChart } from 'vue-chartjs';
import { CategoryScale, Tooltip, LinearScale, LogarithmicScale, Legend } from 'chart.js';
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
      'PCPChart',
      createTypedChart('pcp', [
        CategoryScale,
        Tooltip,
        Legend,
        LinearScale,
        LogarithmicScale,
        LineSegment,
        PCPScale,
        ParallelCoordinatesController,
        LogarithmicParallelCoordinatesController,
      ])
    );
  },
};
