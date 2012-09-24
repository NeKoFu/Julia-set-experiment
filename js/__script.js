(
////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Différentes Classes de Define
 *
 *
 */
function RenderableObjectType()
{
    var NULL        = 0;
    var RECTANGLE   = 1;
    var CIRCLE      = 2;
    var IMAGE       = 3;
}

////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Classe object de ma scene
 *
 *
 */
function SceneObject()
{
    var _me        = this;
    var _parent    = null;
    this.setParent = function(p){ _me._parent = p;} // Attention, cette fonction doit être utilisé uniquement par une instance de Canvas2DScene 
    this.getParent = function(){ return _me._parent;}
    
    // Visual parameters
    var _colorStyle = "rgba(200,0,200,0)";
    this.setColorStyle = function(rgba){ _me._colorStyle = rgba;}
    this.getColorStyle = function(){ return _me._colorStyle;}
    
    var _type = RenderableObjectType.NULL;
    this.setType = function(t){ _me._type = t;}
    this.getType = function(){ return _me._type;}
    
    var _image = null;
    this.setImage = function(i){ _me._image = i;}
    this.getImage = function(){ return _me._image;}
    
    var _width = 100;
    var _height = 100;
    this.setSize = function(w, h){ _me._width = w; _me._height = h;}
    this.getHeight = function(){ return _me._height;}
    this.getWidth = function(){ return _me._width;}
    
    // Local Space parameters
    var _x = 0;
    var _y = 0;
    this.setPosition = function(x, y){ _me._x = x; _me._y = y;}
    this.getPositionX = function(){ return _me._x;}
    this.getPositionY = function(){ return _me._y;}
    
    var _angle = 0;
    this.setAngle = function(a){ _me._angle = a;}
    this.getAngle = function(){ return _me._angle;}
    
    var _scale = 1.0;
    this.setScale = function(sc){ _me._scale = sc;}
    this.getScale = function(){ return _me._scale;}
    
    var _zOrder = 0;
    this.setZOrder = function(z){ _me._zOrder = z;}
    this.getZOrder = function(){ return _me._zOrder;}
    
    // World Space parameters
    this.getWorldPositionX = function(){
        var x = _me._x;
        if(_me._parent != null)
        {
            var angle = _me._parent.getWorldAngle();
            x = (_me._parent.getWorldPositionX() + _me._x) * Math.cos(angle) - (_me._parent.getWorldPositionY() + _me._y) * Math.sin(angle);
        }     
        return  x;
    }
    this.getWorldPositionY = function(){
        var y = _me._y;
        if(_me._parent != null)
        {
            var angle = _me._parent.getWorldAngle();
            y = (_me._parent.getWorldPositionY() + _me._y) * Math.cos(angle) + (_me._parent.getWorldPositionX() + _me._x) * Math.sin(angle);
        }
        return  y;
    }
    
    this.getWorldAngle = function(){ return (_me._parent != null) ? _me._parent.getWorldAngle() + _me._angle : _me._angle;}
    
    this.getWorldScale = function(){ return (_me._parent != null) ? _me._parent.getWorldScale() * _me._scale : _me._scale;}
    
    this.getWorldZOrder = function(){ return (_me._parent != null) ? _me._parent.getWorldZOrder() + _me._zOrder : _me._zOrder;}
    
    // Childs list for legacy
    var _childrens = [];
    this getChildrensList = function(){ return _me._childrens;}
    this getNBChildrens = function(){ return _me._childrens.length;}
    this.addChild = function(o){
        _me._childrens.push(o);
        return _me._childrens.length;
    }
    this.removeLastChild = function(){
        _me._childrens.pop();
        return _me._childrens.length;
    }
    this.removeChildAtPos = function(index){
        _me._childrens.splice(index, 1);
        return _me._childrens.length;
    };
    this.getChildAtPos = function(index){
        return _me._childrens[index];
    };
}
 
////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Classe de gestion de ma scene
 *
 *
 */
function Canvas2DScene()
{
    var _me = this;
    var _objectList = []; 
    this getObjectsList = function(worldspace){ return (worldspace) ? _me.getWorldSpaceList() : _me._objectList;}
    this getNBObjects = function(){ return _me._objectList.length;}
    this.addObject = function(o){
        o.setParent(_me);
        _me._objectList.push(o);
        return _me._objectList.length;
    }
    this.removeLastObject = function(){
        var o = _me._objectList.pop();
        o.setParent(null);
        return _me._objectList.length;
    }
    this.removeObjectAtPos = function(index){
        var o = _me._objectList[index];
        o.setParent(null);
        _me._objectList.splice(index, 1);
        return _me._objectList.length;
    };
    this.getObjectAtPos = function(index){
        return _me._objectList[index];
    };
}
 
////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Classe object de ma scene
 *
 *
 */
function RenderableObject()
{
    
}

////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Classe de rendu dans un canvas
 *
 *
 */
function Canvas2DRenderer(id){
    var _canvas = (id) ? document.getElementById(id) : null;
    var _ctx = canvas.getContext("2d");
    var _scene = null;
    var _renderList = null;
    
    this.attachScene = function(scene){
        _scene = scene;
    }
    
    this.flatScene = function(){
        if(_scene == null){return false}
        _renderList = [];
        _renderList = _scene.getFlatList();
        for(_scene.list)
    }
    
    this.draw = function(){
        for(_scene.list)
        {
            _ctx.fillStyle = "rgb(200, 0, 0)";
            _ctx.fillRect(10, 10, 60, 60);
        }
    }
    
    var _renderList = null;
    var computeRenderListFromScene = function(){
        _me._renderList = [];
        for(var o in _objectList)
        {
            toWorldSpace(o);
        }
        return 
    }
    
    // integre une liste des objets avec leur position relative au monde
    var toWorldSpace = function(o){
        _me._worldSpaceList.push(o);
        if(o.getNBChildrens() > 0)
        {
            var childrens = o.getChildrensList();
            for(var child in childrens)
            {    
                toWorldSpace(child);
            }
        }
    }
}

//function Animate

window.onload = function(){
    var cd = new Canvas2DDrawer("c01");
    setTimeout(
    (
        function(cd){
            cd.draw();
        }
    )(cd)
}
)();