import {
  Chart,
  DatasetController,
  LineController,
  merge,
  splineCurve,
  ChartItem,
  IControllerDatasetOptions,
  ScriptableAndArrayOptions,
  ICommonHoverOptions,
  IChartDataset,
  IChartConfiguration,
  ITooltipItem,
  UpdateMode,
  IChartComponent,
  IChartMeta,
} from '@sgratzl/chartjs-esm-facade';
import { LinearAxis, LineSegment, ILinearAxisOptions, ILineSegmentOptions, ILineSegmentProps } from '../elements';
import { PCPScale } from '../scales';
import patchController from './patchController';

interface IExtendedChartMeta extends IChartMeta<LineSegment, LinearAxis> {
  _metas: IChartMeta<any, any>[];
  _metaIndex: number;
}

export class ParallelCoordinatesController extends DatasetController<LineSegment, LinearAxis> {
  declare datasetElementType: IChartComponent;
  declare dataElementType: IChartComponent;

  linkScales() {
    const ds = this.getDataset() as any;
    ds.yAxisID = ds.label;
    super.linkScales();
    this._cachedMeta.vScale = this._cachedMeta.dataset;
  }

  addElements() {
    super.addElements();
    const meta = this._cachedMeta;
    const scale = meta.dataset as any;
    meta.yScale = meta.vScale = scale;

    scale.id = meta.yAxisID;
    scale.axis = 'y';
    scale.type = this.dataElementType.id;
    scale.options = {};
    scale.chart = this.chart;
    scale.ctx = this.chart.ctx;
  }

  update(mode: UpdateMode) {
    // from front to back

    const meta = this._cachedMeta as IExtendedChartMeta;
    meta._metas = this.chart.getSortedVisibleDatasetMetas();
    meta._metaIndex = meta._metas.indexOf(meta);
    if (meta._metaIndex < 0) {
      return;
    }

    const axis = meta.dataset!;
    this.updateAxis(axis, mode);

    const elements = meta.data || [];
    this.updateElements(elements, 0, mode);
  }

  draw() {
    // from back to front
    const meta = this._cachedMeta as IExtendedChartMeta;
    const elements = meta.data || [];
    const ctx = this.chart.ctx;
    if (meta._metaIndex < 0) {
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

  updateAxis(axis: LinearAxis, mode: UpdateMode) {
    const meta = this._cachedMeta as IExtendedChartMeta;
    const xScale = meta.xScale!;
    const x = xScale.getPixelForTick(meta._metaIndex);

    // TODO element options
    const properties = {
      x,
      top: this.chart.chartArea.top,
      bottom: this.chart.chartArea.bottom,
      options: merge({}, [
        (this.chart.options as any).elements[this.datasetElementType.id],
        this.resolveDatasetElementOptions(true),
        {
          position: meta._metaIndex > 0 ? 'right' : 'left',
        },
      ]),
    };
    super.updateElement(axis, undefined, properties, mode);
    axis.update();
  }

  updateElements(rectangles: LineSegment[], start: number, mode: UpdateMode) {
    const reset = mode === 'reset';
    const meta = this._cachedMeta as IExtendedChartMeta;
    const xScale = meta.xScale!;

    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(mode, rectangles[start], firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const getPoint = (metaIndex: number, index: number, defaultValue: { x: number; y: number }) => {
      const m = meta._metas[metaIndex];
      if (!m) {
        return defaultValue;
      }
      const x = xScale.getPixelForTick(metaIndex);
      const yScale = m.vScale!;
      const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(m._parsed[index][yScale.axis], index);

      return {
        x,
        y: Number.isNaN(y) ? defaultValue.y : y,
      };
    };

    for (let i = 0; i < rectangles.length; i++) {
      const index = start + i;
      const options = this.resolveDataElementOptions(index, mode);

      const xy = getPoint(meta._metaIndex, index, { x: 0, y: 0 });
      const xy_prev = getPoint(meta._metaIndex - 1, index, xy);

      const properties: Partial<ILineSegmentProps> & { options?: ILineSegmentOptions } = {
        x: xy_prev.x,
        y: xy_prev.y,
        x1: xy.x,
        y1: xy.y,
      };

      if (options.tension) {
        const xy_prevprev = getPoint(meta._metaIndex - 2, index, xy_prev);
        const xy_next = getPoint(meta._metaIndex + 1, index, xy);

        const controlPoints = splineCurve(xy_prevprev, xy_prev, xy, options.tension);
        const controlPoints1 = splineCurve(xy_prev, xy, xy_next, options.tension);

        properties.xCPn = controlPoints.next.x;
        properties.yCPn = controlPoints.next.y;
        properties.xCPp1 = controlPoints1.previous.x;
        properties.yCPp1 = controlPoints1.previous.y;
      }

      if (includeOptions) {
        properties.options = options;
      }
      this.updateElement(rectangles[i], index, properties, mode);
    }
    this.updateSharedOptions(sharedOptions, mode);
  }

  _findOtherControllers() {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    return metas.filter((meta) => (meta.controller as any) !== this);
  }

  removeHoverStyle(element: LineSegment, datasetIndex: number, index: number) {
    super.removeHoverStyle(element, datasetIndex, index);
    this._findOtherControllers().forEach((meta) => {
      meta.controller.removeHoverStyle(meta.data[index], meta.index, index);
    });
  }

  setHoverStyle(element: LineSegment, datasetIndex: number, index: number) {
    super.setHoverStyle(element, datasetIndex, index);
    this._findOtherControllers().forEach((meta) => {
      meta.controller.setHoverStyle(meta.data[index], meta.index, index);
    });
  }

  static readonly id: string = 'pcp';
  static readonly defaults: any = /*#__PURE__*/ {
    datasetElementType: LinearAxis.id,
    datasetElementOptions: ['axisWidth'],
    dataElementType: LineSegment.id,
    dataElementOptions: LineController.defaults.datasetElementOptions.concat([
      'tension',
      'hoverBackgroundColor',
      'hoverBorderColor',
      'hoverBorderWidth',
    ]),

    datasets: {
      animation: {
        numbers: {
          type: 'number',
          properties: ['x', 'y', 'x1', 'y1', 'axisWidth', 'xCPn', 'yCPn', 'xCPp1', 'yCPp1', 'borderWidth'],
        },
      },
    },
    scales: {
      x: {
        type: PCPScale.id,
        offset: true,
        gridLines: {
          drawBorder: false,
          display: false,
        },
      },
    },

    tooltips: {
      callbacks: {
        title() {
          return '';
        },
        label(tooltipItem: ITooltipItem) {
          const label = tooltipItem.chart.data.labels[tooltipItem.dataIndex];
          const ds = tooltipItem.chart
            .getSortedVisibleDatasetMetas()
            .map((d) => `${d.label}=${d.controller.getDataset().data[tooltipItem.dataIndex]}`);

          return `${label}(${ds.join(', ')})`;
        },
      },
    },
  };
}

export interface IParallelCoordinatesControllerDatasetOptions
  extends IControllerDatasetOptions,
    ILinearAxisOptions,
    ScriptableAndArrayOptions<ILineSegmentOptions>,
    ScriptableAndArrayOptions<ICommonHoverOptions> {}

export type IParallelCoordinatesControllerDataset<T = number> = IChartDataset<
  T,
  IParallelCoordinatesControllerDatasetOptions
>;

export interface IParallelCoordinatesChartOptions extends ILinearAxisOptions {}

export type IParallelCoordinatesControllerConfiguration<T = number, L = string> = IChartConfiguration<
  'pcp',
  T,
  L,
  IParallelCoordinatesControllerDataset<T>,
  IParallelCoordinatesChartOptions
>;

export class ParallelCoordinatesChart<T = number, L = string> extends Chart<
  T,
  L,
  IParallelCoordinatesControllerConfiguration<T, L>
> {
  static id = ParallelCoordinatesController.id;

  constructor(item: ChartItem, config: Omit<IParallelCoordinatesControllerConfiguration<T, L>, 'type'>) {
    super(item, patchController('pcp', config, ParallelCoordinatesController, [LinearAxis, LineSegment], PCPScale));
  }
}
