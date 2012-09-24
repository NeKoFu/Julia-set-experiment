(function( self, undefined ) {
"use strict";
//////////////////////////////////////////////////////////////////
// Color Helper Object
var Color = function (r, g, b, a, p){
    var _me = this;

    if(r instanceof Color)
    {   // recopie
        this.r = r.r; 
        this.g = r.g; 
        this.b = r.b; 
        this.a = r.a;
        this.p = r.p;     
    }else
    {   // set composante
        this.r = (r == undefined || r > 255) ? 255 : r; 
        this.g = (g == undefined || g > 255) ? 255 : g;
        this.b = (b == undefined || b > 255) ? 255 : b;
        this.a = (a == undefined || a > 255) ? 255 : a;
        this.p = (p == undefined || p > 100) ? 100 : p;
    }

    this.add = function(c){
        // Add
        _me.r += c.r;
        _me.g += c.g; 
        _me.b += c.b; 
        _me.a += c.a;
        _me.p += c.p;
        // Clamp
        if(_me.r < 0) _me.r = 0; else if(_me.r > 255) _me.r = 255;
        if(_me.g < 0) _me.g = 0; else if(_me.g > 255) _me.g = 255;
        if(_me.b < 0) _me.b = 0; else if(_me.b > 255) _me.b = 255;
        if(_me.a < 0) _me.a = 0; else if(_me.a > 255) _me.a = 255;
        if(_me.p < 0) _me.p = 0; else if(_me.p > 100) _me.p = 100;

        //console.log("color : " + _me.r + ", " + _me.g + ", "  + _me.b + ", " + _me.p);
    };

    this.copy = function(c){
        _me.r = c.r;
        _me.g = c.g;
        _me.b = c.b;
        _me.a = c.a;
        _me.p = c.p;
    };
};

//////////////////////////////////////////////////////////////////
// Color Helper Object
var Palette = function(){
    var _palette = [];

    // Set palette colours
    this.create = function(size, colours){
        if(colours.length < 2){
            throw "Merci d'indiquer au moins deux couleurs pour construire une palette.";
        }

        var ip          = 0, 
            ic          = 0,
            offsetColor = 0,
            nbColor     = size,
            cStep       = new Color(),
            cCurrent    = new Color(),
            cPrevious   = new Color(),
            nbColorKey  = colours.length;

        for(;ic < nbColorKey; ic++){
            cCurrent = colours[ic];

            if(!(cCurrent instanceof Color)){
                throw "La liste de couleurs doit comporter uniquement des instance de la classe Color.";
            }

            if(ic < 1){
                cPrevious.copy(cCurrent);
                continue; // Skip the first loop
            }

            // Step between each color value
            nbColor     = offsetColor; // Recycle nbColor var temporarly
            offsetColor = parseInt(size / 100 * cCurrent.p);
            nbColor     = offsetColor - nbColor; // set number of step
            cStep       = new Color((cCurrent.r - cPrevious.r) / nbColor, (cCurrent.g - cPrevious.g) / nbColor, (cCurrent.b - cPrevious.b) / nbColor, (cCurrent.a - cPrevious.a) / nbColor);
            
            // Add new interpolated color
            for(; ip < offsetColor; ip++)
            {
                cPrevious.add(cStep);
                _palette.push(new Color(cPrevious));
            }

            cPrevious.copy(cCurrent);
        }
    }

    this.getColor = function(index){
        if(index >= _palette.length){
            index = _palette.length - 1;
        }else if(index < 0){
            index = 0;
        }

        return _palette[index];
    }

    this.toUint8Array = function(){
        var nbColor     = _palette.length,
            i           = 0,
            color       = null,
            offset      = 0,
            buffer      = new ArrayBuffer(nbColor * 4),
            buf8        = new Uint8Array(buffer);

        for(; i < nbColor; i++){
            color = _palette[i];
            buf8[offset++] = color.r;
            buf8[offset++] = color.g;
            buf8[offset++] = color.b;
            buf8[offset++] = color.a;
        }

        return buf8;
    }
}
Palette.Color = Color;

// Expose Complex to the global object
self.Palette = Palette;
})( self );