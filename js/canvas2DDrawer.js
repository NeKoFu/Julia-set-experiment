(function( window, undefined ) {
"use strict";

////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Classe de dessin dans un canvas
 *
 *
 */
var Canvas2DDrawer = function (id){
    var _canvas = (id) ? document.getElementById(id) : null,
        _ctx    = _canvas.getContext("2d");

    // expose context 
    this.context = _ctx;

    // width : the number of physical device pixels per row
    this.getWidth = function (){
        return _ctx.canvas.width;
    };

    // height : the number row
    this.getHeight = function (){
        return _ctx.canvas.height;
    };

    var _width     = this.getWidth(),
        _height    = this.getHeight(),
        _imageData = _ctx.getImageData(0, 0, _width, _height),
        _buf       = new ArrayBuffer(_imageData.data.length),
        _buf32     = new Uint32Array(_buf),
        _buf8      = new Uint8ClampedArray(_buf),
        _bufIndex  = 0;

    // Determine whether Uint32 is little- or big-endian.
    var isLittleEndian = function(){
        var data = new Uint32Array(_buf);
        data[0] = 0x08040201;
        var isLittleEndian = (_buf[3] === 0x01) ? false : true;
    };

    // get an Uint32Array representing pixel in rgba way
    this.getBackBuffer = function(){ 
        return _buf32;
    };

    // draw an ArrayBuffer
    this.setBackBuffer = function(buffer){
        _buf = buffer;
        //_bufIndex = (_bufIndex > 0) ? 0 : 1;
        if(Uint8ClampedArray != undefined && _imageData.data instanceof Uint8ClampedArray)
        {
            //console.log("setting internal Uint8ClampedArray");
            _imageData.data.set(_buf8);

        }else
        {
            //console.log("setting internal CanvasPixelArray");
            var x, y, c, i = 0;
            for(y = 0; y < _height; y++)
            {
                for(x = 0; x < _width; x++)
                {
                    for(c = 0; c < 4; c++, i++)
                    {
                        //i = (x + y * _width) * 4 + c;
                        _imageData.data[i] = _buf8[i];
                    }
                }
            }
        }
        //_bufIndex = (_bufIndex > 0) ? 0 : 1;
        _ctx.putImageData(_imageData, 0, 0);
    };

    // get a pixel color compatible with the device
    this.pixel = function (r, g, b, a){

        var c1,c2,c3,c4;
        if(isLittleEndian){
            c1 = a;
            c2 = b;
            c3 = g;
            c4 = r;
        }else{
            c1 = r;
            c2 = g;
            c3 = b;
            c4 = a;
        }
        return  (c1 << 24) |
                (c2 << 16) |
                (c3 << 8)  |
                c4;
    }

    // set a pixel color at position x, y
    this.setPixel = function (x, y, r, g, b, a){
        var x, y;
        return _buf32[y * _width + x] = this.pixel(r, g, b, a);
    }

    this.setStroke = function(colour, width){
        _ctx.strokeStyle = colour;
        _ctx.lineWidth = (width != undefined) ? width : 1;
    };

    this.drawLine = function(x1, y1, x2, y2){
        _ctx.moveTo(x1, y1);
        _ctx.lineTo(x2, y2);
        _ctx.stroke();
    };

    this.drawCircle = function(x, y, radius){
        _ctx.beginPath();
        _ctx.arc(x, y, radius, 0, (Math.PI / 180) * 360, false);
        _ctx.stroke();
        _ctx.closePath();
    };

    this.drawBezierCurve = function(x1, y1, x2, y2, ctrlX1, ctrlY1, ctrlX2, ctrlY2){
        _ctx.moveTo(x1, y1);
        _ctx.bezierCurveTo(ctrlX1, ctrlY1, ctrlX2, ctrlY2, x2, y2);
        _ctx.stroke();

        // indicator
        var pc = _ctx.strokeStyle;
        var pw = _ctx.lineWidth;
        this.setStroke("blue", 1);
        this.drawCircle(x1, y1, 3);
        this.drawCircle(x2, y2, 3);
        this.drawCircle(ctrlX1, ctrlY1, 3);
        this.drawCircle(ctrlX2, ctrlY2, 3);
        this.setStroke(pc, pw);
    };

};

// Expose canvas2DDrawer to the global object
window.Canvas2DDrawer = window.c2dr = Canvas2DDrawer;
})( window );