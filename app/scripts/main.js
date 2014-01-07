/* global mathjs:true */

'use strict';

(function() {
  var widgetsHeights = [3,2,5,1,1,4,3,6,2,4,2,4,3,2,1,5,1,1,4,3,6,2,4],
      widgetsWidths =  [1,1,2,1,1,1,1,2,1,1,1,1,3,1,1,1,1,2,1,1,1,1,1],
      //widgetsWidths =  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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

  widgetsSorter = function(a, b) {
    if (a.top !== b.top) {
      return a.top - b.top;
    } else {
      return a.index - b.index;
    }
  },

  positionWidgets = function() {
    var free = new Array(nrOfColumns),
        max;

    widgets.sort(widgetsSorter);

    $.each(free, function(i) {
      free[i] = 0;
    });

    $.each(widgets, function(i, widget) {
      var j, k, minCol, minTop, top;

      if (!widget.dom.hasClass('dragging')) {

        if (widget.index < 0 && widget.top != Infinity) {
          minCol = widget.col;
          minTop = math.max(free.slice(minCol, minCol + widget.width));
        } else {
          minCol = 0;
          minTop = math.max(free.slice(minCol, minCol + widget.width));
          for (j = 1; j < nrOfColumns - (widget.width - 1); ++j) {
            top = math.max(free.slice(j, j + widget.width));
            if (top < minTop) {
              minCol = j;
              minTop = top;
            }
          }
        }

        widget.dom.css({
          top: minTop,
          left: minCol * (COLUMN_WIDTH + MARGIN)
        });

        widget.top = minTop;
        widget.col = minCol;
        widget.index = i;

        for (k = 0; k < widget.width; ++k) {
          free[minCol + k] = (MARGIN + minTop + widget.dom.height());
        }
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
        positionWidgets();
      },
      prepareForDrop: function(dragNDrop) {
        var x = dragNDrop.getWidgetX(),
            y = dragNDrop.getWidgetY(),
            col, i, tmp;
        widget.dom.removeClass('dragging');
        $('body').removeClass('noselect');

        if (widgets.length > 1) {
          col = math.floor( (x + COLUMN_WIDTH / 2) / (COLUMN_WIDTH + MARGIN));
          if (col < 0) {
            col = 0;
          } else if (col > (nrOfColumns - widget.width)) {
            col = nrOfColumns - widget.width;
          }
          
          // search new position
          widget.col = col;
          widget.top = Infinity;
          widget.index = -1;
          for (i = widgets.length - 1; i >= 0; --i) {
            if (
                widgets[i].index >= 0 &&
                (col <= widgets[i].col && col + widget.width > widgets[i].col ||
                  widgets[i].col <= col && widgets[i].col + widgets[i].width > col)) {
              tmp = widgets[i].top + widgets[i].dom.height();
              if (tmp > y && widgets[i].top < widget.top) {
                widget.top = widgets[i].top;
              }
            }
          }

          positionWidgets();
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
        name: i,
        dom: $widget,
        width: widgetsWidths[i],
        top: 0,
        col: 0,
        index: i
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
