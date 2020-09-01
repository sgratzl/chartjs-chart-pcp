import { Chart } from '@sgratzl/chartjs-esm-facade';
import { LineSegment, LogarithmicAxis } from '../elements';
import { ParallelCoordinatesController } from './ParallelCoordinatesController';
import patchController from './patchController';
import { PCPScale } from '../scales';

export class LogarithmicParallelCoordinatesController extends ParallelCoordinatesController {}

LogarithmicParallelCoordinatesController.id = 'logarithmicPcp';
LogarithmicParallelCoordinatesController.defaults = {
  datasetElementType: LogarithmicAxis.id,
};
export class LogarithmicParallelChart extends Chart {
  constructor(item, config) {
    super(
      item,
      patchController(config, LogarithmicParallelCoordinatesController, [LogarithmicAxis, LineSegment], PCPScale)
    );
  }
}
LogarithmicParallelChart.id = LogarithmicParallelCoordinatesController.id;
