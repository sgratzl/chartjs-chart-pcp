import {
  LinearScale,
  LogarithmicScale,
  defaults,
  LogarithmicScaleOptions,
  CartesianScaleOptions,
  Element,
  LinearScaleOptions,
} from 'chart.js';
import { merge } from 'chart.js/helpers';

export interface IAxisOptions extends CartesianScaleOptions {
  // all options from
  // https://www.chartjs.org/docs/latest/axes/cartesian/linear.html#linear-cartesian-axis
  /**
   * width of the visible axis
   * @default 30
   */
  axisWidth: number;
}

export interface IAxisProps {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const scaleDefaults = {
  // a dummy scriptable option to enforce a context environment
  dummyOption: (_ctx: unknown) => 0,
  axisWidth: 10,
  position: 'right',
};

export type ILinearAxisOptions = IAxisOptions & LinearScaleOptions;

export class LinearAxis extends LinearScale<ILinearAxisOptions> {
  static readonly id = 'linearAxis';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [defaults.scale, LinearScale.defaults, scaleDefaults]);

  static readonly descriptors = /* #__PURE__ */ {
    _scriptable: (name: string): boolean =>
      !name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser',
    _indexable: (name: string): boolean => name !== 'borderDash' && name !== 'tickBorderDash',
  };

  constructor() {
    super({});
  }

  update(): number {
    const w = this.options.axisWidth;
    // copy since it could return self
    const props = {
      ...((this as unknown) as Element<IAxisProps, ILinearAxisOptions>).getProps([
        'width',
        'height',
        'top',
        'bottom',
        'left',
        'right',
      ]),
    };
    const h = props.bottom - props.top;
    this.left = 0;
    this.right = w;
    this.top = props.top;
    this.bottom = props.bottom;

    const r = super.update(w, h);

    this.top = props.top;
    this.bottom = props.bottom;
    this.configure();
    return r;
  }

  draw(c: unknown): void {
    const ctx = c as CanvasRenderingContext2D;
    ctx.save();
    const props = ((this as unknown) as Element<IAxisProps, ILinearAxisOptions>).getProps([
      'x',
      'width',
      'height',
      'top',
      'bottom',
      'left',
      'right',
    ]);

    const w = this.options.axisWidth;
    if (this.options.position === 'left') {
      ctx.translate(props.x - w, 0);
    } else {
      ctx.translate(props.x, 0);
    }
    super.draw(props);
    ctx.restore();
  }
}

export type ILogarithmicAxisOptions = IAxisOptions & LogarithmicScaleOptions;

export class LogarithmicAxis extends LogarithmicScale<ILogarithmicAxisOptions> {
  static readonly id = 'logarithmicAxis';

  static readonly defaults: any = /* #__PURE__ */ merge({}, [defaults.scale, LogarithmicScale.defaults, scaleDefaults]);

  constructor() {
    super({});
  }

  update(): number {
    return LinearAxis.prototype.update.call(this);
  }

  draw(c: unknown): void {
    return LinearAxis.prototype.draw.call(this, c);
  }
}

declare module 'chart.js' {
  export interface ElementOptionsByType {
    linearAxis: ILinearAxisOptions;
    logarithmicAxis: ILogarithmicAxisOptions;
  }
}
