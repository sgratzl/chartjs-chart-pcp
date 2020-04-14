import * as Chart from 'chart.js';

Chart.defaults.global.elements.lineSegment = Object.assign({}, Chart.defaults.global.elements.line, {
  hoverBorderWidth: 4,
  hoverBorderColor: 'rgba(0,0,0,0.8)',
  borderCapStyle: 'round',
  tension: 0,
});

export const LineSegment = (Chart.elements.LineSegment = Chart.Element.extend({
  _type: 'lineSegment',
  _getLineParts() {
    const vm = this._view;
    // y = x * k + d
    const k = (vm.y1 - vm.y) / (vm.x1 - vm.x);
    const d = vm.y - vm.x * k;
    return { d, k };
  },
  inRange(mouseX, mouseY) {
    const vm = this._view;
    const dk = this._getLineParts();
    const targetY = mouseX * dk.k + dk.d;
    const targetX = (mouseY - dk.d) / dk.k + dk.d;
    const range = this._view.borderWidth * 2;
    return (
      (Math.abs(mouseY - targetY) < range || Math.abs(mouseX - targetX) < range) &&
      mouseX + range >= vm.x &&
      mouseX - range <= vm.x1 &&
      mouseY + range >= Math.min(vm.y, vm.y1) &&
      mouseY - range <= Math.max(vm.y, vm.y1)
    );
  },

  inLabelRange(mouseX, mouseY) {
    return this.inRange(mouseX, mouseY);
  },

  tooltipPosition() {
    const vm = this._view;
    return {
      x: (vm.x1 + vm.x) / 2,
      y: (vm.y1 + vm.y) / 2,
      padding: vm.borderWidth,
    };
  },

  getCenterPoint() {
    const vm = this._view;
    return {
      x: (vm.x1 + vm.x) / 2,
      y: (vm.y1 + vm.y) / 2,
    };
  },

  inXRange(mouseX) {
    const vm = this._view;
    const range = this._view.borderWidth * 2;
    return mouseX + range >= vm.x && mouseX - range <= vm.x1;
  },

  inYRange(mouseY) {
    const vm = this._view;
    const range = this._view.borderWidth * 2;
    return mouseY + range >= Math.min(vm.y, vm.y1) && mouseY - range <= Math.max(vm.y, vm.y1);
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

    ctx.moveTo(vm.x, vm.y);
    if (vm.tension) {
      ctx.bezierCurveTo(vm.xCPn, vm.yCPn, vm.xCPp1, vm.yCPp1, vm.x1, vm.y1);
    } else {
      ctx.lineTo(vm.x1, vm.y1);
    }

    ctx.stroke();
    ctx.restore();
  },
}));
