import {
  Chart,
  IControllerDatasetOptions,
  ScriptableAndArrayOptions,
  ICommonHoverOptions,
  IChartDataset,
  ChartItem,
  IChartConfiguration,
} from 'chart.js';
import { LineSegment, LogarithmicAxis, ILineSegmentOptions, ILogarithmicAxisOptions } from '../elements';
import { ParallelCoordinatesController } from './ParallelCoordinatesController';
import patchController from './patchController';
import { PCPScale } from '../scales';

export class LogarithmicParallelCoordinatesController extends ParallelCoordinatesController {
  static readonly id = 'logarithmicPcp';
  static readonly defaults: any = /*#__PURE__*/ {
    datasetElementType: LogarithmicAxis.id,
  };
}

export interface ILogarithmicParallelCoordinatesControllerDatasetOptions
  extends IControllerDatasetOptions,
    ILogarithmicAxisOptions,
    ScriptableAndArrayOptions<ILineSegmentOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {}

export type ILogarithmicParallelCoordinatesControllerDataset<T = number> = IChartDataset<
  T,
  ILogarithmicParallelCoordinatesControllerDatasetOptions
>;

export type ILogarithmicParallelCoordinatesChartOptions = ILogarithmicAxisOptions;

export type ILogarithmicParallelCoordinatesControllerConfiguration<T = number, L = string> = IChartConfiguration<
  'logarithmicPcp',
  T,
  L,
  ILogarithmicParallelCoordinatesControllerDataset<T>,
  ILogarithmicParallelCoordinatesChartOptions
>;

export class LogarithmicParallelCoordinatesChart<T = number, L = string> extends Chart<
  T,
  L,
  ILogarithmicParallelCoordinatesControllerConfiguration<T, L>
> {
  static id = LogarithmicParallelCoordinatesController.id;

  constructor(item: ChartItem, config: Omit<ILogarithmicParallelCoordinatesControllerConfiguration<T, L>, 'type'>) {
    super(
      item,
      patchController(
        'logarithmicPcp',
        config,
        LogarithmicParallelCoordinatesController,
        [LogarithmicAxis, LineSegment],
        PCPScale
      )
    );
  }
}
