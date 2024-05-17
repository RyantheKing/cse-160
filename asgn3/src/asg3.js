let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    void main() {
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

let FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform int u_whichTexture;
    void main() {
        // gl_FragColor = u_FragColor;
        // gl_FragColor = vec4(v_UV, 1.0, 1.0);
        // gl_FragColor = texture2D(u_Sampler0, v_UV);
        if (u_whichTexture == -1) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else if (u_whichTexture == 2) {
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        } else if (u_whichTexture == 3) {
            gl_FragColor = texture2D(u_Sampler3, v_UV);
        }
        else if (u_whichTexture == 4) {
            gl_FragColor = texture2D(u_Sampler4, v_UV);
        } else if (u_whichTexture == 5) {
            gl_FragColor = texture2D(u_Sampler5, v_UV);
        } else {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        }
    }`;

let canvas, gl, a_Position, a_UV, u_FragColor, u_Size, u_ModelMatrix,
    u_GlobalRotateMatrix, u_ViewMatrix, u_ProjMatrix, u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_Sampler4, u_Sampler5, u_whichTexture;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();
    initTextures();

    gl.clearColor(0, 0, 0, 1.0);
    // renderAllShapes();
    requestAnimationFrame(tick);
}

function setupWebGL() {
    canvas = document.getElementById('asgn3');
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
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

    if (a_Position < 0 || a_UV < 0 || !u_FragColor || !u_ModelMatrix || !u_GlobalRotateMatrix || !u_ViewMatrix || !u_ProjMatrix || !u_whichTexture) {
        console.log('Failed to get the storage location of a_Position, a_UV, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, or u_ProjMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler0 || !u_Sampler1 || !u_Sampler2 || !u_Sampler3 || !u_Sampler4 || !u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }
}

let g_globalAngle = 0;
let g_globalVert = 0;

function addActionsForHtmlUI() {
    g_globalAngle = document.getElementById('cameraAngle').value;
    g_globalVert = document.getElementById('cameraVert').value;
    document.getElementById('cameraAngle').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    document.getElementById('cameraVert').addEventListener('mousemove', function() {g_globalVert = this.value; renderAllShapes();});
}

function initTextures() {
    let image0 = new Image();
    image0.onload = function() { loadTexture(u_Sampler0, image0, 0); };
    image0.src = '../resources/square.png';

    let image1 = new Image();
    image1.onload = function() { loadTexture(u_Sampler1, image1, 1); };
    image1.src = '../resources/wall.png';

    let image2= new Image();
    image2.onload = function() { loadTexture(u_Sampler2, image2, 2); };
    image2.src = '../resources/inside.png';

    let image3 = new Image();
    image3.onload = function() { loadTexture(u_Sampler3, image3, 3); };
    image3.src = '../resources/outside.png';

    let image4 = new Image();
    image4.onload = function() { loadTexture(u_Sampler4, image4, 4); };
    image4.src = '../resources/simple.png';

    let image5 = new Image();
    image5.onload = function() { loadTexture(u_Sampler5, image5, 5); };
    image5.src = '../resources/sky.png';

    return true;
}

function loadTexture(sampler, image, index) {
    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(sampler, index);
}

function convertCoordinatesEventToGL(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x, y]);
}

let g_startTime = performance.now()/1000.0;
let g_seconds = performance.now()/1000.0 - g_startTime; 

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    renderAllShapes();
    requestAnimationFrame(tick);
}

// vectors
let g_eye = new Vector3([0, 1, -20]);
let g_lookat = new Vector3([0, 1, 0]);
let g_up = new Vector3([0, 1, 0]);

let bf = [-1,9,9,9,9,-1]; // basic floor with roof
let cf = [2,9,9,9,9,-1]; // complex floor with roof
// let bc = [-1,9,9,9,9,2]; // basic floor with roof
// let cc = [2,9,9,9,9,2]; // complex floor with roof

let g_map = [
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1,-1,-1,-1,-1,-1],cf,cf,cf,cf,cf,cf,cf,cf,cf,bf,bf,cf,[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1,-1,2,2,2,-1],cf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1,-1,2,2,2,-1],cf,bf,bf,bf,bf,bf,bf,cf,[2,1,9,9,9,-1],cf,cf,[-1,-1,2,2,2,-1]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1,-1,-1,-1,-1,-1],[-1,4,-1,-1,-1,-1],[-1,9,4,-1,-1,-1],[-1,9,9,4,-1,-1],[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],[-1,9,9,4,-1,-1],[-1,9,4,-1,-1,-1],[-1,4,-1,-1,-1,-1],[-1,-1,2,2,2,-1],[-1,-1,0,0,-1,-1],[-1,-1,2,2,2,-1],[-1,-1,-1,-1,-1,-1]],
    [[-1,-1,-1,-1,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,4,-1,-1,-1,-1],[-1,9,4,-1,-1,-1],[-1,9,9,4,-1,-1],[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],[-1,9,9,4,-1,-1],[-1,9,4,-1,-1,-1],[-1,4,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,-1,-1,-1,-1,-1]],
    [[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1],[-1,1],[-1],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1],[-1],[-1],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
]

function drawMap() {
    let cube = new Cube();
    cube.color = [.1, .15, .15, 1];
    for (let i = 0; i < g_map.length; i++) {
        for (let j = 0; j < g_map[i].length; j++) {
            for (let k = 0; k < g_map[i][j].length; k++) {
                if (g_map[i][j][k] != 9) {
                    cube.textureNum = g_map[i][j][k];
                    cube.matrix.setTranslate(16-j, k, 16-i);
                    cube.render();
                }
            }
        }
    }
}

function renderAllShapes() {
    // projection matrix
    let projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width/canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMat.elements);

    // view matrix
    let viewMat = new Matrix4();
    viewMat.setLookAt(g_eye.x, g_eye.y, g_eye.z, g_lookat.x, g_lookat.y, g_lookat.z, g_up.x, g_up.y, g_up.z);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // global rotation matrix
    let globalRotMat = new Matrix4()
    globalRotMat.rotate(g_globalVert, 1, 0, 0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw floor
    let floor = new Cube();
    floor.textureNum = -1;
    floor.color = [.8, .7, .5, 1.0];
    floor.matrix.setTranslate(.5, .49, .5);
    floor.matrix.scale(32, 0, 32);
    floor.render();

    // draw sky
    let sky = new Cube();
    sky.textureNum = 5;
    sky.color = [.5, .7, .9, 1.0];
    sky.matrix.scale(100, 100, 100);
    sky.render();

    drawMap();

    // // draw cube
    // let cube1 = new Cube();
    // cube1.color = [1, 1, 1, 1];
    // cube1.textureNum = 2;
    // cube1.render();

    let startTime = performance.now();
    let duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.round(duration) + " fps: " + 1000/duration);
}

function sendTextToHTML(text) {
    let htmlElm = document.getElementById('out');
    if (!htmlElm) {
        console.log('Failed to get HTML element with id "out"');
        return;
    }
    htmlElm.innerHTML = text;
}