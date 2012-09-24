////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////


(function( window, undefined ) {
"use strict";
    // multiplateform requestAnimationFrame
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
// 
// Calc and draw Julia Fractal
//
var JuliaWrkDrawer = function (id){
"use strict";

    if(!id){
        throw "L'Id d'une zone de dessin est obligatoire pour creer une instance de cet objet.";
    }
    var _me             = this,
        _recalc         = true,
        _drawer         = new Canvas2DDrawer(id),
        _buffer         = _drawer.getBackBuffer(),
        _width          = _drawer.getWidth(),
        _height         = _drawer.getHeight(),
        _maxIter        = 200,
        _minIter        = 50,
        _iteration      = _maxIter,
        _palette        = new Palette(),
        _nbWorkers      = 4,
        _jobs           = [],
        _jobsInProgress = 0,
        _c              = new Complex(-0.85, 0.2);

    this.getConstant = function (){
        return _c;
    };

    this.setConstant = function (a, b){
        _c.a    = a;
        _c.b    = b;
        _recalc = true;
        _me.process();
    };
    

    // Set palette colours
    this.createPalette = function(size, c1, c2, c3){
        var i       = 1,
            colours = [],
            len     = arguments.length;
        for(; i < len; ++i){
            colours.push(arguments[i]);
        }
        _palette.create(size, colours);
    }

    //////////////////////////////////////////////////////////////////
    // Slowly change constant number of the Julia fractal set
    var _degA        = 0,
        _degB        = 0,
        _animateFlag = false;
    this.animate = function(){
        if(_animateFlag){
            _degA += 1/100;
            _degB += 1/1000;
            _me.setConstant(Math.cos(_degA), Math.sin(_degB));
        }else{
            setTimeout(function(){_me.animate();}, 100);
        }
    }
    
    this.setAnimate = function(flag){
        _degA        = Math.acos(_c.a);
        _degB        = Math.asin(_c.b);
        _animateFlag = flag;
        _iteration   = (_animateFlag) ? _minIter : _maxIter;
    }

    // Init and launch first rendering
    this.start = function(){
        var i  = 0,
            c0 = new Palette.Color(0, 0, 0, 255, 0),
            c1 = new Palette.Color(0, 0, 255, 255, 20),
            c2 = new Palette.Color(0, 255, 255, 255, 40),
            c3 = new Palette.Color(255, 255, 0, 255, 60),
            c4 = new Palette.Color(255, 0, 0, 255, 80),
            c5 = new Palette.Color(0, 0, 0, 255, 100);
        _me.createPalette(256, c0, c1, c2, c3, c4, c5);

        // Prepare workers
        for(i = 0; i < _nbWorkers; i++)
        {
            _jobs[i] = {'worker' : new Worker('js/juliaWrk.js'), 'status' : 0, 'params' : null};
            _jobs[i].worker.addEventListener('message', function(e) {
                _me.jobHandler(e);
            }, false);
        }

        // Launch workers processing
        _me.process();
    };

    // Rendering fractal
    this.draw = function (){
        if(_buffer != null)
        {
            // send pixel buffer to screen
            _drawer.setBackBuffer(_buffer);
            _me.animate();
        }
    };

    this.invalidate = function(){
        _me.process();
        requestAnimFrame(function (){_me.draw();});
    }

    // Workers Queue Manager
    this.process = function(a, b){

        if(_jobsInProgress < 1)
        {
            _buffer = _drawer.getBackBuffer();
            if(a != undefined && b != undefined){
                _c = new Complex(a, b);
            }

            // Redraw only if constant changed
            if(_recalc && _jobsInProgress < 1){
                _recalc = false;
                var x1, y1, x2, y2,
                    zoneWidth   = _width / _nbWorkers * 2,
                    zoneHeight  = _height / 2,
                    wid         = 0;

                x1 = 0;
                y1 = 0;
                x2 = 0;
                y2 = zoneHeight;
                // give a job for each workers
                for(wid = 0; wid < _nbWorkers; wid++)
                {
                    _jobs[wid].worker.status = 0;

                    // Horizontal step
                    if(x2 < _width){
                        x1 = x2;
                        x2 += zoneWidth;
                    }else 
                    {
                        x1 = 0;
                        x2 = zoneWidth;

                        // Vertical step
                        if(y2 < _height){
                            y1 = y2;
                            y2 += zoneHeight;
                        }else 
                        {
                            y1 = 0;
                            y2 = zoneHeight;
                        }
                    }

                    _jobs[wid].params = {
                        'wid'    : wid,
                        'x1'     : x1,
                        'y1'     : y1,
                        'x2'     : x2,
                        'y2'     : y2,
                        'c'      : {'a' : _c.a, 'b' : _c.b},
                        'iter'   : _iteration,
                        'width'  : _width,
                        'height' : _height
                    };

                    _jobs[wid].worker.postMessage(_jobs[wid].params);
                    _jobsInProgress++;
                }
            }
        }
    }

    // Callback launched on workers messages
    this.jobHandler = function(e){

        var data      = new Uint8ClampedArray(e.data);
        if(data != undefined)
        {
            var wid     = data[0],
                params  = _jobs[wid].params,
                x,
                y,
                w       = params.x2 - params.x1,
                h       = params.y2 - params.y1,
                color;

            _jobs[wid].worker.status = 1;
            _jobsInProgress--;

            // Loop for each pixel
            for(y = 0; y < h; y++){
                for(x = 0; x < w; x++){
                    // get rgba color from palette
                    color = _palette.getColor(data[1 + y * w + x]);
                    // set pixel in backbuffer
                    _buffer[(params.y1 + y) * params.width + (params.x1 + x)] = _drawer.pixel(color.r, color.g, color.b, color.a);
                }
            }

            if(_jobsInProgress < 1)
            {
                // Draw new buffer content
                _me.invalidate();

                // Call user functions
                _me.notify(_c);
            }
        }
    }

    //////////////////////////////////////////////////////////////////
    // Subscribe to be called when constant value change
    var _subscriberList = [];
    this.subscribe = function(callback){
        _subscriberList.push(callback);
    }

    // Call subscriber when constant value change
    this.notify = function(c){
        var id = _subscriberList.length; 
        while(id){
            id -= 1;
            _subscriberList[id](c.a, c.b);
        }
    }
};

// Expose JuliaDrawer to the global object
window.JuliaWrkDrawer = JuliaWrkDrawer;
})( window );