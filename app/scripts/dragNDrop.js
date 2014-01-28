/* global Hammer:true */

'use strict';

(function() {

  window.createDragNDrop = function(container, widget, dragArea, scrollArea, scale) {
    var
    that, // instance created by this factory
    DOCUMENT = jQuery(document), // jQuery Document object
    originX, originY, // position of widget before dragging
    initScroll, lastScroll,
    baseMouseX, baseMouseY, // position of mouse/touch before dragging
    mouseX, mouseY, // current position of mouse/touch
    containerX, containerY, containerWidth, containerHeight, // properties of container
    widgetWidth, // width of widget
    handler = {}, // callbacks from outside
    hammertime,
    SCROLL_SPACE = 20,
    SCROLL_FACTOR = 5,
    SCROLL_PROC,
    SCROLL_X = 0,
    SCROLL_Y = 0,


    getWidgetXInt = function() {
      var pos = originX + (lastScroll - initScroll) + (mouseX - baseMouseX);

      if (pos < 0) {
        pos = 0;
      } else if (pos + widgetWidth > containerWidth) {
        pos = containerWidth-widgetWidth;
      }

      return pos/scale.scale;
    },

    getWidgetYInt = function() {
      var pos = originY + (mouseY - baseMouseY);

      if (pos < 0) {
        pos = 0;
      }

      return pos/scale.scale;
    },

    doScroll = function(x,y) {
      if (SCROLL_X !== x || SCROLL_Y !== y) {
        SCROLL_X = x;
        SCROLL_Y = y;
        if (SCROLL_PROC) {
          console.log('clear');
          clearInterval(SCROLL_PROC);
          SCROLL_PROC = undefined;
        }
        if (x !== 0 || y !== 0) {
          SCROLL_PROC = setInterval(function() {
            window.scrollBy(SCROLL_FACTOR*x,SCROLL_FACTOR*y);
          }, 10);
        }
      }
    },

    /**
     * Moves the widget.
     */
    drag = function(/*ev*/) {
      var vpX = event.clientX,
          vpY = event.clientY,
          scrollX = 0,
          scrollY = 0;

      if (vpX >= 0 && vpX <= SCROLL_SPACE) {
        scrollX = -1;
      } else if (vpX >= ($(window).innerWidth() - SCROLL_SPACE) && vpX <= $(window).innerWidth()) {
        scrollX = 1;
      }
      if (vpY >= 0 && vpY <= SCROLL_SPACE) {
        scrollY = -1;
      } else if (vpY >= ($(window).innerHeight() - SCROLL_SPACE) && vpY <= $(window).innerHeight()) {
        scrollY = 1;
      }
      doScroll(scrollX, scrollY);
      widget.css({
        left: getWidgetXInt() + 'px',
        top: getWidgetYInt() + 'px'
      });
    },

    scrollHandler = function(ev) {
      lastScroll = scrollArea.scrollLeft();

      drag(ev);
    },
    
    /**
     * Touch move callback
     */
    touchDrag = function(ev) {
      mouseX = baseMouseX + ev.gesture.deltaX;
      mouseY = baseMouseY + ev.gesture.deltaY;
      
      drag(ev);
    },
    
    /**
     * Mouse move callback
     */
    mouseDrag = function(ev) {
      mouseX = ev.pageX;
      mouseY = ev.pageY;
      
      drag(ev);
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
        initScroll = lastScroll = scrollArea.scrollLeft();
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
       * Returns X-position of widget. Relative and inside the container. 
       */
      getWidgetX: function() {
        return getWidgetXInt();
      },

      /**
       * Returns Y-position of widget. Relative and inside the container. 
       */
      getWidgetY: function() {
        return getWidgetYInt();
      },
      
      /**
       * Initializes dragging.
       */
      init: function() {
        widgetWidth = widget.width();
        
        if (Hammer.HAS_TOUCHEVENTS) {
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
