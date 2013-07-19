(function ($) {
    var mkObj = function(key, value) {
        var obj = {};
        obj[key] = value;
        return obj;
    };
    
    var toFix = ['touchstart', 'mspointerdown', 'touchmove', 'mspointermove', 'touchend', 'mspointerup'];
    var touch = {
        start: mkObj(navigator.msPointerEnabled ? 'mspointerdown' : 'touchstart', startHandler),
        move: mkObj(navigator.msPointerEnabled ? 'mspointermove' : 'touchmove', moveHandler),
        end: mkObj(navigator.msPointerEnabled ? 'mspointerup' : 'touchend', endHandler)
    };
    
    var touchStart;

    //if ($.event.fixHooks) {
    //    for (var i = toFix.length; i;) {
    //        $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
    //    }
    //}

    var eventHelper = {
        setup: function (events, context) {
            context = context || this;

            for (var name in events) {
                $(context).bind(name, events[name]);
                
                //if (context.addEventListener) {
                //    context.addEventListener(name, events[name], false);
                //} else {
                //    context['on' + name] = events[name];
                //}
            }
        },

        teardown: function (events, context) {
            context = context || this;

            for (var name in events) {
                $(context).unbind(name, events[name]);
                
                //if (context.removeEventListener) {
                //    context.removeEventListener(name, events[name], false);
                //} else {
                //    context['on' + name] = null;
                //}
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
    
    $.fn.extend({
        touchwheel: function (fn) {
            return fn ? this.bind("touchwheel", fn) : this.trigger("touchwheel");
        }
    });
    
    function startHandler(event) {
        if (event.type == (navigator.msPointerEnabled ? 'mspointerdown' : 'touchstart')) {
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
        
        var orgEvent = event.originalEvent.touches ? event.originalEvent.touches[0] : event.originalEvent;
        var dragEvent = $.event.fix(orgEvent);
        
        $.extend(dragEvent, {
            deltaX: (touchStart.deltaX - orgEvent.pageX) || 0,
            deltaY: (touchStart.deltaY - orgEvent.pageY) || 0,
            type: 'touchwheel',
            touchScroll: true
        });
        
        touchStart.deltaX = orgEvent.pageX;
        touchStart.deltaY = orgEvent.pageY;
        
        return ($.event.dispatch || $.event.handle).call(this, dragEvent);
    }
    
    function endHandler(event) {
        event.preventDefault();
        eventHelper.teardown(touch.move, this);
        eventHelper.teardown(touch.end, this);
    }
})(jQuery);