import { Chart, registry } from '@sgratzl/chartjs-esm-facade';
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
      patchController(config, LogarithmicParallelCoordinatesController, () => {
        registry.scales.register(PCPScale);
        registry.elements.register(LogarithmicAxis);
        registry.elements.register(LineSegment);
      })
    );
  }
}
LogarithmicParallelChart.id = LogarithmicParallelCoordinatesController.id;
