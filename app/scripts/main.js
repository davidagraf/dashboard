'use strict';

(function() {
  var widgetsHeights = [3, 2, 5, 1, 1, 4, 3, 6, 2, 4, 2, 4, 3, 2, 1],
      COLUMN_WIDTH = 250,
      MARGIN = 15,
      ROW_HEIGHT = 40,
      $container = $('#container'),
      widgets = new Array(widgetsHeights.length),
      DISTANCE_COEFF = 100,

  computeNrOfColumns = function() {
    return Math.floor(($container.width() + MARGIN) / (COLUMN_WIDTH + MARGIN));
  },
  nrOfColumns = computeNrOfColumns(),

  computeWeight = function(widget, column) {
    var normCol = column / nrOfColumns;
    return widget.prio + Math.abs(widget.pos - normCol) * DISTANCE_COEFF;
  },

  positionWidgets = function(updatePrios, noWeights) {
    var free = new Array(nrOfColumns),
        widgetsClone = widgets.slice(0),
        colToInsert, widgetToInsert, left, i, j, minWeight, nextWeight;

    $.each(free, function(i) {
      free[i] = 0;
    });
    
    widgetsClone.sort(
      function(a, b) {
        if (a.prio > b.prio) {
          return 1;
        } else if (a.prio < b.prio) {
          return -1;
        } else {
          return 0;
        }
      }
    );

    while (widgetsClone.length > 0) {
      colToInsert = free.indexOf(Math.min.apply(Math, free));

      if (noWeights) {
        widgetToInsert = widgetsClone.splice(0, 1)[0];
        minWeight = widgetToInsert.prio;
      } else {
        i = j = 0;
        minWeight = computeWeight(widgetsClone[i], colToInsert);
        while(++i < widgetsClone.length && widgetsClone[i].prio < minWeight) {
          nextWeight = computeWeight(widgetsClone[i], colToInsert);
          if (nextWeight < minWeight) {
            j = i;
            minWeight = nextWeight;
          }
        }
        widgetToInsert = widgetsClone.splice(j, 1)[0];
      }

      if (colToInsert === 0) {
        left = 0;
      } else {
        left = colToInsert * (COLUMN_WIDTH + MARGIN);
      }
      widgetToInsert.dom.css({
        top: free[colToInsert],
        left: left
      });

      if (updatePrios) {
        widgetToInsert.prio = free[colToInsert];
        widgetToInsert.pos = colToInsert / (nrOfColumns - 1);
      }

      $('.info', widgetToInsert.dom).text(
        'prio: ' + widgetToInsert.prio +
        ' / pos: ' + widgetToInsert.pos +
        ' / weight: ' + Math.round(100*minWeight) / 100
      );

      free[colToInsert] += (MARGIN + widgetToInsert.dom.height());
    }

  };

  $(function() {
    $.each(widgetsHeights, function(i, v) {
      var $widget = $('<div class="widget"><div class="name">' + i + '</div><div class="info"/></div>');
      $widget.height(ROW_HEIGHT * v);
      widgets[i] = {
        prio: i,
        pos: 0,
        dom: $widget
      };
      $container.append($widget);
    });
    positionWidgets(true, true);

    $(window).resize(function() {
      var curColumns = computeNrOfColumns();
      if (curColumns !== nrOfColumns) {
        nrOfColumns = curColumns;
        positionWidgets();
      }
    });
  });

})();
