/* global mathjs:true */

'use strict';

(function() {
  var widgetsHeights = [3,2,5,1,1,4,3,6,2,4,2,4,3,2,1,5,1,1,4,3,6,2,4],
//      widgetsWidths =  [1,1,2,1,1,1,1,2,1,1,1,1,3,1,1,1,1,2,1,1,1,1,1],
      widgetsWidths =  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      COLUMN_WIDTH = 250,
      MARGIN = 15,
      ROW_HEIGHT = 50,
      $container = $('#container'),
      widgets = new Array(widgetsHeights.length),
      math = mathjs(),
 
  computeNrOfColumns = function() {
    var nr = Math.floor(($container.width() + MARGIN) / (COLUMN_WIDTH + MARGIN));
    if (nr < 1) {
      nr = 1;
    }
    return nr;
  },
  nrOfColumns = computeNrOfColumns(),

  positionWidgets = function(savePosition) {
    var free = new Array(nrOfColumns),
        max;

    $.each(free, function(i) {
      free[i] = 0;
    });

    $.each(widgets, function(i, widget) {
      var from, to, j, minCol;

      if (!widget.dom.hasClass('dragging')) {
        minCol = 0;
        for (j = 1; j < nrOfColumns; ++j) {
          if (free[j] < free[minCol]) {
            minCol = j;
          }
        }

        widget.dom.css({
          top: free[minCol],
          left: minCol * (COLUMN_WIDTH + MARGIN)
        });

        widget.prio = free[minCol] + minCol;
        widget.top = free[minCol];
        widget.col = minCol;
        widget.index = i;

        free[minCol] += (MARGIN + widget.dom.height());
      }
    });

    max = -1;
    $.each(free, function(i, v) {
      if (max < v.top) {
        max = v.top;
      }
    });
    $container.height(max);

  },
  
  createDragNDropHandler = function(widget) {
    var offset;
    return {
      prepareForDrag: function(/*dragNDrop*/) {
        offset = widget.dom.offset();
        widget.dom.addClass('dragging');
        $('body').addClass('noselect');
        positionWidgets(false);
      },
      prepareForDrop: function(dragNDrop) {
        var x = dragNDrop.getWidgetX(),
            y = dragNDrop.getWidgetY(),
            col, newPos, i;
        widget.dom.removeClass('dragging');
        $('body').removeClass('noselect');
        widget.dom.offset(offset);

        if (widgets.length > 1) {
          col = math.floor( (x + COLUMN_WIDTH / 2) / (COLUMN_WIDTH + MARGIN));
          if (col < 0) {
            col = 0;
          } else if (col >= nrOfColumns) {
            col = nrOfColumns - 1;
          }
          widgets.splice(widget.index, 1); // remove widget from old position
          
          // search new position
          newPos = widgets.length;
          for (i = widgets.length - 1; i >= 0; --i) {
            if (widgets[i].col === col) {
              if ((widgets[i].top + widgets[i].dom.height()) >= y) {
                newPos = i;
              }
            }
          }

          widgets.splice(newPos, 0, widget);

          positionWidgets(true);
        }
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
      $widget.attr('data-width', widgetsWidths[i]);
      widgets[i] = {
        prio: -1,
        dom: $widget
      };

      dragNDrop = window.createDragNDrop($container, $widget, $('.dragarea', $widget));
      dragNDrop.setHandler(createDragNDropHandler(widgets[i]));
      dragNDrop.init();

      $container.append($widget);
    });
    positionWidgets();

    $(window).resize(function() {
      var curColumns = computeNrOfColumns();
      if (curColumns !== nrOfColumns) {
        nrOfColumns = curColumns;
        positionWidgets();
      }
    });
  });

})();
