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
    return widget.top + Math.abs(widget.right - normCol) * DISTANCE_COEFF;
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
        if (a.top > b.top) {
          return 1;
        } else if (a.top < b.top) {
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
        minWeight = widgetToInsert.top;
      } else {
        i = j = 0;
        minWeight = computeWeight(widgetsClone[i], colToInsert);
        while(++i < widgetsClone.length && widgetsClone[i].top < minWeight) {
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
        widgetToInsert.top = free[colToInsert];
        widgetToInsert.right = colToInsert / (nrOfColumns - 1);
        widgetToInsert.dom.attr('data-col', colToInsert);
      }

      $('.info', widgetToInsert.dom).text(
        'top: ' + widgetToInsert.top +
        ' / right: ' + math.round(widgetToInsert.right, 2) +
        ' / weight: ' + math.round(minWeight, 2)
      );

      free[colToInsert] += (MARGIN + widgetToInsert.dom.height());
    }

    $container.height(math.max(free));

  },
  
  createDragNDropHandler = function($widget) {
    var offset;
    return {
      prepareForDrag: function(dragNDrop) {
        offset = $widget.offset();
        $widget.addClass('dragging');
        $('body').addClass('noselect');
      },
      prepareForDrop: function(dragNDrop) {
        $widget.removeClass('dragging');
        $('body').removeClass('noselect');
        $widget.offset(offset);
      }
    };
  };

  $(function() {
    $.each(widgetsHeights, function(i, v) {
      var dragNDrop,
          $widget = $(
            '<div class="widget"><div class="dragarea"><p>' + i + '</p></div><div class="info"/></div>'
          );

      $widget.height(ROW_HEIGHT * v);
      widgets[i] = {
        top: i,
        right: 0,
        dom: $widget
      };

      dragNDrop = window.createDragNDrop($container, $widget, $('.dragarea', $widget));
      dragNDrop.setHandler(createDragNDropHandler($widget));
      dragNDrop.init();

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
