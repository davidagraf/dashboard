'use strict';

(function() {
  var widgetsHeights = [3, 2, 5, 1, 1, 4, 3, 6, 2, 4, 2, 4, 3, 2, 1],
      //COLUMN_WIDTH = 200,
      ROW_HEIGHT = 50,
      $container = $('#container'),
      widgets = new Array(widgetsHeights.length);

  $(function() {
    $.each(widgetsHeights, function(i, v) {
      var $widget = $('<div class="widget" />');
      $widget.height(ROW_HEIGHT * v);
      widgets[i] = {
        priority: i,
        pos: 0,
        dom: $widget
      };
      $container.append($widget);
    });
    console.log(widgets);
  });

})();
