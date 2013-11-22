/* global mathjs:true */

'use strict';

(function() {
  var widgetsHeights = [3, 2, 5, 1, 1, 4, 3, 6, 2, 4, 2, 4, 3, 2, 1, 5, 1, 1, 4, 3, 6, 2, 4],
      COLUMN_WIDTH = 250,
      MARGIN = 15,
      ROW_HEIGHT = 50,
      $container = $('#container'),
      widgets = new Array(widgetsHeights.length),
      DISTANCE_COEFF = 500,
      math = mathjs(),
 
  computeNrOfColumns = function() {
    var nr = Math.floor(($container.width() + MARGIN) / (COLUMN_WIDTH + MARGIN));
    if (nr < 1) {
      nr = 1;
    }
    return nr;
  },
  nrOfColumns = computeNrOfColumns(),

  computeWeight = function(widget, column) {
    var normCol;
    if (nrOfColumns === 1) {
      normCol = column;
    } else {
      normCol = column / (nrOfColumns-1);
    }
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
        widgetToInsert.dom.attr('data-col', colToInsert);
      }

      $('.info', widgetToInsert.dom).text(
        'prio: ' + widgetToInsert.prio +
        ' / pos: ' + math.round(widgetToInsert.pos, 2) +
        ' / weight: ' + math.round(minWeight, 2)
      );

      free[colToInsert] += (MARGIN + widgetToInsert.dom.height());
    }

  };

  $(function() {
    $.each(widgetsHeights, function(i, v) {
      var $widget = $(
        '<div class="widget"><div class="dragarea"><p>' + i + '</p></div><div class="info"/></div>'
      );
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
