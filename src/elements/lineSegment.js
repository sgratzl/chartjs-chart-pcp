import { defaults, Element } from 'chart.js';

export class LineSegment extends Element {
  _getLineParts(props) {
    // y = x * k + d
    const k = (props.y1 - props.y) / (props.x1 - props.x);
    const d = props.y - props.x * k;
    return { d, k };
  }

  inRange(mouseX, mouseY, useFinalPosition) {
    const props = this.getProps(['x', 'x1', 'y', 'y1'], useFinalPosition);
    const dk = this._getLineParts(props);
    const targetY = mouseX * dk.k + dk.d;
    const targetX = (mouseY - dk.d) / dk.k + dk.d;
    const range = this.options.borderWidth * 2;
    return (
      (Math.abs(mouseY - targetY) < range || Math.abs(mouseX - targetX) < range) &&
      mouseX + range >= props.x &&
      mouseX - range <= props.x1 &&
      mouseY + range >= Math.min(props.y, props.y1) &&
      mouseY - range <= Math.max(props.y, props.y1)
    );
  }

  tooltipPosition(useFinalPosition) {
    const props = this.getProps(['x', 'x1', 'y', 'y1'], useFinalPosition);
    return {
      x: (props.x1 + props.x) / 2,
      y: (props.y1 + props.y) / 2,
      padding: this.options.borderWidth,
    };
  }

  getCenterPoint(useFinalPosition) {
    const props = this.getProps(['x', 'x1', 'y', 'y1'], useFinalPosition);
    return {
      x: (props.x1 + props.x) / 2,
      y: (props.y1 + props.y) / 2,
    };
  }

  inXRange(mouseX, useFinalPosition) {
    const props = this.getProps(['x', 'x1'], useFinalPosition);
    const range = this.options.borderWidth * 2;
    return mouseX + range >= props.x && mouseX - range <= props.x1;
  }

  inYRange(mouseY, useFinalPosition) {
    const props = this.getProps(['y', 'y1'], useFinalPosition);
    const range = this.options.borderWidth * 2;
    return mouseY + range >= Math.min(props.y, props.y1) && mouseY - range <= Math.max(props.y, props.y1);
  }

  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const props = this.getProps(['x', 'x1', 'y', 'y1', 'xCPn', 'yCPn', 'xCPp1', 'yCPp1']);
    const options = this.options;
    ctx.save();

    // Stroke Line Options
    ctx.lineCap = options.borderCapStyle;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.lineJoin = options.borderJoinStyle;
    ctx.lineWidth = options.borderWidth;
    ctx.strokeStyle = options.borderColor;

    // Stroke Line
    ctx.beginPath();

    ctx.moveTo(props.x, props.y);
    if (options.tension) {
      ctx.bezierCurveTo(props.xCPn, props.yCPn, props.xCPp1, props.yCPp1, props.x1, props.y1);
    } else {
      ctx.lineTo(props.x1, props.y1);
    }

    ctx.stroke();
    ctx.restore();
  }
}

LineSegment._type = 'lineSegment';
LineSegment.register = () => {
  defaults.set('elements', {
    [LineSegment._type]: Object.assign({}, defaults.elements.line, {
      hoverBorderWidth: 4,
      hoverBorderColor: 'rgba(0,0,0,0.8)',
      borderCapStyle: 'round',
      tension: 0,
    }),
  });
  return LineSegment;
};
