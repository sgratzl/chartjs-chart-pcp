import { Element, LineElement, LineOptions } from 'chart.js';

export interface ILineSegmentOptions extends LineOptions {
  /**
   * line tension > 0 (e.g., 0.3) to create bezier curves
   * @default 0
   */
  tension: number;
}

export interface ILineSegmentProps {
  x: number;
  y: number;
  x1: number;
  y1: number;
  xCPn: number;
  yCPn: number;
  xCPp1: number;
  yCPp1: number;
}

export class LineSegment extends Element<ILineSegmentProps, ILineSegmentOptions> {
  // eslint-disable-next-line class-methods-use-this
  _getLineParts(props: Pick<ILineSegmentProps, 'x' | 'y' | 'x1' | 'y1'>): { d: number; k: number } {
    // y = x * k + d
    const k = (props.y1 - props.y) / (props.x1 - props.x);
    const d = props.y - props.x * k;
    return { d, k };
  }

  inRange(mouseX: number, mouseY: number, useFinalPosition: boolean): boolean {
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

  tooltipPosition(useFinalPosition: boolean): { x: number; y: number; padding: number } {
    const props = this.getProps(['x', 'x1', 'y', 'y1'], useFinalPosition);
    return {
      x: (props.x1 + props.x) / 2,
      y: (props.y1 + props.y) / 2,
      padding: this.options.borderWidth,
    };
  }

  getCenterPoint(useFinalPosition: boolean): { x: number; y: number } {
    const props = this.getProps(['x', 'x1', 'y', 'y1'], useFinalPosition);
    return {
      x: (props.x1 + props.x) / 2,
      y: (props.y1 + props.y) / 2,
    };
  }

  inXRange(mouseX: number, useFinalPosition: boolean): boolean {
    const props = this.getProps(['x', 'x1'], useFinalPosition);
    const range = this.options.borderWidth * 2;
    return mouseX + range >= props.x && mouseX - range <= props.x1;
  }

  inYRange(mouseY: number, useFinalPosition: boolean): boolean {
    const props = this.getProps(['y', 'y1'], useFinalPosition);
    const range = this.options.borderWidth * 2;
    return mouseY + range >= Math.min(props.y, props.y1) && mouseY - range <= Math.max(props.y, props.y1);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const props = this.getProps(['x', 'x1', 'y', 'y1', 'xCPn', 'yCPn', 'xCPp1', 'yCPp1']);
    const { options } = this;
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

  static readonly id = 'lineSegment';

  static readonly defaults = /* #__PURE__ */ {
    ...LineElement.defaults,
    hoverBorderWidth: 4,
    hoverBorderColor: 'rgba(0,0,0,0.8)',
    borderCapStyle: 'round',
    tension: 0,
  };

  static readonly defaultRoutes = LineElement.defaultRoutes;

  static readonly descriptors = (LineElement as any).descriptors;
}
