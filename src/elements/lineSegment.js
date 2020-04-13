import * as Chart from 'chart.js';

Chart.defaults.global.elements.lineSegment = Chart.defaults.global.elements.line;

export const LineSegment = (Chart.elements.LineSegment = Chart.Element.extend({
  _type: 'lineSegment',
  inRange(mouseX, mouseY) {
    return false; // inRange(this._view, mouseX, mouseY);
  },

  inLabelRange(mouseX, mouseY) {
    var vm = this._view;
    return false; // isVertical(vm) ? inRange(vm, mouseX, null) : inRange(vm, null, mouseY);
  },

  inXRange(mouseX) {
    return false; // inRange(this._view, mouseX, null);
  },

  inYRange(mouseY) {
    return false; // inRange(this._view, null, mouseY);
  },

  draw() {
    const vm = this._view;
    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = this._chart.ctx;

    ctx.save();

    // Stroke Line Options
    ctx.lineCap = vm.borderCapStyle;

    // IE 9 and 10 do not support line dash
    if (ctx.setLineDash && vm.borderDash) {
      ctx.setLineDash(vm.borderDash);
    }

    ctx.lineDashOffset = vm.borderDashOffset;
    ctx.lineJoin = vm.borderJoinStyle;
    ctx.lineWidth = vm.borderWidth;
    ctx.strokeStyle = vm.borderColor;

    // Stroke Line
    ctx.beginPath();

    // TODO support bezier curves
    ctx.moveTo(vm.x0, vm.y0);
    ctx.lineTo(vm.x1, vm.y1);

    ctx.stroke();
    ctx.restore();
  },
}));
