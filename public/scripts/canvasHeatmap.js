(function (H) {

  /**
   * Get the canvas context for a series
   */
  H.Series.prototype.getContext = function () {
    var canvas;
    if (!this.ctx) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('width', this.chart.plotWidth);
      canvas.setAttribute('height', this.chart.plotHeight);
      canvas.style.position = 'absolute';
      canvas.style.left = this.group.translateX + 'px';
      canvas.style.top = this.group.translateY + 'px';
      canvas.style.zIndex = 0;
      canvas.style.cursor = 'crosshair';
      this.chart.container.appendChild(canvas);
      if (canvas.getContext) {
        this.ctx = canvas.getContext('2d');
      }
    }
    return this.ctx;
  };

  /**
   * Wrap the drawPoints method to draw the points in canvas instead of the slower SVG,
   * that requires one shape each point.
   */
  H.wrap(H.seriesTypes.heatmap.prototype, 'drawPoints', function (proceed) {

    var ctx;
    if (this.chart.renderer.forExport) {
      // Run SVG shapes
      proceed.call(this);

    } else {
      ctx = this.getContext();
      if (ctx) {

        // draw the columns
        H.each(this.points, function (point) {
          var plotY = point.plotY,
            shapeArgs;

          if (plotY !== undefined && !isNaN(plotY) && point.y !== null) {
            shapeArgs = point.shapeArgs;

            ctx.fillStyle = point.pointAttr[''].fill;
            ctx.fillRect(shapeArgs.x + 2, shapeArgs.y + 2, shapeArgs.width - 4, shapeArgs.height - 4);
          }
        });
      } else {
        this.chart.showLoading("Your browser doesn't support HTML5 canvas, <br>please use a modern browser");

        // Uncomment this to provide low-level (slow) support in oldIE. It will cause script errors on
        // charts with more than a few thousand points.
        proceed.call(this);
      }
    }
  });
}(window.Highcharts));
