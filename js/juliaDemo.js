(function (window, undefined) {
"use strict";

////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
// 
// Set Julia Fractal Demo
//
window.getDemoContext = function () {
    var demoCtx,
        canvaName = "c01";

    if (window.JuliaWrkDrawer) {
        // 2D Canvas with WebWorker Context
        demoCtx = new JuliaWrkDrawer(canvaName);
    } else if (window.JuliaDrawer) {
        // 2D Canvas Context
        demoCtx = new JuliaDrawer(canvaName);
    } else if (window.JuliaGLDrawer) {
        // 3D WebGL Context
        demoCtx = new JuliaGLDrawer(canvaName);
    } else {
        throw "Missing includes to initialize demo.";
    }
    return demoCtx;
}

window.onload = function () {
    var _demo        = this.getDemoContext(),
        _btAnimation = document.getElementById('btAnimation');

    _btAnimation.onclick = function() {
        if (this.className == 'btonoff on') {
            this.className = 'btonoff off';
            this.innerHTML = 'OFF';    
            _demo.setAnimate(false);
        } else {
            this.className = 'btonoff on';
            this.innerHTML = 'ON';
            _demo.setAnimate(true);
        }
    };
    _btAnimation.onclick();

    var _constAValue = document.getElementById('constAValue'),
        _constBValue = document.getElementById('constBValue'),
        _constA      = document.getElementById('constA'),
        _constB      = document.getElementById('constB'),
        _chrono      = document.getElementById('chrono'),
        _chronoPass  = 0,
        _deltaTime   = 0,
        _drawTicks   = 0;
        
    _demo.subscribe(function(a, b) {
        _constAValue.innerHTML = a.toFixed(3);
        _constBValue.innerHTML = b.toFixed(3);
        _constA.value = a * 1000;
        _constB.value = b * 1000;
    });

    _demo.subscribe(function() {
        if (_chronoPass++ > 10) {
            var d     = new Date(),
                milli = d.valueOf();

            _deltaTime        = (milli - _drawTicks) / _chronoPass;
            _chrono.innerHTML = Math.round(1000 / _deltaTime, 2) + " fps";
            _drawTicks        = milli;
            _chronoPass       = 0;
        }
    });

    _constA.onchange = _constB.onchange = function () {
        _demo.setConstant(_constA.value / 1000, _constB.value / 1000);
    };
    _demo.start();
};

})(window);