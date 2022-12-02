import {
  Chart,
  ControllerDatasetOptions,
  ScriptableAndArrayOptions,
  CommonHoverOptions,
  ChartItem,
  ChartConfiguration,
  ScriptableContext,
  CartesianScaleTypeRegistry,
} from 'chart.js';
import { LineSegment, LogarithmicAxis, ILineSegmentOptions, ILogarithmicAxisOptions } from '../elements';
import { ParallelCoordinatesController } from './ParallelCoordinatesController';
import patchController from './patchController';
import { PCPScale } from '../scales';

export class LogarithmicParallelCoordinatesController extends ParallelCoordinatesController {
  static readonly id = 'logarithmicPcp';

  static readonly defaults: any = /* #__PURE__ */ {
    ...ParallelCoordinatesController.defaults,
    datasetElementType: LogarithmicAxis.id,
  };

  static readonly overrides: any = /* #__PURE__ */ ParallelCoordinatesController.overrides;
}

export interface ILogarithmicParallelCoordinatesControllerDatasetOptions
  extends ControllerDatasetOptions,
    ILogarithmicAxisOptions,
    ScriptableAndArrayOptions<ILineSegmentOptions, ScriptableContext<'logarithmicPcp'>>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext<'logarithmicPcp'>> {
  stack: string;
}

export type ILogarithmicParallelCoordinatesChartOptions = ILogarithmicAxisOptions;

declare module 'chart.js' {
  interface ChartTypeRegistry {
    logarithmicPcp: {
      chartOptions: ILogarithmicParallelCoordinatesChartOptions;
      datasetOptions: ILogarithmicParallelCoordinatesControllerDatasetOptions;
      defaultDataPoint: number;
      metaExtensions: Record<string, never>;
      parsedDataType: { y: number };
      scales: keyof CartesianScaleTypeRegistry;
    };
  }
}

export class LogarithmicParallelCoordinatesChart<DATA extends unknown[] = number[], LABEL = string> extends Chart<
  'logarithmicPcp',
  DATA,
  LABEL
> {
  static id = LogarithmicParallelCoordinatesController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'logarithmicPcp', DATA, LABEL>, 'type'>) {
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
