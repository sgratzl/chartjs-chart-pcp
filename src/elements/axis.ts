import {
  LinearScale,
  LogarithmicScale,
  defaults,
  Scale,
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

function BaseMixin<O extends IAxisOptions>(superClass: { new (...args: any[]): Scale<O> & Element<IAxisProps, O> }) {
  return class extends superClass {
    constructor() {
      super({});
    }
    update() {
      const w = this.options.axisWidth;
      // copy since it could return self
      const props = Object.assign({}, this.getProps(['width', 'height', 'top', 'bottom', 'left', 'right']));
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

    draw(c: any) {
      const ctx = c as CanvasRenderingContext2D;
      ctx.save();
      const props = this.getProps(['x', 'width', 'height', 'top', 'bottom', 'left', 'right']);

      const w = this.options.axisWidth;
      if (this.options.position === 'left') {
        ctx.translate(props.x - w, 0);
      } else {
        ctx.translate(props.x, 0);
      }
      super.draw(props);
      ctx.restore();
    }
  };
}

const scaleDefaults = {
  axisWidth: 10,
  position: 'right',
};

export type ILinearAxisOptions = IAxisOptions & LinearScaleOptions;

export class LinearAxis extends BaseMixin<ILinearAxisOptions>(LinearScale as any) {
  static readonly id = 'linearAxis';
  static readonly defaults = /*#__PURE__*/ merge({}, [defaults.scale, LinearScale.defaults, scaleDefaults]);
}

export type ILogarithmicAxisOptions = IAxisOptions & LogarithmicScaleOptions;

export class LogarithmicAxis extends BaseMixin<ILogarithmicAxisOptions>(LogarithmicScale as any) {
  static readonly id = 'logarithmicAxis';
  static readonly defaults = /*#__PURE__*/ merge({}, [defaults.scale, LogarithmicScale.defaults, scaleDefaults]);
}
