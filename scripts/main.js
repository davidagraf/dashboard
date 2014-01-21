/* global mathjs:true */

'use strict';

(function() {
  var widgetsHeights = [3,2,2,1,1,2,3,1,2,4,2,4,3,2,1,2,1,1,3,3,1,2,3],
      widgetsWidths =  [1,1,2,1,1,1,1,2,1,1,1,1,3,1,1,1,1,2,1,1,1,1,1],
      COLUMN_WIDTH = 320,
      MARGIN = 15,
      ROW_HEIGHT = 100,
      $container = $('#container'),
      $wrapper = $('#wrapper'),
      headHeight = $('#head').height(),
      widgets = new Array(widgetsHeights.length),
      math = mathjs(),
      scale = {scale: 1},
      verticalWidgetSpace = 0,
 
  computeNrOfColumns = function() {
    var nr = Math.floor(($container.width() + MARGIN) / (COLUMN_WIDTH + MARGIN));
    if (nr < 1) {
      nr = 1;
    }
    return nr;
  },
  nrOfColumns = computeNrOfColumns(),

  overlappingCols = function(widget1, widget2) {
    return (widget1.col <= widget2.col && widget1.col + widget1.width > widget2.col) ||
           (widget2.col <= widget1.col && widget2.col + widget2.width > widget1.col);
  },

  widgetsSorter = function(a, b) {
    if (a.top !== b.top) {
      return a.top - b.top;
    } else if (!overlappingCols(a,b)) {
      return a.col - b.col;
    } else {
      return a.index - b.index;
    }
  },

  positionWidgets = function() {
    var free = new Array(nrOfColumns);

    widgets.sort(widgetsSorter);

    $.each(free, function(i) {
      free[i] = 0;
    });

    $.each(widgets, function(i, widget) {
      var j, k, minCol, minTop, top;

      if (!widget.dom.hasClass('dragging')) {

        if (widget.col >= 0) {
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

    verticalWidgetSpace = math.max(free);
    $container.height(verticalWidgetSpace*scale.scale);

  },
  
  createDragNDropHandler = function(widget) {
    var offset, top1, top2;
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
          top1 = Infinity;
          top2 = 0;
          widget.index = -1;
          for (i = widgets.length - 1; i >= 0; --i) {
            if (
                widgets[i].index >= 0 &&
                (col <= widgets[i].col && col + widget.width > widgets[i].col ||
                  widgets[i].col <= col && widgets[i].col + widgets[i].width > col)) {
              tmp = widgets[i].top + widgets[i].dom.height();
              if (tmp > y && widgets[i].top < top1) {
                top1 = widgets[i].top;
              }
            }
          }
          for (i = 0; i < widgets.length; ++i) {
            if (
                widgets[i].index >= 0 &&
                (col <= widgets[i].col && col + widget.width > widgets[i].col ||
                  widgets[i].col <= col && widgets[i].col + widgets[i].width > col)) {
              tmp = widgets[i].top + widgets[i].dom.height();
              if (tmp < y && tmp + MARGIN > top2) {
                top2 = tmp + MARGIN;
              }
            }
          }

          widget.top = (top1 < top2 ? top1 : top2);

          positionWidgets();
        }
      }
    };
  };

  $(function() {
    var containerNextScale = scale.scale, initScrollLeft, initScrollTop, touchX, touchY;

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
        top: Infinity,
        col: -1,
        index: i
      };

      $container.append($widget);

      dragNDrop = window.createDragNDrop($container, $widget, $('.dragarea', $widget), $wrapper, scale);
      dragNDrop.setHandler(createDragNDropHandler(widgets[i]));
      dragNDrop.init();

    });
    positionWidgets();

    $(window).resize(function() {
      var curColumns = computeNrOfColumns();
      if (curColumns !== nrOfColumns) {
        nrOfColumns = curColumns;
        positionWidgets();
      }
    });

    //zoom
    var hammertime = $container.hammer({
      'transform_always_block': true,
      'transform_min_scale': 1,
      'drag_block_horizontal': false,
      'drag_block_vertical': false,
      'drag_min_distance': 0
    });

    hammertime.on('transform touch release', function(ev) {
      var tmp, min;
      switch(ev.type) {
        case 'touch':
          initScrollLeft = $wrapper.scrollLeft();
          initScrollTop = $(document).scrollTop();
          touchX = ev.gesture.center.pageX;
          touchY = ev.gesture.center.pageY - headHeight;
          break;
        case 'transform':
          tmp = ev.gesture.scale * scale.scale;
          min = $wrapper.width() / $container.width();
          if (tmp > 1) {
            tmp = 1;
          } else if (tmp < min) {
            tmp = min;
          }
          $container.css(
            '-webkit-transform',
            'scale('+ containerNextScale + ', ' + tmp + ')');
          containerNextScale = tmp;

          $container.height(verticalWidgetSpace*containerNextScale);

          tmp = touchX * containerNextScale / scale.scale - touchX + initScrollLeft;
          $wrapper.scrollLeft(tmp);

          tmp = touchY * containerNextScale / scale.scale - touchY + initScrollTop;
          $(document).scrollTop(tmp);

          break;
        case 'release':
          scale.scale = containerNextScale;
          break;
      }
    });

  });

})();
