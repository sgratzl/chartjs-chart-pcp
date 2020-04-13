import * as Chart from 'chart.js';

Chart.defaults.global.elements.linearAxis = Object.assign(
  {
    axisWidth: 30,
  },
  Chart.scaleService.getScaleDefaults('linear')
);

const superClassC = Chart.scaleService.getScaleConstructor('linear');
const superClass = superClassC.prototype;
export const LinearAxis = (Chart.elements.LinearAxis = superClassC.extend({
  _type: 'linearAxis',
  initialize() {
    superClass.initialize.call(this);
    const chart = this._chart;
    this.chart = chart;
    this.ctx = chart.ctx;
    this.options = Chart.helpers.merge({}, [this.chart.options.elements.linearAxis]);
  },
  update() {
    const w = this._model.right - this._model.left;
    const h = this._model.bottom - this._model.top;
    superClass.update.call(this, w, h);
  },
  draw() {
    // _configure;
    // update(w, h, margins)
    // scale.mergeTicksOptions();
    // left,right,top,bottom,width,height
    superClass.draw.call(this, {
      left: 0,
      top: 0,
      right: this._view.width,
      bottom: this._view.height,
    });
  },

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
}));

Chart.defaults.global.elements.logarithmicAxis = Chart.scaleService.getScaleDefaults('logarithmic');

export const LogarithmicAxis = (Chart.elements.LogarithmicAxis = Chart.Element.extend({
  draw() {
    // TODO
  },
}));

// draw: function() {
// 		var me = this;
// 		var vm = me._view;
// 		var ctx = me._chart.ctx;
// 		var spanGaps = vm.spanGaps;
// 		var points = me._children.slice(); // clone array
// 		var globalDefaults = core_defaults.global;
// 		var globalOptionLineElements = globalDefaults.elements.line;
// 		var lastDrawnIndex = -1;
// 		var closePath = me._loop;
// 		var index, previous, currentVM;

// 		if (!points.length) {
// 			return;
// 		}

// 		if (me._loop) {
// 			for (index = 0; index < points.length; ++index) {
// 				previous = helpers$1.previousItem(points, index);
// 				// If the line has an open path, shift the point array
// 				if (!points[index]._view.skip && previous._view.skip) {
// 					points = points.slice(index).concat(points.slice(0, index));
// 					closePath = spanGaps;
// 					break;
// 				}
// 			}
// 			// If the line has a close path, add the first point again
// 			if (closePath) {
// 				points.push(points[0]);
// 			}
// 		}

// 		ctx.save();

// 		// Stroke Line Options
// 		ctx.lineCap = vm.borderCapStyle || globalOptionLineElements.borderCapStyle;

// 		// IE 9 and 10 do not support line dash
// 		if (ctx.setLineDash) {
// 			ctx.setLineDash(vm.borderDash || globalOptionLineElements.borderDash);
// 		}

// 		ctx.lineDashOffset = valueOrDefault$1(vm.borderDashOffset, globalOptionLineElements.borderDashOffset);
// 		ctx.lineJoin = vm.borderJoinStyle || globalOptionLineElements.borderJoinStyle;
// 		ctx.lineWidth = valueOrDefault$1(vm.borderWidth, globalOptionLineElements.borderWidth);
// 		ctx.strokeStyle = vm.borderColor || globalDefaults.defaultColor;

// 		// Stroke Line
// 		ctx.beginPath();

// 		// First point moves to it's starting position no matter what
// 		currentVM = points[0]._view;
// 		if (!currentVM.skip) {
// 			ctx.moveTo(currentVM.x, currentVM.y);
// 			lastDrawnIndex = 0;
// 		}

// 		for (index = 1; index < points.length; ++index) {
// 			currentVM = points[index]._view;
// 			previous = lastDrawnIndex === -1 ? helpers$1.previousItem(points, index) : points[lastDrawnIndex];

// 			if (!currentVM.skip) {
// 				if ((lastDrawnIndex !== (index - 1) && !spanGaps) || lastDrawnIndex === -1) {
// 					// There was a gap and this is the first point after the gap
// 					ctx.moveTo(currentVM.x, currentVM.y);
// 				} else {
// 					// Line to next point
// 					helpers$1.canvas.lineTo(ctx, previous._view, currentVM);
// 				}
// 				lastDrawnIndex = index;
// 			}
// 		}

// 		if (closePath) {
// 			ctx.closePath();
// 		}

// 		ctx.stroke();
// 		ctx.restore();
// 	}
// });
