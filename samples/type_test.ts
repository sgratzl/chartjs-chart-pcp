import { Chart } from 'chart.js';
import { ParallelCoordinatesController, LinearAxis, LineSegment, PCPScale } from '../build';

Chart.register(ParallelCoordinatesController, PCPScale, LineSegment);
Chart.registry.addElements(LinearAxis);

const ctx = document.querySelector('canvas').getContext('2d');

const objs = [
  { label: 'A', f1: 5, f2: 3, f4: 3 },
  { label: 'B', f1: 2, f2: 1, f4: 8 },
  { label: 'C', f1: 10, f2: 6, f4: 2 },
];
const attrs = ['f1', 'f2', 'f3'];

const chart = new Chart(ctx, {
  type: 'pcp',
  data: {
    labels: objs.map((obj) => obj.label),
    datasets: attrs.map((attr) => ({
      label: attr,
      data: objs.map((obj) => obj[attr]),
      axisWidth: 20,
    })),
  },
  options: {
    elements: {
      linearAxis: {
        axisWidth: 20,
      },
      lineSegment: {
        tension: 10,
      },
    },
  },
});
