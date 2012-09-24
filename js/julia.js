////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////


(function( window, undefined ) {

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
var JuliaDrawer = function (id){
    if(!id){
        throw "L'Id d'une zone de dessin est obligatoire pour creer une instance de cet objet.";
    }
    var _me               = this,
        _drawer           = new Canvas2DDrawer(id),
        _buffer           = _drawer.getBackBuffer(),
        _width            = _drawer.getWidth(),
        _height           = _drawer.getHeight(),
        _maxIter          = 200,
        _minIter          = 50,
        _iteration        = _maxIter,
        _palette          = new Palette(),
        _c                = new Complex(-0.85, 0.2),
        _previousConstant = new Complex(1, 1);

    this.getConstant = function (){
        return _c;
    };

    this.setConstant = function (a, b){
        _c.a = a;
        _c.b = b;
    };

    var convertCoordinateToComplex = function (c, i, j){
        // (a + ib)
        c.a = i / _width * 3.6 - 1.8;
        c.b = j / _height * 3.6 - 1.8;
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
        _degA += 1/100;
        _degB += 1/1000;
        _me.setConstant(Math.cos(_degA), Math.sin(_degB));
    }
    
    this.setAnimate = function(flag){
        _degA        = Math.acos(_c.a);
        _degB        = Math.asin(_c.b);
        _animateFlag = flag;
        _iteration   = (_animateFlag) ? _minIter : _maxIter;
    }

    //////////////////////////////////////////////////////////////////
    // Compute and return color at point
    // u : coordinate in complex form
    // c : Julia constante in complex form
    var calc = function (u, c){
        var a    = u.a, 
            b    = u.b, 
            r    = 0,
            iter = 0;

        // iterate 
        while((r < 4) && iter < _iteration)
        {
            iter++;
            u.a = a;
            u.b = b;
            // u^2
            a = (u.a * u.a - u.b * u.b) + c.a;
            b = (u.a * u.b) * 2 - c.b;
            r =  a * a + b * b;    
        }
        
        r = (r > 4) ? iter * 4 + r : 0; // add r to keep a little nicely gradient
        // clamp
        r = (r < 256) ? ((r > 0) ? r : 0) : 255; 
        // return integer value;
        return (0.5 + r) | 0; 
    }

    // Init and launch first rendering
    this.start = function(){
        var c0 = new Palette.Color(0, 0, 0, 255, 0),
            c1 = new Palette.Color(0, 0, 255, 255, 20),
            c2 = new Palette.Color(0, 255, 255, 255, 40),
            c3 = new Palette.Color(255, 255, 0, 255, 60),
            c4 = new Palette.Color(255, 0, 0, 255, 80),
            c5 = new Palette.Color(0, 0, 0, 255, 100);
        _me.createPalette(256, c0, c1, c2, c3, c4, c5);
        _me.draw();
    };

    // Rendering fractal
    this.draw = function (a, b){

        requestAnimFrame(function (){_me.draw();});
        if(_animateFlag){
            _me.animate();
        }

        if(a != undefined && b != undefined){
            _c = new Complex(a, b);
        }

        // Redraw only if constant changed
        if(!_previousConstant.isEquals(_c)){
            _previousConstant.copy(_c);

            var x, y,
                u = new Complex(),
                color;

            // Loop for each pixel
            for(y = 0; y < _height; y++){
                for(x = 0; x < _width; x++){
                    // Convert point coordinate in complex number
                    convertCoordinateToComplex(u, x, y);
                    // get color index from Julia mathematical set
                    level = calc(u, _c);
                    // get rgba color from palette
                    color = _palette.getColor(level);
                    // set pixel in backbuffer
                    _buffer[y * _width + x] = _drawer.pixel(color.r, color.g, color.b, color.a);
                }
            }

            if(_buffer != null)
            {
                // send pixel buffer to screen
                _drawer.setBackBuffer(_buffer);
            }

            // Call user functions
            _me.notify(_c);    
        }
    };

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
window.JuliaDrawer = JuliaDrawer;
})( window );