import * as Chart from 'chart.js';

const defaults = {
  axisWidth: 40,
  position: 'right',
};

function createScale(type, superClassC) {
  const superClass = superClassC.prototype;
  return superClassC.extend(
    Object.assign({
      _type: type,
      initialize() {
        superClass.initialize.call(this);
        const chart = this._chart;
        this.chart = chart;
        this.ctx = chart.ctx;
        this.options = Chart.helpers.merge({}, [this.chart.options.elements.linearAxis]);
      },
      update() {
        const w = this._model.axisWidth;
        const h = this._model.bottom - this._model.top;
        this.left = 0;
        this.right = w;
        this.top = this._model.top;
        this.bottom = this._model.bottom;

        superClass.update.call(this, w, h);

        this.top = this._model.top;
        this.bottom = this._model.bottom;
        this._configure();
      },
      draw() {
        this.ctx.save();

        const w = this._view.axisWidth;
        if (this.options.position === 'left') {
          this.ctx.translate(this._view.x0 - w, 0);
        } else {
          this.ctx.translate(this._view.x0, 0);
        }
        superClass.draw.call(this, this._view);
        this.ctx.restore();
      },
    })
  );
}

Chart.defaults.global.elements.linearAxis = Object.assign({}, Chart.scaleService.getScaleDefaults('linear'), defaults);
export const LinearAxis = (Chart.elements.LinearAxis = createScale(
  'linearAxis',
  Chart.scaleService.getScaleConstructor('linear')
));

Chart.defaults.global.elements.logarithmicAxis = Object.assign(
  {},
  Chart.scaleService.getScaleDefaults('logarithmic'),
  defaults
);
export const LogarithmicAxis = (Chart.elements.LogarithmicAxis = createScale(
  'logarithmicAxis',
  Chart.scaleService.getScaleConstructor('logarithmic')
));
