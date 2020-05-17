import { scaleService, defaults } from 'chart.js';

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

export class LinearAxis extends BaseMixin(scaleService.getScaleConstructor('linear')) {}
LinearAxis._type = 'linearAxis';
LinearAxis.register = () => {
  defaults.set('elements', {
    [LinearAxis._type]: Object.assign({}, Chart.scaleService.getScaleDefaults('linear'), scaleDefaults),
  });
  return LinearAxis;
};

export class LogarithmicAxis extends BaseMixin(scaleService.getScaleConstructor('logarithmic')) {}
LogarithmicAxis._type = 'logarithmicAxis';
LogarithmicAxis.register = () => {
  defaults.set('elements', {
    [LogarithmicAxis._type]: Object.assign({}, Chart.scaleService.getScaleDefaults('logarithmic'), scaleDefaults),
  });
  return LogarithmicAxis;
};
