(function( window, undefined ) {
////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////

window.onload = function(){
    var cd = new Canvas2DDrawer("c01");
    cd.setStroke("red", 2);
    /*
    cd.drawLine(10,10,100,50);
    cd.drawLine(100,50,100,10);
    cd.drawLine(100,10,10,10);
    */

    var x1 = 0, y1 = 0, x2 = 300, y2 = 0;
    var offsetX = 10, offsetY = 100
    var q = (x2 - x1) / 2;

    cd.drawBezierCurve(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY, q + offsetX , y1 + offsetY - 100, x2 - q + offsetX, y2 + offsetY + 100);
}
})( window );