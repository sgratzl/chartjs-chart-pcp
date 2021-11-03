import {
  Chart,
  DatasetController,
  ChartItem,
  ControllerDatasetOptions,
  ScriptableAndArrayOptions,
  CommonHoverOptions,
  TooltipItem,
  UpdateMode,
  ChartComponent,
  ChartMeta,
  ChartConfiguration,
  ScriptableContext,
  Element,
} from 'chart.js';
import { splineCurve } from 'chart.js/helpers';

import { LinearAxis, LineSegment, ILinearAxisOptions, ILineSegmentOptions, ILineSegmentProps } from '../elements';
import { PCPScale } from '../scales';
import patchController from './patchController';

interface IExtendedChartMeta {
  _metas: ChartMeta<any, any>[];
  _metaIndex: number;
}

export type AnyObject = Record<string, unknown>;

export class ParallelCoordinatesController extends DatasetController<
  'pcp',
  LineSegment & Element<AnyObject, AnyObject>,
  LinearAxis & Element<AnyObject, AnyObject>
> {
  declare datasetElementType: ChartComponent;

  declare dataElementType: ChartComponent;

  private declare _type: string;

  initialize(): void {
    super.initialize();
    this.enableOptionSharing = true;
  }

  linkScales(): void {
    const ds = this.getDataset() as any;
    ds.yAxisID = ds.label;
    super.linkScales();
    this._cachedMeta.vScale = this._cachedMeta.dataset as any;
    this._cachedMeta.vScale = this._cachedMeta.dataset as any;
  }

  private resolveAxisOptions(mode: UpdateMode) {
    return this.resolveDatasetElementOptions(mode) as unknown as ILinearAxisOptions;
  }

  addElements(): void {
    super.addElements();
    const meta = this._cachedMeta;
    const scale = meta.dataset as LinearAxis;
    meta.yScale = scale;
    meta.vScale = scale;

    Object.assign(scale, {
      id: meta.yAxisID,
      type: this.datasetElementType.id,
      chart: this.chart,
      ctx: this.chart.ctx,
    });
    const options = this.resolveAxisOptions('reset');
    // workaround for now
    Object.assign(options, { setContext: () => 0 });
    scale.init(options);
  }

  update(mode: UpdateMode): void {
    // from front to back

    const meta = this._cachedMeta as unknown as IExtendedChartMeta;
    meta._metas = this.chart.getSortedVisibleDatasetMetas();
    meta._metaIndex = meta._metas.indexOf(this._cachedMeta);
    if (meta._metaIndex < 0) {
      return;
    }

    const axis = this._cachedMeta.dataset;
    if (axis) {
      this.updateAxis(axis, mode);
    }

    const elements = this._cachedMeta.data || [];
    this.updateElements(elements, 0, elements.length, mode);
  }

  draw(): void {
    // from back to front
    const meta = this._cachedMeta;
    const metaE = meta as unknown as IExtendedChartMeta;
    const elements = meta.data || [];
    const { ctx } = this.chart;
    if (metaE._metaIndex < 0) {
      return;
    }

    if (meta.dataset) {
      meta.dataset.draw(ctx);
    }
    if (meta._metaIndex === 0) {
      return;
    }
    elements.forEach((elem) => {
      elem.draw(ctx);
    });
  }

  updateAxis(axis: LinearAxis & Element<AnyObject, AnyObject>, mode: UpdateMode): void {
    const meta = this._cachedMeta;
    const metaE = meta as unknown as IExtendedChartMeta;
    const x = meta.xScale?.getPixelForTick(metaE._metaIndex) ?? 0;

    const baseOptions = this.resolveDatasetElementOptions(mode) as unknown as ILinearAxisOptions;
    const properties = {
      x,
      top: this.chart.chartArea.top,
      bottom: this.chart.chartArea.bottom,
      options: {
        ...baseOptions,
        position: metaE._metaIndex > 0 ? 'right' : 'left',
      },
    };
    super.updateElement(axis, undefined, properties, mode);
    axis.update();
  }

  updateElements(
    rectangles: (LineSegment & Element<AnyObject, AnyObject>)[],
    start: number,
    count: number,
    mode: UpdateMode
  ): void {
    const reset = mode === 'reset';
    const meta = this._cachedMeta as unknown as IExtendedChartMeta;

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts) ?? {};
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const getPoint = (metaIndex: number, index: number, defaultValue: { x: number; y: number }) => {
      const m = meta._metas[metaIndex];
      if (!m) {
        return defaultValue;
      }
      const x = this._cachedMeta.xScale?.getPixelForTick(metaIndex) ?? 0;
      const yScale = m.vScale;
      const y = reset
        ? yScale?.getBasePixel()
        : yScale?.getPixelForValue((m._parsed[index] as Record<string, number>)[yScale?.axis ?? 'y'], index);

      return {
        x,
        y: y == null || Number.isNaN(y) ? defaultValue.y : y,
      };
    };

    this.updateSharedOptions(sharedOptions, mode, firstOpts);

    for (let i = start; i < start + count; i += 1) {
      const options = this.resolveDataElementOptions(i, mode);

      const xy = getPoint(meta._metaIndex, i, { x: 0, y: 0 });
      const xyPrevious = getPoint(meta._metaIndex - 1, i, xy);

      const properties: Partial<ILineSegmentProps> & { options?: ILineSegmentOptions } = {
        x: xyPrevious.x,
        y: xyPrevious.y,
        x1: xy.x,
        y1: xy.y,
      };

      if (options.tension) {
        const xyPrevPrevious = getPoint(meta._metaIndex - 2, i, xyPrevious);
        const xyNext = getPoint(meta._metaIndex + 1, i, xy);

        const controlPoints = splineCurve(xyPrevPrevious, xyPrevious, xy, options.tension as number);
        const controlPoints1 = splineCurve(xyPrevious, xy, xyNext, options.tension as number);

        properties.xCPn = controlPoints.next.x;
        properties.yCPn = controlPoints.next.y;
        properties.xCPp1 = controlPoints1.previous.x;
        properties.yCPp1 = controlPoints1.previous.y;
      }

      if (includeOptions) {
        properties.options = (sharedOptions || options) as any;
      }
      this.updateElement(rectangles[i], i, properties, mode);
    }
  }

  private _findOtherControllers() {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    return metas.filter(
      (meta) => (meta.controller as any) !== this && meta.controller instanceof ParallelCoordinatesController
    );
  }

  removeBaseHoverStyle(
    element: LineSegment & Element<AnyObject, AnyObject>,
    datasetIndex: number,
    index: number
  ): void {
    super.removeHoverStyle(element, datasetIndex, index);
  }

  removeHoverStyle(element: LineSegment & Element<AnyObject, AnyObject>, datasetIndex: number, index: number): void {
    super.removeHoverStyle(element, datasetIndex, index);
    this._findOtherControllers().forEach((meta) => {
      (meta.controller as unknown as ParallelCoordinatesController).removeBaseHoverStyle(
        meta.data[index] as any,
        meta.index,
        index
      );
    });
  }

  setBaseHoverStyle(element: LineSegment & Element<AnyObject, AnyObject>, datasetIndex: number, index: number): void {
    super.setHoverStyle(element, datasetIndex, index);
  }

  setHoverStyle(element: LineSegment & Element<AnyObject, AnyObject>, datasetIndex: number, index: number): void {
    super.setHoverStyle(element, datasetIndex, index);
    this._findOtherControllers().forEach((meta) => {
      (meta.controller as unknown as ParallelCoordinatesController).setBaseHoverStyle(
        meta.data[index] as any,
        meta.index,
        index
      );
    });
  }

  static readonly id: string = 'pcp';

  static readonly defaults: any = /* #__PURE__ */ {
    datasetElementType: LinearAxis.id,
    dataElementType: LineSegment.id,
    animations: {
      numbers: {
        type: 'number',
        properties: ['x', 'y', 'x1', 'y1', 'axisWidth', 'xCPn', 'yCPn', 'xCPp1', 'yCPp1', 'borderWidth'],
      },
    },
  };

  static readonly overrides: any = /* #__PURE__ */ {
    scales: {
      x: {
        type: PCPScale.id,
        offset: true,
        grid: {
          drawBorder: false,
          display: false,
        },
      },
    },

    plugins: {
      tooltip: {
        callbacks: {
          title() {
            return '';
          },
          label(tooltipItem: TooltipItem<'pcp'>) {
            const label = tooltipItem.chart.data?.labels?.[tooltipItem.dataIndex];
            const ds = tooltipItem.chart
              .getSortedVisibleDatasetMetas()
              .map((d) => `${d.label}=${d.controller.getDataset().data[tooltipItem.dataIndex]}`);

            return `${label}(${ds.join(', ')})`;
          },
        },
      },
    },
  };
}

export interface IParallelCoordinatesControllerDatasetOptions
  extends ControllerDatasetOptions,
    ILinearAxisOptions,
    ScriptableAndArrayOptions<ILineSegmentOptions, ScriptableContext<'pcp'>>,
    ScriptableAndArrayOptions<CommonHoverOptions, ScriptableContext<'pcp'>> {
  stack: string;
}

export type IParallelCoordinatesChartOptions = ILinearAxisOptions;

declare module 'chart.js' {
  interface ChartTypeRegistry {
    pcp: {
      chartOptions: IParallelCoordinatesChartOptions;
      datasetOptions: IParallelCoordinatesControllerDatasetOptions;
      defaultDataPoint: number;
      metaExtensions: Record<string, never>;
      parsedDataType: { y: number };
      scales: keyof CartesianScaleTypeRegistry;
    };
  }
}

export class ParallelCoordinatesChart<DATA extends unknown[] = number[], LABEL = string> extends Chart<
  'pcp',
  DATA,
  LABEL
> {
  static id = ParallelCoordinatesController.id;

  constructor(item: ChartItem, config: Omit<ChartConfiguration<'pcp', DATA, LABEL>, 'type'>) {
    super(item, patchController('pcp', config, ParallelCoordinatesController, [LinearAxis, LineSegment], PCPScale));
  }
}
