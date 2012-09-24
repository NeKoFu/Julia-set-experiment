(function( window, undefined ) {
"use strict";
////////////////////////////////////////////////////////////////////////////////
// =============================================================================
////////////////////////////////////////////////////////////////////////////////
/*
 *    Classe de dessin dans un context WebGL
 *    Need : gl-matrix-min.js
 *
 */
var Canvas3DDrawer = function (id, undefined) {

    // Internal list type with last function to Array object
    
    // -----------------------------------------------------
    // Internal List 
    var _me     = this,
        _pool   = { 'shaders':  [],
                    'vbo':      [],
                    'ibo':      [],
                    'cbo':      [],
                    'normals':  [],
                    'uv':       [],
                    'light':    [],
                    'textures': [],
                    lastOf:function (a) {
                        return (a instanceof Array) ? a[a.length - 1] : null;
                    }
                },
        _width,
        _height,
        _time       = 0,
        _deltatime  = 0,

    // Create context
        _canvas     = (id) ? document.getElementById(id) : null,
        _gl         = null;

    try{
        _gl         = _canvas.getContext("webgl") || _canvas.getContext("experimental-webgl");    
    }

    catch (e) {
        if(!_gl){
            alert("Unable to initialize WebGL. Your browser may not support it.");
        }
      }

      // Init matrix
      _gl.matrix = { projection  : mat4.create(),
                     view        : mat4.create()
                 };

      // -----------------------------------------------------
    // expose context 
    this.context = _gl;

    // -----------------------------------------------------
    // width : the number of physical device pixels per row
    this.getWidth = function () {
        return _canvas.width;
    }

    // height : the number row
    this.getHeight = function () {
        return _canvas.height;
    }

    // keep current size
    _width  = this.getWidth(),
    _height = this.getHeight();

    // -----------------------------------------------------
    // Init viewport to match canvas size
    _gl.viewport(0, 0, _width, _height);
    _gl.clearColor(0.0, 0.0, 0.0, 1.0);
    _gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );

    this.timeTicks = function(){
        if(_time)
        {
            _deltatime = new Date().getTime() - _time;
        }
        _time = new Date().getTime();
    }

    // -----------------------------------------------------
    // Shaders Loader
    this.loadShaders = function(shaders, callback) {
        // Derived from ANDREA GIAMMARCHI function
        // (C) WebReflection - Mit Style License
        // greetings to ANDREA GIAMMARCHI ;)
        function onreadystatechange() {
            var xhr = this,
                i   = xhr.i;
            if (xhr.readyState == 4) {
                var shaderType = shaders[i].slice(8, 10), // TODO get type without using shader name
                    shaderId   = _me.addShader(xhr.responseText, shaderType);
                !--length && typeof callback == "function" && callback({'id':shaderId, 'type':shaderType, 'name':shaders[i]});
            }
        }
        for (var shaders      = [].concat(shaders),
                 asynchronous = !!callback,
                 i            = shaders.length,
                 length       = i,
                 xhr;
                 i--;
        ) {
            (xhr = new XMLHttpRequest).i = i;
            xhr.open("get", shaders[i], asynchronous);
            if (asynchronous) {
                xhr.onreadystatechange = onreadystatechange;
            }
            xhr.send(null);
            onreadystatechange.call(xhr);
        }
        return shaders;
    }

    // set a new Shader
    // @param source a Shader source
    // @param type 'vs' for Vertex Shader and 'fs' for Fragment Shader
    // Return id of the shader
    this.addShader = function(source, type) {
        // Compil
        var id     = 0,
        shaderType = (type == "fs") ? _gl.FRAGMENT_SHADER : _gl.VERTEX_SHADER,
        shader     = _gl.createShader( shaderType );

        _gl.shaderSource(shader, source);
        _gl.compileShader(shader);

        if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS))
            throw _gl.getShaderInfoLog(shader);
        // Store
        _pool.shaders.push(shader);
        return _pool.shaders.length - 1;
    }

    // set a new Vertex Shader
    // @param source a Shader source
    // Return id of the shader
    this.addVShader = function(source) {
        return _me.addShader(shader, 'vs');
    }

    // set a new Fragment Shader
    // @param source a Shader source
    // Return id of the shader
    this.addFShader = function(source) {
        return _me.addShader(shader, 'fs');
    }

    // get a registred Shader
    // Return a compiled shader
    this.getShader = function(id) {
        return (id > -1 && id < _pool.shaders.length) ? _pool.shaders[id] : null;
    }

    // link and activate a shader program
    this.setShaderProgram = function(vsid, fsid) {
        var vs     = _me.getShader(vsid),
            fs     = _me.getShader(fsid);

        _gl.shader = {  program:  _gl.createProgram(),
                        uniforms: {},
                        attribs:  {}
                    };

        _gl.attachShader(_gl.shader.program, vs);
        _gl.attachShader(_gl.shader.program, fs);
        
        // Link shader program
        _gl.linkProgram(_gl.shader.program);

        if (!_gl.getProgramParameter(_gl.shader.program, _gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        // Activate program
        _gl.useProgram(_gl.shader.program);

        // Bind common parameters
        _me.bindUniformParameter('uTime');
        _me.bindUniformParameter('uMouse');
        _me.bindUniformParameter('uResolution');
        _me.bindUniformParameter('uBackbuffer');
        _me.bindUniformParameter('uSurfaceSize');

        // Enable Attribute
        _me.bindAttribParameter('aVertexPosition', 0);
          _gl.enableVertexAttribArray(_gl.shader.attribs['aVertexPosition']);
    }

    // Bind uniform shader variable
    this.bindUniformParameter = function (label) {
        if ( _gl.shader.uniforms === undefined ) {
            _gl.shader.uniforms = {};
        }
        if(_gl.shader.uniforms[label] === undefined)
        {
            _gl.shader.uniforms[label] = _gl.getUniformLocation(_gl.shader.program, label);
        }
    }

    // Bind attribute shader variable
    this.bindAttribParameter = function (label, index) {
        if ( _gl.shader.attribs === undefined ) {
            _gl.shader.attribs = {};
        }
        if(_gl.shader.attribs[label] === undefined)
        {
            _gl.bindAttribLocation(_gl.shader.program, index, label);
            _gl.shader.attribs[label] = _gl.getAttribLocation(_gl.shader.program, label);
        }
    }

    // Set an uniform integer parameter binded into shader
    this.setUniformInteger = function (name, v1, v2, v3, v4){
        if(_gl.shader.uniforms[name] === undefined)
        {
            _me.bindUniformParameter(name);
        }
        if(v4 !== undefined)
        {
            _gl.uniform4i( _gl.shader.uniforms[name], v1, v2, v3, v4 );    
        }else if(v3 !== undefined)
        {
            _gl.uniform3i( _gl.shader.uniforms[name], v1, v2, v3);    
        }else if(v2 !== undefined)
        {
            _gl.uniform2i( _gl.shader.uniforms[name], v1, v2);    
        }else if(v1 !== undefined)
        {
            _gl.uniform1i( _gl.shader.uniforms[name], v1);    
        }
    }

    // Set an uniform float parameter binded into shader
    this.setUniformFloat = function (name, v1, v2, v3, v4){
        if(_gl.shader.uniforms[name] === undefined)
        {
            _me.bindUniformParameter(name);
        }
        if(v4 !== undefined)
        {
            _gl.uniform4f( _gl.shader.uniforms[name], v1, v2, v3, v4 );    
        }else if(v3 !== undefined)
        {
            _gl.uniform3f( _gl.shader.uniforms[name], v1, v2, v3);    
        }else if(v2 !== undefined)
        {
            _gl.uniform2f( _gl.shader.uniforms[name], v1, v2);    
        }else if(v1 !== undefined)
        {
            _gl.uniform1f( _gl.shader.uniforms[name], v1);    
        }
    }

    // Set an uniform float matrix binded into shader
    this.setUniformMatrix = function (name, transpose, matrix){
        if(_gl.shader.uniforms[name] === undefined)
        {
            _me.bindUniformParameter(name);
        }
        if(matrix.length == 16)
        {
            _gl.uniformMatrix4fv( _gl.shader.uniforms[name], transpose, matrix);
        }else if(matrix.length == 9)
        {
            _gl.uniformMatrix3fv( _gl.shader.uniforms[name], transpose, matrix);
        }else if(matrix.length == 4)
        {
            _gl.uniformMatrix2fv( _gl.shader.uniforms[name], transpose, matrix);
        }
    }

    // -----------------------------------------------------
    // set a colours palette
    // use a 1D texture
    // @param palette The colours palette to push into the shaders
    this.setPalette = function(palette){
        _gl.palette = _gl.createTexture();
        _gl.bindTexture(_gl.TEXTURE_2D, _gl.palette);
        _gl.shader.program.paletteSamplerUniform = _gl.getUniformLocation(_gl.shader.program, "uPaletteSampler");
        _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, palette.length / 4, 1, 0, _gl.RGBA, _gl.UNSIGNED_BYTE, palette);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
        _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
        _gl.generateMipmap(_gl.TEXTURE_2D);

        _gl.bindTexture(_gl.TEXTURE_2D, null);
    } 

    // -----------------------------------------------------
    // set a new Light
    // @param position Vector with x, y, z position coordinate of the light 
    // @param intensity Float value of intensity of the light [0 to 1.0] 
    // @param color The color of the light in RGB
    // Return id of the light
    this.addLight = function(position, intensity, color) {
        var id = 0;
        // TODO ...

        return id;
    }

    // -----------------------------------------------------
    // set a new Normal list
    // @param normals The list of Normals vector 
    // Return id of the normals list
    this.addNormal = function(normals) {
        _pool.normals.push(_gl.createBuffer());
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _pool.lastOf(_pool.normals));
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(normals), _gl.STATIC_DRAW);
        return _pool.normals.length - 1;
    }

    // set a new UV Coordinate list
    // @param uv The list of uv textures coordinate 
    // Return id of the uv list
    this.addUV = function(uv) {
        _pool.uv.push(_gl.createBuffer());
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _pool.lastOf(_pool.uv));
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(uv), _gl.STATIC_DRAW);
        return _pool.uv.length - 1;
    }

    // -----------------------------------------------------
    // set a new Mesh
    // @param vertices The list of Vertex coordinate (Float32Array)
    // @param indexes (optional) The list of Indexes (Float32Array)
    // Return id of the mesh
    this.addMesh = function(vertices, indexes) {
        _pool.vbo.push(_gl.createBuffer());
        _gl.bindBuffer(_gl.ARRAY_BUFFER, _pool.lastOf(_pool.vbo));
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);

        if(indexes instanceof Array){
            _pool.ibo.push(_gl.createBuffer());
            _gl.bindBuffer(_gl.ARRAY_BUFFER, _pool.lastOf(_pool.ibo));
            _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(indexes), _gl.STATIC_DRAW);
        }

        return _pool.vbo.length - 1;
    }

    // -----------------------------------------------------
    // set the projection matrix 
    this.setProjectionMatrix = function (matrix) {
        _gl.matrix.projection = matrix;
    }

    // set the view matrix 
    this.setViewMatrix = function (matrix) {
        _gl.matrix.view = matrix;
    }

    // reset matrix view
    this.loadIdentity = function () {
        _me.setViewMatrix(mat4.identity());
    }

    // push projection and view matrix to the graphic card
    this.setMatrixUniforms = function () {
        
        var normalMatrix = mat3.create();
        _me.bindUniformParameter('uMatrixProjection');
        _me.bindUniformParameter('uMatrixView');
        _me.bindUniformParameter('uMatrixNormal');
        
        mat4.toInverseMat3(_gl.matrix.view, normalMatrix);
        mat3.transpose(normalMatrix);

        _gl.uniformMatrix4fv(_gl.shader.uniforms['uMatrixProjection'], false, _gl.matrix.projection);
        _gl.uniformMatrix4fv(_gl.shader.uniforms['uMatrixView'], false, _gl.matrix.view);
        _gl.uniformMatrix3fv(_gl.shader.uniforms['uMatrixNormal'], false, normalMatrix);
    }

    this.translateView = function(vec3){
        mat4.translate(_gl.matrix.view, vec3);
    }

    // -----------------------------------------------------
    // Draw method!
    var _frame = 0;
    this.draw = function() {
        _frame++;
        _me.timeTicks();
        //_gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //_gl.clear( _gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT );
        
        // Camera
        var w        = 1,
            h        = 1,
            nbMesh   = _pool.vbo.length,
            nbPoints = 0;
        _me.setProjectionMatrix(mat4.ortho (-w, w, -h, h, 0.1, 100.0));
        //_me.setProjectionMatrix(mat4.perspective (45, (_width * 1.)/_height, 0.1, 100.0));

        _me.loadIdentity();
        _me.translateView([-0.0, 0.0, -6.0]);

        // Global parameters
        _gl.uniform1f( _gl.shader.uniforms['uTime'], _frame / 10. );
        //_gl.uniform2f( _gl.shader.uniforms['uMouse'], parameters.mouseX, parameters.mouseY );
        _gl.uniform2f( _gl.shader.uniforms['uResolution'], _width, _height);
        //_gl.uniform1i( _gl.shader.uniforms['uBackbuffer'], 0 );
        //_gl.uniform2f( _gl.shader.uniforms['uSurfaceSize'], surface.width, surface.height );

        // Binding
        if(_gl.palette !== undefined)
        {
            _gl.bindTexture(_gl.TEXTURE_2D, _gl.palette);
        }
        for(var i = 0; i < nbMesh; i++)
        {
            // Set Vertex buffer to render
            _gl.bindBuffer(_gl.ARRAY_BUFFER, _pool.vbo[i]);
            _gl.vertexAttribPointer(_gl.shader.attribs['aVertexPosition'], 
                                    3,
                                    _gl.FLOAT,
                                    false,
                                    0,
                                    0);

            // Push Vertex Index buffer
            if(_pool.ibo[i] != undefined){
                _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_pool.ibo[i]), _gl.STATIC_DRAW);    
            }

            // Push Vertex Color Buffer
            if(_pool.cbo[i] != undefined){
                _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Float32Array(_pool.cbo[i]), _gl.STATIC_DRAW);    
            }

            _me.setMatrixUniforms();
            nbPoints = _gl.getBufferParameter(_gl.ARRAY_BUFFER, _gl.BUFFER_SIZE) / (12); // dimensions * sizeof(float) => 3 * 4 = 12
            _gl.drawArrays(_gl.TRIANGLE_STRIP, 0, nbPoints); 
        }
    }

    ////////////////////////////////////////////////////////////////////
    // Basic Mesh and Volume
    // -----------------------------------------------------
    // return a simple flat quad mesh
    this.getQuad = function () {
        return new Float32Array([ 1.,  1., 0.,        // 2------1
                                 -1.,  1., 0.,        // |      |
                                  1., -1., 0.,        // |      |
                                 -1., -1., 0. ]);     // 4------3
    }

    ////////////////////////////////////////////////////////////////////
    // Structure Helper
    this.vec2 = {'x':0, 'y':0};
};

// Expose canvas2DDrawer to the global object
window.Canvas3DDrawer = window.c3dr = Canvas3DDrawer;
})( window );