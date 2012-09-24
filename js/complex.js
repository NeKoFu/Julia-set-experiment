(function( self, undefined ) {
"use strict";

    //////////////////////////////////////////////////////////////////
    // Complex Number Object
    var Complex = function (a, b){ 
        var _me = this;

        this.a = (a != undefined) ? a : 0; 
        this.b = (b != undefined) ? b : 0;

        this.isEquals = function(c){
            return (c.a == _me.a && c.b == _me.b);
        };

        this.copy = function(c){
            _me.a = c.a;
            _me.b = c.b;
        };
    };

// Expose Complex to the global object
self.Complex = Complex;
})( self );