import {
  Chart,
  IControllerDatasetOptions,
  ScriptableAndArrayOptions,
  ICommonHoverOptions,
  ChartItem,
  IChartConfiguration,
  ICartesianScaleTypeRegistry,
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

export type ILogarithmicParallelCoordinatesChartOptions = ILogarithmicAxisOptions;

declare module 'chart.js' {
  enum ChartTypeEnum {
    logarithmicPcp = 'logarithmicPcp',
  }
  interface IChartTypeRegistry {
    logarithmicPcp: {
      chartOptions: ILogarithmicParallelCoordinatesChartOptions;
      datasetOptions: ILogarithmicParallelCoordinatesControllerDatasetOptions;
      defaultDataPoint: number[];
      scales: keyof ICartesianScaleTypeRegistry;
    };
  }
}

export class LogarithmicParallelCoordinatesChart<DATA extends unknown[] = number[], LABEL = string> extends Chart<
  'logarithmicPcp',
  DATA,
  LABEL
> {
  static id = LogarithmicParallelCoordinatesController.id;

  constructor(item: ChartItem, config: Omit<IChartConfiguration<'logarithmicPcp', DATA, LABEL>, 'type'>) {
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
