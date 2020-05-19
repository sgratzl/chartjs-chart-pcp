import { defaults, LinearScale, LogarithmicScale, merge, registerElement } from '../chart';

function BaseMixin(superClass) {
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

      super.update(w, h);

      this.top = props.top;
      this.bottom = props.bottom;
      this.configure();
    }
    draw(ctx) {
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

export class LinearAxis extends BaseMixin(LinearScale) {}

LinearAxis.id = LinearAxis._type = 'linearAxis';
LinearAxis.defaults = merge({}, [defaults.scale, LinearScale.defaults, scaleDefaults]);
LinearAxis.register = () => registerElement(LinearAxis);

export class LogarithmicAxis extends BaseMixin(LogarithmicScale) {}

LogarithmicAxis.id = LogarithmicAxis._type = 'logarithmicAxis';
LogarithmicAxis.defaults = merge({}, [defaults.scale, LogarithmicScale.defaults, scaleDefaults]);
LogarithmicAxis.register = () => registerElement(LogarithmicAxis);
