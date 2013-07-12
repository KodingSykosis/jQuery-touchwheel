(function ($) {
    var mkObj = function (key, value) {
        var obj = {};
        obj[key] = value;
        return obj;
    }
    
    var isSurfaceTablet = 'onmsgesturechange' in window && navigator.msPointerEnabled;    //Only works if using IE10+
    var toFix = ['touchstart', 'mspointerdown', 'touchmove', 'mspointermove', 'touchend', 'onmspointerup'];
    var touch = {
        start: mkObj('onmspointerdown' in document ? 'mspointerdown' : 'touchstart', startHandler),
        move: mkObj('onmspointerdown' in document ? 'mspointermove' : 'touchmove', moveHandler),
        end: mkObj('onmspointerdown' in document ? 'mspointerup' : 'touchend', endHandler)
    };
    
    var touchStart;

    if ($.event.fixHooks) {
        for (var i = toFix.length; i;) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }

    var eventHelper = {
        setup: function (events, context) {
            context = context || this;
            
            for (var name in events) {
                if (context.addEventListener) {
                    context.addEventListener(name, events[name], false);
                } else {
                    context['on' + name] = events[name];
                }
            }
        },

        teardown: function (events, context) {
            context = context || this;

            for (var name in events) {
                if (context.removeEventListener) {
                    context.removeEventListener(name, events[name], false);
                } else {
                    context['on' + name] = null;
                }
            }
        }
    };

    $.event.special.touchwheel = {
        setup: function () {
            eventHelper.setup(touch.start, this);
        },

        teardown: function () {
            eventHelper.teardown(touch.start, this);
        }
    };
    
    function startHandler(event) {
        if (event.pointerType === 'touch' || (event.touches && event.touches.length === 1)) {
            console.log('Touch Start Fired');

            event.preventDefault();
            touchStart = {
                deltaX: event.pageX,
                deltaY: event.pageY
            };

            eventHelper.setup(touch.move, this);
            eventHelper.setup(touch.end, this);
        }
    }

    function moveHandler(event) {
        event.preventDefault();
        
        var orgEvent = event.touches ? event.touches[0] : event;
        var dragEvent = $.event.fix(orgEvent);
        
        $.extend(dragEvent, {
            deltaX: (touchStart.deltaX - orgEvent.pageX),
            deltaY: (touchStart.deltaY - orgEvent.pageY),
            type: 'touchwheel',
            isSurfaceTablet: isSurfaceTablet,
            touchScroll: true
        });
        
        touchStart.deltaX = orgEvent.pageX;
        touchStart.deltaY = orgEvent.pageY;
        
        return ($.event.dispatch || $.event.handle).call(this, dragEvent);
    }
    
    function endHandler() {
        eventHelper.teardown(touch.move, this);
        eventHelper.teardown(touch.end, this);
    }
})(jQuery);