import matchChart from '../__tests__/matchChart';
import { ParallelCoordinatesController } from './ParallelCoordinatesController';
import { LogarithmicParallelCoordinatesController } from './LogarithmicParallelCoordinatesController';
import mtcars from './__tests__/mtcars';
import { registry } from '@sgratzl/chartjs-esm-facade';
import { LineSegment, LinearAxis, LogarithmicAxis } from '../elements';
import { PCPScale } from '../scales';

describe('pcp', () => {
  beforeAll(() => {
    registry.addControllers(ParallelCoordinatesController, LogarithmicParallelCoordinatesController);
    registry.addElements(LineSegment, LinearAxis, LogarithmicAxis);
    registry.addScales(PCPScale);
  });
  test('default', () => {
    const attrs = ['mpg', 'hp', 'wt', 'qsec', 'gear', 'drat', 'disp', 'cyl'];
    return matchChart(
      {
        type: 'pcp',
        data: {
          labels: mtcars.map((c) => c.model),
          datasets: attrs.map((attr) => ({
            label: attr,
            data: mtcars.map((c) => c[attr]),
          })),
        },
        options: {
          scales: {
            x: {
              display: false,
            },
          },
          elements: {
            linearAxis: {
              display: false,
            },
            logarithmicAxis: {
              display: false,
            },
          },
          legend: {
            display: false,
          },
        },
      },
      1000,
      500
    );
  });
  test('log', () => {
    const attrs = ['mpg', 'hp', 'wt', 'qsec', 'gear', 'drat', 'disp', 'cyl'];
    return matchChart(
      {
        type: 'pcp',
        data: {
          labels: mtcars.map((c) => c.model),
          datasets: attrs.map((attr, i) => ({
            type: i === 1 ? 'logarithmicPcp' : undefined,
            label: attr,
            data: mtcars.map((c) => c[attr]),
          })),
        },
        options: {
          scales: {
            x: {
              display: false,
            },
          },
          elements: {
            linearAxis: {
              display: false,
            },
            logarithmicAxis: {
              display: false,
            },
          },
          legend: {
            display: false,
          },
        },
      },
      1000,
      500
    );
  });
  test('tension', () => {
    const attrs = ['mpg', 'hp', 'wt', 'qsec', 'gear', 'drat', 'disp', 'cyl'];
    return matchChart(
      {
        type: 'pcp',
        data: {
          labels: mtcars.map((c) => c.model),
          datasets: attrs.map((attr) => ({
            label: attr,
            data: mtcars.map((c) => c[attr]),
          })),
        },
        options: {
          scales: {
            x: {
              display: false,
            },
          },
          elements: {
            linearAxis: {
              tension: 0.3,
              display: false,
            },
            logarithmicAxis: {
              display: false,
            },
          },
          legend: {
            display: false,
          },
        },
      },
      1000,
      500
    );
  });
});
