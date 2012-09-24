(function( window, undefined ) {
"use strict";

////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
// 
// Calc and draw Julia Fractal
//
var ColorDrawer = function (id){
    var _drawer = (id) ? new Canvas2DDrawer(id) : null;
    var _buffer = _drawer.getBackBuffer();
    var _width  = _drawer.getWidth();
    var _height = _drawer.getHeight();

    this.start = function(){

        var x, y;
        var r,g,b,a;
        r = 255;
        g = 255;
        b = 255;
        a = 255;
        for(y = 0; y < _height; y++){
            for(x = 0; x < _width; x++){
                _buffer[y * _width + x] = _drawer.pixel(r * (y / _height), g * (x / _width), b, a);
                    (r << 24) |
                    (g << 16) |
                    (b << 8)  |
                    a;
            }
        }

        draw();
    };

    var draw = function (){
        if(_buffer != null)
        {
            _drawer.setBackBuffer(_buffer);
        }    
    }
};

// Expose ColorDrawer to the global object
window.ColorDrawer = ColorDrawer;
})( window );