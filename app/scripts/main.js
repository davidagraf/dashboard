/* global mathjs:true */

'use strict';

(function() {
  var

  genMeta = function(width, height, col, top) {
    return {
      width: width,
      height: height,
      col: col,
      top: top
    };
  },

  widgets = [
    // genMeta(height, with, col, top)
    genMeta(1, 1, 0, 1),
    genMeta(2, 2, 1, 2),
    genMeta(1, 2, 2, 3),
    genMeta(1, 3, 3, 4),
    genMeta(1, 3, 4, 5),
    genMeta(1, 2, 0, 6),
    genMeta(1, 3, 1, 7),
    genMeta(1, 1, 2, 8)
  ],
  COLUMN_WIDTH = 320,
  MARGIN = 15,
  ROW_HEIGHT = 100,
  $container = $('#container'),
  math = mathjs(),
  verticalWidgetSpace = 0,
  posUpdated = false,
  swift = 0,

  nrOfColumns = function() {
    var nr;

    nr = Math.floor(($('body').width() + MARGIN) / (COLUMN_WIDTH + MARGIN));
    if (nr < 3) {
      nr = 3;
    } else if (nr > 5) {
      nr = 5;
    }
    return nr;
  },

  prepPositionUpdate = function() {
    posUpdated = true;
    curNrOfColumns = 5;
  },

  curNrOfColumns = nrOfColumns(),

  overlappingCols = function(widget1, widget2) {
    return (widget1.col <= widget2.col && widget1.col + widget1.width > widget2.col) ||
           (widget2.col <= widget1.col && widget2.col + widget2.width > widget1.col);
  },

  inRange = function(a) {
    return (a.col >= 0 && a.col < curNrOfColumns);
  },

  doSwift = function(x) {
    var tmp;

    if (!posUpdated) {
      return;
    }

    tmp = swift + x;

    if (tmp < 0 || tmp > (5 - nrOfColumns())) {
      return;
    }

    swift = tmp;
    positionWidgets();
  },

  widgetsSorter = function(a, b) {
    if (!inRange(a) && inRange(b)) {
      return 1;
    }
    if (inRange(a) && !inRange(b)) {
      return -1;
    }
    if (a.top !== b.top) {
      return a.top - b.top;
    } else if (!overlappingCols(a,b)) {
      return a.col - b.col;
    } else {
      return a.index - b.index;
    }
  },

  positionWidgets = function(save) {
    var free = new Array(curNrOfColumns);

    widgets.sort(widgetsSorter);

    $.each(free, function(i) {
      free[i] = 0;
    });

    $.each(widgets, function(i, widget) {
      var j, k, minCol, minTop, top;

      if (!widget.dom.hasClass('dragging')) {

        if (widget.col >= 0 && (widget.col + widget.width) <= curNrOfColumns) {
          minCol = widget.col;
          minTop = math.max(free.slice(minCol, minCol + widget.width));
        } else {
          minCol = 0;
          minTop = math.max(free.slice(minCol, minCol + widget.width));
          for (j = 1; j < curNrOfColumns - (widget.width - 1); ++j) {
            top = math.max(free.slice(j, j + widget.width));
            if (top < minTop) {
              minCol = j;
              minTop = top;
            }
          }
        }

        widget.dom.css({
          top: minTop,
          left: (minCol - swift) * (COLUMN_WIDTH + MARGIN)
        });

        if (save) {
          widget.top = minTop;
          widget.col = minCol;
          widget.index = i;
        }

        for (k = 0; k < widget.width; ++k) {
          free[minCol + k] = (MARGIN + minTop + widget.dom.height());
        }
      }

    });

    verticalWidgetSpace = math.max(free);
    $container.height(verticalWidgetSpace);

  },

  mouseLeft = function(ev) {
    console.log('mouseLeft');
  },
  
  createDragNDropHandler = function(widget) {
    var offset, top1, top2;
    return {
      prepareForDrag: function(/*dragNDrop*/) {
        offset = widget.dom.offset();
        widget.dom.addClass('dragging');
        $('body').addClass('noselect');
        positionWidgets(true);
        prepPositionUpdate();
        $container.on('mouseleave', mouseLeft);
      },
      prepareForDrop: function(dragNDrop) {
        var x = dragNDrop.getWidgetX(),
            y = dragNDrop.getWidgetY(),
            col, i, tmp;
        widget.dom.removeClass('dragging');
        $('body').removeClass('noselect');
        $container.unbind('mouseleave', mouseLeft);

        if (widgets.length > 1) {
          col = math.floor( (x + COLUMN_WIDTH / 2) / (COLUMN_WIDTH + MARGIN)) + swift;
          if (col < 0) {
            col = 0;
          } else if (col > (curNrOfColumns - widget.width)) {
            col = curNrOfColumns - widget.width;
          }
          
          // search new position
          widget.col = col;
          top1 = Infinity;
          top2 = 0;
          widget.index = -1;
          for (i = widgets.length - 1; i >= 0; --i) {
            if (widgets[i].index >= 0 && overlappingCols(widget, widgets[i])) {
              tmp = widgets[i].top + widgets[i].dom.height();
              if (tmp > y && widgets[i].top < top1) {
                top1 = widgets[i].top;
              }
            }
          }
          for (i = 0; i < widgets.length; ++i) {
            if (widgets[i].index >= 0 && overlappingCols(widget, widgets[i])) {
              tmp = widgets[i].top + widgets[i].dom.height();
              if (tmp < y && tmp + MARGIN > top2) {
                top2 = tmp + MARGIN;
              }
            }
          }

          widget.top = (top1 < top2 ? top1 : top2);

          positionWidgets(true);
        }
      }
    };
  };

  $(function() {
    $(window).scroll(function(){
      var scrollTop = $(this).scrollTop();
      if (scrollTop < 0) {
        scrollTop = 0;
      }
      $('#head').css({
        top: -scrollTop + 15
      });
    });

    $.each(widgets, function(i, v) {
      var dragNDrop,
          $widget = $(
            '<div class="widget"><div class="dragarea"><p>' + i + '</p></div><div class="info"/></div>'
          );

      $widget.height(ROW_HEIGHT * v.height);
      $widget.attr('data-width', v.width);
      v.name = i;
      v.dom = $widget;

      $container.append($widget);

      dragNDrop = window.createDragNDrop($container, $widget, $('.dragarea', $widget));
      dragNDrop.setHandler(createDragNDropHandler(widgets[i]));
      dragNDrop.init();

    });
    positionWidgets();

    $('#left').click(function() {
      doSwift(-1);
    });
    $('#right').click(function() {
      doSwift(1);
    });

    $(window).resize(function() {
      var tmp;
      tmp = nrOfColumns();
      if (!posUpdated) {
        if (tmp !== curNrOfColumns) {
          curNrOfColumns = tmp;
          positionWidgets();
        }
      } else {
        if (swift > (5 - nrOfColumns())) {
          swift = 5 - nrOfColumns();
          positionWidgets();
        }
      }
    });

  });

})();
