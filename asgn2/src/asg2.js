let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    gl.clearColor(0.15, 0.3, 0.4, 1.0);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

function setupWebGL() {
    canvas = document.getElementById('asgn2');
    gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    if (!gl) {  
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }


    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (u_Size < 0) {
    //     console.log('Failed to get the storage location of u_Size');
    //     return;
    // }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    let identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_globalAngle = 0;
let g_globalVert = 0;
let g_tailAngle = 0;
let g_tailHoriz = 0;
let g_headAngle = 0;
let g_mandibleAngle = 0;
let animated = false;

function addActionsForHtmlUI() {
    animated = document.getElementById('animated').checked;
    g_globalAngle = document.getElementById('cameraAngle').value;
    g_globalVert = document.getElementById('cameraVert').value;
    g_tailAngle = document.getElementById('tailVert').value;
    g_tailHoriz = document.getElementById('tailHor').value;
    g_headAngle = document.getElementById('headRotation').value;
    g_mandibleAngle = document.getElementById('mandibleGrab').value;
    document.getElementById('animated').addEventListener('click', function() {animated = this.checked;});
    document.getElementById('cameraAngle').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById('cameraVert').addEventListener('mousemove', function() {g_globalVert = this.value; renderAllShapes();});
    document.getElementById('tailVert').addEventListener('mousemove', function() {g_tailAngle = this.value; renderAllShapes();});
    document.getElementById('tailHor').addEventListener('mousemove', function() {g_tailHoriz = this.value; renderAllShapes();});
    document.getElementById('headRotation').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes();});
    document.getElementById('mandibleGrab').addEventListener('mousemove', function() {g_mandibleAngle = this.value; renderAllShapes();});
}

function convertCoordinatesEventToGL(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

let g_startTime = performance.now()/1000.0
let g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    renderAllShapes();
    requestAnimationFrame(tick);
}

function renderAllShapes() {
    let startTime = performance.now();
    if (animated) {
        g_mandibleAngle = Math.sin(g_seconds*5)*45/2+15/2;
        g_headAngle = Math.sin(g_seconds*2)*30;
        g_tailAngle = Math.sin(g_seconds*2)*20;
        g_tailHoriz = Math.sin(g_seconds)*10;
    }
    
    let globalRotMat = new Matrix4()
    // globalRotMat.translate(0, -0.5, 0);
    globalRotMat.rotate(g_globalVert-180, 1, 0, 0);
    globalRotMat.rotate(g_globalAngle-240, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // drawTriangle3D([-1.0, 0.0, 0.0,  -0.5, -1.0, 0.0,  0.0, 0.0, 0.0]);

    // let cube1 = new Cube();
    // cube1.color = [.5, .75, .7, 1.0];
    // cube1.matrix.translate(0, 0, 0.0);
    // cube1.matrix.scale(1, 1, 1);
    // cube1.render();

    // draw body
    let body = new Cylinder();
    body.color = [.45, .75, .75, 1];
    body.matrix.setTranslate(-.3, 0, 0);
    body.matrix.rotate(90, 0, 1, 0);
    body.matrix.scale(.2, .2, 0.5);
    body.render();

    // draw head (cube)
    let head = new Cube();
    head.color = [.6, .8, .9, 1];
    head.matrix.setTranslate(-.58, 0, 0);
    head.matrix.rotate(45, 0, 1, 0);
    head.matrix.scale(.11, .22, .11);
    head.matrix.translate(.5, 0, .5);
    head.matrix.rotate(g_headAngle, 0, 1, 0);
    head.matrix.translate(-.5, 0, -.5);
    let headCoords = new Matrix4(head.matrix);
    head.render();

    //mandibles
    let mandible1 = new Cylinder();
    mandible1.color = [.6, .2, 0, 1];
    mandible1.matrix = new Matrix4(headCoords);
    mandible1.matrix.translate(0.8, -0.1, -1.3);
    mandible1.matrix.rotate(-30, 0, 1, 0);
    mandible1.matrix.translate(0, 0, 1);
    mandible1.matrix.rotate(g_mandibleAngle, 0, 1, 0);
    mandible1.matrix.rotate(5, 1, 0, 0);
    mandible1.matrix.translate(0, 0, -1);
    let mandible1b = new Cylinder();
    mandible1b.matrix = new Matrix4(mandible1.matrix);
    mandible1.matrix.scale(.4, .16, 2);
    mandible1.render();
    mandible1b.color = [.1, .2, .3, 1];
    mandible1b.matrix.translate(-.6, -.02, -.30);
    mandible1b.matrix.rotate(2, 1, 0, 0);
    mandible1b.matrix.rotate(135, 0, 1, 0);
    mandible1b.matrix.scale(.4, .16, 2);
    mandible1b.render();


    let mandible2 = new Cylinder();
    mandible2.color = [.6, .2, 0, 1];
    mandible2.matrix = new Matrix4(headCoords);
    mandible2.matrix.translate(0.8, -0.3, -1.3);
    mandible2.matrix.rotate(-30, 0, 1, 0);
    mandible2.matrix.translate(0, 0, 1);
    mandible2.matrix.rotate(g_mandibleAngle, 0, 1, 0);
    mandible2.matrix.rotate(-5, 1, 0, 0);
    mandible2.matrix.translate(0, 0, -1);
    let mandible2b = new Cylinder();
    mandible2b.matrix = new Matrix4(mandible2.matrix);
    mandible2.matrix.scale(.4, .16, 2);
    mandible2.render();
    mandible2b.color = [.1, .2, .3, 1];
    mandible2b.matrix.translate(-.6, .02, -.30);
    mandible2b.matrix.rotate(-2, 1, 0, 0);
    mandible2b.matrix.rotate(135, 0, 1, 0);
    mandible2b.matrix.scale(.4, .16, 2);
    mandible2b.render();

    let mandible3 = new Cylinder();
    mandible3.color = [.6, .2, 0, 1];
    mandible3.matrix = new Matrix4(headCoords);
    mandible3.matrix.translate(-1.3, -0.1, 0.8);
    mandible3.matrix.rotate(120, 0, 1, 0);
    mandible3.matrix.rotate(180, 0, 0, 1);
    mandible3.matrix.translate(0, 0, 1);
    mandible3.matrix.rotate(g_mandibleAngle, 0, 1, 0);
    mandible3.matrix.rotate(-5, 1, 0, 0);
    mandible3.matrix.translate(0, 0, -1);
    let mandible3b = new Cylinder();
    mandible3b.matrix = new Matrix4(mandible3.matrix);
    mandible3.matrix.scale(.4, .16, 2);
    mandible3.render();
    mandible3b.color = [.1, .2, .3, 1];
    mandible3b.matrix.translate(-.6, .02, -.3);
    mandible3b.matrix.rotate(-2, 1, 0, 0);
    mandible3b.matrix.rotate(135, 0, 1, 0);
    mandible3b.matrix.scale(.4, .16, 2);
    mandible3b.render();

    let mandible4 = new Cylinder();
    mandible4.color = [.6, .2, 0, 1];
    mandible4.matrix = new Matrix4(headCoords);
    mandible4.matrix.translate(-1.3, -0.3, 0.8);
    mandible4.matrix.rotate(120, 0, 1, 0);
    mandible4.matrix.rotate(180, 0, 0, 1);
    mandible4.matrix.translate(0, 0, 1);
    mandible4.matrix.rotate(g_mandibleAngle, 0, 1, 0);
    mandible4.matrix.rotate(5, 1, 0, 0);
    mandible4.matrix.translate(0, 0, -1);
    let mandible4b = new Cylinder();
    mandible4b.matrix = new Matrix4(mandible4.matrix);
    mandible4.matrix.scale(.4, .16, 2);
    mandible4.render();
    mandible4b.color = [.1, .2, .3, 1];
    mandible4b.matrix.translate(-.6, -.02, -.3);
    mandible4b.matrix.rotate(2, 1, 0, 0);
    mandible4b.matrix.rotate(135, 0, 1, 0);
    mandible4b.matrix.scale(.4, .16, 2);
    mandible4b.render();

    // draw eyes (cylinder)
    let eye1 = new Cylinder();
    eye1.color = [0, 0.1, 0, 1];
    eye1.matrix = new Matrix4(headCoords);
    eye1.matrix.translate(0.2, 0.35, -0.01);
    eye1.matrix.scale(.4, .16, 1);
    eye1.render();

    let eye2 = new Cylinder();
    eye2.color = [0, 0.1, 0, 1];
    eye2.matrix = new Matrix4(headCoords);
    eye2.matrix.translate(-0.01, 0.35, 0.2);
    eye2.matrix.rotate(90, 0, 1, 0);
    eye2.matrix.scale(.4, .16, 1);
    eye2.render();

    let eye3 = new Cylinder();
    eye3.color = [0, 0.1, 0, 1];
    eye3.matrix = new Matrix4(headCoords);
    eye3.matrix.translate(-0.1, .16, -0.01);
    eye3.matrix.scale(.25, .10, 1);
    eye3.render();

    let eye4 = new Cylinder();
    eye4.color = [0, 0.1, 0, 1];
    eye4.matrix = new Matrix4(headCoords);
    eye4.matrix.translate(-0.01, .16, -0.1);
    eye4.matrix.rotate(90, 0, 1, 0);
    eye4.matrix.scale(.25, .10, 1);
    eye4.render();

    // draw horn (cube)
    let horn = new Cube();
    horn.color = [.4, .1, 0, 1];
    horn.matrix = new Matrix4(headCoords);
    horn.matrix.translate(-.35, .7, -.35);
    horn.matrix.scale(.4, .64, .4);
    horn.render();

    // draw tail
    let tail = new Cylinder();
    let scale = [.15, .15, 0.6];
    tail.color = [.4, .65, .65, 1];
    tail.matrix.setTranslate(.2, 0, 0);
    tail.matrix.rotate(90, 0, 1, 0);
    tail.matrix.translate(0, 0, -scale[2]/2);
    tail.matrix.rotate(g_tailAngle, 1, 0, 0);
    tail.matrix.rotate(g_tailHoriz, 0, 1, 0);
    tail.matrix.translate(0, 0, scale[2]/2);
    let tailb = new Cylinder();
    tailb.matrix = new Matrix4(tail.matrix);
    tail.matrix.scale(scale[0], scale[1], scale[2]);
    tail.render();

    tailb.color = [.3, .60, .60, 1];
    tailb.matrix.translate(0, 0, .48);
    tailb.matrix.translate(0, 0, -scale[2]*.7/2);
    tailb.matrix.rotate(g_tailAngle, 1, 0, 0);
    tailb.matrix.rotate(g_tailHoriz, 0, 1, 0);
    tailb.matrix.translate(0, 0, scale[2]*.7/2);
    tailb.matrix.scale(scale[0]*.7, scale[1]*.7, scale[2]*.7);
    tailb.render();

    // let cube2 = new Cube();
    // cube2.color = [1,1,0,1]
    // cube2.matrix.translate(.7, 0, 0);
    // cube2.matrix.rotate(45, 0, 0, 1);
    // cube2.matrix.scale(0.25, .7, .5);
    // cube2.render();

    let duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.round(duration) + " fps: " + Math.round(1000/duration));
}

function sendTextToHTML(text) {
    let htmlElm = document.getElementById('out');
    if (!htmlElm) {
        console.log('Failed to get HTML element with id "out"');
        return;
    }
    htmlElm.innerHTML = text;
}