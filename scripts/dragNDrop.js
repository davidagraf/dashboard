'use strict';

(function() {

  window.createDragNDrop = function(container, widget, dragArea, scrollArea) {
    var
    that, // instance created by this factory
    DOCUMENT = jQuery(document), // jQuery Document object
    originX, originY, // position of widget before dragging
    lastScroll,
    baseMouseX, baseMouseY, // position of mouse/touch before dragging
    mouseX, mouseY, // current position of mouse/touch
    containerX, containerY, containerWidth, containerHeight, // properties of container
    widgetWidth, // width of widget
    handler = {}, // callbacks from outside
    hammertime,
    
    /**
     * Moves the widget.
     */
    drag = function(ev, newX, newY) {
      var posX, posY;
      
      // widget cannot be moved outside of the container
      if (newX + widgetWidth > containerWidth) {
        posX = containerWidth - widgetWidth;
      } else if (newX < 0) {
        posX = 0;
      } else {
        posX = newX;
      }
      
      // widget cannot be moved outside of the container
      if (newY < 0) {
        posY = 0;
      } else {
        posY = newY;
      }

      widget.css({
        left: posX + 'px',
        top: posY + 'px'
      });
    },

    scrollHandler = function(ev) {
      lastScroll = ev.scrollLeft();
    },
    
    /**
     * Touch move callback
     */
    touchDrag = function(ev) {
      var
        newX = originX + ev.gesture.deltaX,
        newY = originY + ev.gesture.deltaY;
   
      mouseX = baseMouseX + ev.gesture.deltaX;
      mouseY = baseMouseY + ev.gesture.deltaY;
      
      drag(ev, newX, newY);
    },
    
    /**
     * Mouse move callback
     */
    mouseDrag = function(ev) {
      var
        newX = originX + (ev.pageX - baseMouseX),
        newY = originY + (ev.pageY - baseMouseY);
      
      mouseX = ev.pageX;
      mouseY = ev.pageY;
      
      drag(ev, newX, newY);
    },
    
    /**
     * Common drop code
     */
    drop = function() {
      if (scrollArea) {
        scrollArea.unbind('scroll', scrollHandler);
      }
      if (handler.prepareForDrop) {
        handler.prepareForDrop(that);
      }
    },
    
    /**
     * Touch drop callback
     */
    touchDrop = function() {
      drop();
      hammertime.off('drag', touchDrag);
      hammertime.off('release', touchDrop);
    },
    
    /**
     * Mouse drop callback
     */
    mouseDrop = function() {
      drop();
      DOCUMENT.unbind('mousemove', mouseDrag);
      DOCUMENT.unbind('mouseup', mouseDrop);
    },
    
    /**
     * Stores properties of container and widget before dragging.
     */
    prepareForDrag = function() {
      if (scrollArea) {
        lastScroll = scrollArea.scrollLeft();
        scrollArea.on('scroll', scrollHandler);
      }
      containerX = container.offset().left;
      containerY = container.offset().top;
      containerWidth = container.width();
      containerHeight = container.height();
      
      originX = widget.offset().left - containerX;
      originY = widget.offset().top - containerY;
      
      if (handler.prepareForDrag) {
        handler.prepareForDrag(that);
      }
    },
    
    /**
     * Stores properties of mouse before dragging.
     */
    prepareForMouseDrag = function(ev) {
      mouseX = baseMouseX = ev.pageX;
      mouseY = baseMouseY = ev.pageY;
      
      DOCUMENT.on('mousemove', mouseDrag);
      DOCUMENT.on('mouseup', mouseDrop);
      
      prepareForDrag();
    },
    
    /**
     * Stores properties of touch before dragging.
     */
    prepareForTouchDrag = function(ev) {
      mouseX = baseMouseX = ev.gesture.center.pageX;
      mouseY = baseMouseY = ev.gesture.center.pageY;
      
      hammertime.on('drag', touchDrag);
      hammertime.on('release', touchDrop);
      
      prepareForDrag();
    };
    
    that = {
        
      /**
       * Sets the handler to receive callbacks.
       * The following methods are called, if they exist:
       * - prepareForDrag(that): initial setup on first mouse click
       * - prepareForDrop(that): the mouse button was released. This callback
       *   allows the handler to set the target coordinates to which the ghost should glide to.
       */
      setHandler: function(h) {
        handler = h;
      },
      
      /**
       * Returns X-position of mouse. Relative and inside the container. 
       */
      getMouseX: function() {
        var pos = mouseX - containerX;
        
        if (pos < 0) {
          pos = 0;
        } else if (pos > containerWidth) {
          pos = containerWidth;
        }

        return pos;
      },
      
      /**
       * Returns X-position of widget. Relative and inside the container. 
       */
      getWidgetX: function() {
        var pos = originX - (baseMouseX - mouseX);

        if (pos < 0) {
          pos = 0;
        } else if (pos > containerWidth) {
          pos = containerWidth;
        }

        return pos;
      },

      /**
       * Returns Y-position of widget. Relative and inside the container. 
       */
      getWidgetY: function() {
        var pos = originY - (baseMouseY - mouseY);

        if (pos < 0) {
          pos = 0;
        }

        return pos;
      },
      
      /**
       * Returns Y-position of mouse. Relative and inside the container. 
       */
      getMouseY: function() {
        var pos = mouseY - containerY;
        
        if (pos < 0) {
          pos = 0;
        } else if (pos >= containerHeight) {
          pos = containerHeight;
        }

        return pos;
      },
      
      /**
       * Initializes dragging.
       */
      init: function() {
        widgetWidth = widget.width(); // .front select will disappear after widget redesign
        
        if (window.ontouchstart !== undefined) {
          // for touch
          hammertime = dragArea.hammer({
            'transform_always_block': true,
            'transform_min_scale': 1,
            'drag_block_horizontal': true,
            'drag_block_vertical': true,
            'drag_min_distance': 0,
            'hold_timeout': 300,
            'prevent_mouseevents': true
          });
          
          hammertime.on('hold', function(ev) {
            prepareForTouchDrag(ev);
          });
        } else {
          // for non-touch
          dragArea.on('mousedown', function(ev) {
            prepareForMouseDrag(ev);
          });
        }
      }
    };
      
    return that;
  };

})();
