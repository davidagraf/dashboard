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
  originalNrOfColumns = computeNrOfColumns(),
  nrOfColumns = originalNrOfColumns,

  positionWidgets = function(savePosition) {
    var free = new Array(nrOfColumns),
        max;

    console.log('Repositioning with ' + nrOfColumns + ' columns.');
    console.log('Original: ' + originalNrOfColumns);

    $.each(free, function(i) {
      free[i] = 0;
    });

    $.each(widgets, function(i, widget) {
      var from, to, j, minCol;

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

      if (savePosition) {
        widget.top = free[minCol];
        widget.left = minCol;
      }

      free[minCol] += (MARGIN + widget.dom.height());
    });

    max = -1;
    $.each(free, function(i, v) {
      if (max < v.top) {
        max = v.top;
      }
    });
    $container.height(max);

  },
  
  createDragNDropHandler = function($widget) {
    var offset;
    return {
      prepareForDrag: function(/*dragNDrop*/) {
        offset = $widget.offset();
        $widget.addClass('dragging');
        $('body').addClass('noselect');
      },
      prepareForDrop: function(/*dragNDrop*/) {
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
      $widget.attr('data-width', widgetsWidths[i]);
      widgets[i] = {
        top: 0,
        left: -1,
        dom: $widget
      };

      dragNDrop = window.createDragNDrop($container, $widget, $('.dragarea', $widget));
      dragNDrop.setHandler(createDragNDropHandler($widget));
      dragNDrop.init();

      $container.append($widget);
    });
    positionWidgets(true);

    $(window).resize(function() {
      var curColumns = computeNrOfColumns();
      if (curColumns !== nrOfColumns) {
        nrOfColumns = curColumns;
        positionWidgets();
      }
    });
  });

})();
