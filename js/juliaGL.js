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
var JuliaGLDrawer = function (id){
"use strict";

    if(!id){
        throw "L'Id d'une zone de dessin est obligatoire pour creer une instance de cet objet.";
    }
    var _me               = this,
        _drawer           = new Canvas3DDrawer(id),
        _width            = _drawer.getWidth(),
        _height           = _drawer.getHeight(),
        _iteration        = 200,
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

    // SetGL Parameters
    this.initGL = function(){
        var vs = "shaders/vs/basic.essl",
            fs = "shaders/fs/julia.essl";
        _drawer.loadShaders([vs, fs]);
        _drawer.setShaderProgram(0, 1);
        _drawer.addMesh(_drawer.getQuad());
        _drawer.setPalette(_palette.toUint8Array());
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
    }

    // Init and launch first rendering
    this.start = function(){
        var c0 = new Palette.Color(0, 0, 0, 255, 0),
            c1 = new Palette.Color(0, 0, 255, 255, 20),
            c2 = new Palette.Color(0, 255, 255, 255, 40),
            c3 = new Palette.Color(255, 255, 0, 255, 60),
            c4 = new Palette.Color(255, 0, 0, 255, 80),
            c5 = new Palette.Color(0, 0, 0, 255, 100);
        _me.createPalette(1024, c0, c1, c2, c3, c4, c5);
        _me.initGL();
        _me.draw();
    };

    // Rendering fractal
    this.draw = function (a, b){

        if(_animateFlag){
            _me.animate();
        }

        if(a != undefined && b != undefined){
            _c = new Complex(a, b);
        }

        // Redraw only if constant changed
        if(!_previousConstant.isEquals(_c)){
            _previousConstant.copy(_c);

            _drawer.setUniformFloat('uConst', _c.a, _c.b);
            _drawer.setUniformInteger('uMaxIter', _iteration);
            _drawer.draw();

            // Call user functions
            _me.notify(_c);    
        }

        requestAnimFrame(function (){_me.draw();});
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

// Expose JuliaGLDrawer to the global object
window.JuliaGLDrawer = JuliaGLDrawer;
})( window );