////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
importScripts('complex.js');
"use strict";

var _buffer,
    _buf8;

//////////////////////////////////////////////////////////////////
// Compute and return level at a specific point
// u : coordinate in complex form
// c : Julia constante in complex form
var calc = function (u, c, maxIter){
    var a = u.a, 
        b = u.b, 
        r = 0,
        iter = 0;

    // iterate 
    while((r < 4) && iter < maxIter)
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
    return 0.5 + r;
}

// Adapt point coordinate into complex number
var convertCoordinateToComplex = function (c, i, j, width, height){
    // (a + ib)
    c.a = i / width * 3.6 - 1.8;
    c.b = j / height * 3.6 - 1.8;
}

// Processing on message event
self.addEventListener('message', function(e) {

    //self.postMessage = self.webkitPostMessage || self.postMessage;
      var data = e.data,
          x, y, u, v, level,
          w        = data.x2 - data.x1,
          h        = data.y2 - data.y1,
          pc       = new Complex(),
          cc       = new Complex(data.c.a, data.c.b);

      _buffer  = new ArrayBuffer(w * h + 1);
      _buf8    = new Uint8Array(_buffer);
      _buf8[0] = data.wid; // First word, worker id

    // Loop for each pixel
    for(v = 0, y = data.y1; y < data.y2; v++, y++){
        for(u = 0, x = data.x1; x < data.x2; u++, x++){
            // Convert point coordinate in complex number
            convertCoordinateToComplex(pc, x, y, data.width, data.height);
            // get color index from Julia mathematical set
            level = calc(pc, cc, data.iter);
            // set pixel in backbuffer
            _buf8[v * w + u + 1] = level;
        }
    }

      self.webkitPostMessage(_buffer, [_buffer]);

}, false);
