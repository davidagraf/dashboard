/* global mathjs:true */

'use strict';

(function() {
  var widgetsHeights = [3, 2, 5, 1, 1, 4, 3, 6, 2, 4, 2, 4, 3, 2, 1, 5, 1, 1, 4, 3, 6, 2, 4],
      COLUMN_WIDTH = 250,
      MARGIN = 15,
      ROW_HEIGHT = 50,
      $container = $('#container'),
      widgets = new Array(widgetsHeights.length),
      HORIZONTAL_VERTICAL_COEFF = 1,
      math = mathjs(),
      sumWidgetHeights = 0,
 
  computeNrOfColumns = function() {
    var nr = Math.floor(($container.width() + MARGIN) / (COLUMN_WIDTH + MARGIN));
    if (nr < 1) {
      nr = 1;
    }
    return nr;
  },
  nrOfColumns = computeNrOfColumns(),

  positionWidgets = function(updatePrios) {
    var free = new Array(nrOfColumns),
        widgetsClone = widgets.slice(0),
        potentialToInsert, widgetToInsert,
        verticalNormalizer = nrOfColumns / sumWidgetHeights,
        horizontalNormalizer = 1 / (nrOfColumns - 1),
        max;

    console.log('Repositioning with ' + nrOfColumns + ' columns.');

    $.each(free, function(i) {
      free[i] = {
        top: 0,
      };
    });

    while (widgetsClone.length > 0) {

      $.each(free, function(i, v) {
        v.weight = Infinity;
      });
    
      $.each(free, function(i, v) {
        var normRight = i * horizontalNormalizer;
        $.each(widgetsClone, function(j, w) {
          var weight = w.top * HORIZONTAL_VERTICAL_COEFF +
                       math.round(math.abs(normRight - w.right), 6); //rounding to avoid rounding error of javascript
          if (weight < v.weight) {
            v.weight = weight;
            v.index = j;
          }
        });
      });

      potentialToInsert = {
        top: Infinity,
        weight: Infinity
      };

      $.each(free, function(i, v) {
        if (potentialToInsert.weight > v.weight || potentialToInsert.top > v.top) {
          potentialToInsert = v;
          potentialToInsert.col = i;
        }
      });

      widgetToInsert = widgetsClone.splice(potentialToInsert.index, 1)[0];

      widgetToInsert.dom.css({
        top: potentialToInsert.top,
        left: potentialToInsert.col * (COLUMN_WIDTH + MARGIN)
      });

      if (updatePrios) {
        widgetToInsert.top = potentialToInsert.top * verticalNormalizer;
        widgetToInsert.right = potentialToInsert.col * horizontalNormalizer;
        widgetToInsert.dom.attr('data-col', potentialToInsert.col);
      }

      $('.info', widgetToInsert.dom).text(
        'top: ' + math.round(widgetToInsert.top, 2) +
        ' / right: ' + math.round(widgetToInsert.right, 2) +
        ' / weight: ' + math.round(potentialToInsert.weight, 2)
      );

      potentialToInsert.top += (MARGIN + widgetToInsert.dom.height());

    }

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
        top: 0,
        right: 0,
        dom: $widget
      };

      dragNDrop = window.createDragNDrop($container, $widget, $('.dragarea', $widget));
      dragNDrop.setHandler(createDragNDropHandler($widget));
      dragNDrop.init();

      $container.append($widget);
      sumWidgetHeights += ($widget.height() + MARGIN);
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
