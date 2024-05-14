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
    renderAllShapes();
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
let g_tailAngle = 0;
let g_headAngle = 0;

function addActionsForHtmlUI() {
    g_globalAngle = document.getElementById('cameraAngle').value;
    g_tailAngle = document.getElementById('tailRotation').value;
    g_headAngle = document.getElementById('headRotation').value;
    document.getElementById('cameraAngle').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById('tailRotation').addEventListener('mousemove', function() {g_tailAngle = this.value; renderAllShapes();});
    document.getElementById('headRotation').addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes();});
}

function convertCoordinatesEventToGL(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

function renderAllShapes() {
    let startTime = performance.now();

    let globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
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
    head.color = [.6, .8, .8, 1];
    head.matrix.setTranslate(-.55, 0, 0);
    head.matrix.scale(.1, .25, .15);
    head.matrix.rotate(45, 0, 1, 0);
    head.matrix.translate(.5, 0, .5);
    head.matrix.rotate(g_headAngle, 0, 1, 0);
    head.matrix.translate(-.5, 0, -.5);
    let headCoords = new Matrix4(head.matrix);
    head.render();

    //mandibles
    let mandible1 = new Cylinder();
    mandible1.color = [.6, .2, 0, 1];
    mandible1.matrix = new Matrix4(headCoords);
    mandible1.matrix.translate(5, 0, 0);
    mandible1.matrix.scale(.2, .2, 1);
    mandible1.render();

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
    horn.matrix.translate(-.3, .7, -.34);

    horn.matrix.scale(.5, .64, .33);
    horn.render();

    // draw tail
    let tail = new Cylinder();
    let scale = [.15, .15, 0.7];
    tail.color = [.4, .65, .65, 1];
    tail.matrix.setTranslate(.25, 0, 0);
    tail.matrix.rotate(90, 0, 1, 0);
    tail.matrix.translate(0, 0, -scale[2]/2);
    tail.matrix.rotate(g_tailAngle, 1, 0, 0);
    tail.matrix.translate(0, 0, scale[2]/2);
    tail.matrix.scale(scale[0], scale[1], scale[2]);
    tail.render();

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