let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    // uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    void main() {
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
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

let canvas, gl, a_Position, a_UV, u_FragColor, u_Size, u_ModelMatrix, u_ViewMatrix, u_ProjMatrix, u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_Sampler4, u_Sampler5, u_whichTexture;
let dragging = false;
let prevx = 0;
let prevy = 0;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    document.onkeydown = keydown;

    initTextures();

    canvas.onmousedown = function(ev) {
        dragging = true;
        prevx = ev.clientX;
        prevy = ev.clientY;
    };

    canvas.onmouseup = function(ev) {
        dragging = false;
    };

    canvas.onmousemove = mousemove;

    gl.clearColor(0, 0, 0, 1.0);
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
    // u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

    if (a_Position < 0 || a_UV < 0 || !u_FragColor || !u_ModelMatrix || !u_ViewMatrix || !u_ProjMatrix || !u_whichTexture) {
        console.log('Failed to get the storage location of a_Position, a_UV, u_FragColor, u_ModelMatrix, u_ViewMatrix, or u_ProjMatrix');
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
let y_movement_enabled = true;

function addActionsForHtmlUI() {
    // g_globalAngle = document.getElementById('cameraAngle').value;
    // g_globalVert = document.getElementById('cameraVert').value;
    // document.getElementById('cameraAngle').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
    // document.getElementById('cameraVert').addEventListener('mousemove', function() {g_globalVert = this.value; renderAllShapes();});
    y_movement_enabled = document.getElementById('yMove').checked;
    document.getElementById('yMove').addEventListener('change', function() {y_movement_enabled = this.checked;});
    document.getElementById('resetY').addEventListener('click', function() {
        d = new Vector3([g_lookat.x - g_eye.x, 0, g_lookat.z - g_eye.z]);
        d.normalize();
        g_lookat.x = g_eye.x + d.x;
        g_lookat.y = g_eye.y;
        g_lookat.z = g_eye.z + d.z;
    });
}

let texturesToLoad = 6;

function initTextures() {
    let image0 = new Image();
    image0.onload = function() { loadTexture(u_Sampler0, image0, 0);};
    image0.src = '../resources/square.png';

    let image1 = new Image();
    image1.onload = function() { loadTexture(u_Sampler1, image1, 1);};
    image1.src = '../resources/wall.png';

    let image2= new Image();
    image2.onload = function() { loadTexture(u_Sampler2, image2, 2);};
    image2.src = '../resources/inside.png';

    let image3 = new Image();
    image3.onload = function() { loadTexture(u_Sampler3, image3, 3);};
    image3.src = '../resources/outside.png';

    let image4 = new Image();
    image4.onload = function() { loadTexture(u_Sampler4, image4, 4);};
    image4.src = '../resources/simple.png';

    let image5 = new Image();
    image5.onload = function() { loadTexture(u_Sampler5, image5, 5);};
    image5.src = '../resources/sky.png';

    return true;
}

function loadTexture(sampler, image, index) {
    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // mipmaps
    // gl.generateMipmap(gl.TEXTURE_2D);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(sampler, index);

    texturesToLoad--;
    if (texturesToLoad == 0) {
        renderAllShapes();
    }
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
    let begintimer = performance.now();
    g_seconds = begintimer/1000 - g_startTime;
    renderAllShapes();
    requestAnimationFrame(tick);
    let elapsed = performance.now() - begintimer
    sendTextToHTML( "ms: " + Math.floor(elapsed)+ "fps: " + Math.floor(10000 / elapsed) / 10)
}

// vectors
let g_eye = new Vector3([-16.5, 2, -14]);
let g_lookat = new Vector3([-16.5, 2, -13]);
let g_up = new Vector3([0, 10, 0]);
let d;

let moveSpeed = .5;

function keydown(ev) {
    // use wasd
    if (ev.keyCode == 87) { // w
        // move towards lookat
        d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        // d.normalize();
        g_eye.x += d.x * moveSpeed;
        g_lookat.x += d.x * moveSpeed;
        g_eye.z += d.z * moveSpeed;
        g_lookat.z += d.z * moveSpeed;
        if (y_movement_enabled) {
            g_eye.y += d.y * moveSpeed;
            g_lookat.y += d.y * moveSpeed;
        }
    } else if (ev.keyCode == 83) { // s
        // move away from lookat
        d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        // d.normalize();
        g_eye.x -= d.x * moveSpeed;
        g_lookat.x -= d.x * moveSpeed;
        g_eye.z -= d.z * moveSpeed;
        g_lookat.z -= d.z * moveSpeed;
        if (y_movement_enabled) {
            g_eye.y -= d.y * moveSpeed;
            g_lookat.y -= d.y * moveSpeed;
        }
    }
    if (ev.keyCode == 65) { // a
        // move right
        d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        // d.normalize();
        g_eye.x += d.z * moveSpeed;
        g_lookat.x += d.z * moveSpeed;
        g_eye.z -= d.x * moveSpeed;
        g_lookat.z -= d.x * moveSpeed;
        if (y_movement_enabled) {
            g_eye.y -= d.y * moveSpeed;
            g_lookat.y -= d.y * moveSpeed;
        }
    } else if (ev.keyCode == 68) { // d
        // move left
        let d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        // d.normalize();
        g_eye.x -= d.z * moveSpeed;
        g_lookat.x -= d.z * moveSpeed;
        g_eye.z += d.x * moveSpeed;
        g_lookat.z += d.x * moveSpeed;
        if (y_movement_enabled) {
            g_eye.y += d.y * moveSpeed;
            g_lookat.y += d.y * moveSpeed;
        }
    }
    // q and e to pan left and right
    if (ev.keyCode == 81) { // e
        // move g_lookat 30 degrees to the right
        let d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        // d.normalize();
        g_lookat.x = g_eye.x + d.x * Math.cos(-Math.PI/10) - d.z * Math.sin(-Math.PI/10);
        g_lookat.z = g_eye.z + d.x * Math.sin(-Math.PI/10) + d.z * Math.cos(-Math.PI/10);
    } else if (ev.keyCode == 69) { // q
        // move g_lookat 30 degrees to the left
        let d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        // d.normalize();
        g_lookat.x = g_eye.x + d.x * Math.cos(Math.PI/10) - d.z * Math.sin(Math.PI/10);
        g_lookat.z = g_eye.z + d.x * Math.sin(Math.PI/10) + d.z * Math.cos(Math.PI/10);
    }
    // console.log(g_lookat.x-g_eye.x, g_lookat.y-g_eye.y, g_lookat.z-g_eye.z);
}

function mousemove(ev) {
    if (!dragging) return;
        let x = ev.clientX;
        let y = ev.clientY;
        let dx = x - prevx;
        let dy = y - prevy;
        prevx = x;
        prevy = y;
        d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        let theta = Math.atan2(d.z, d.x);
        let phi = Math.acos(d.y);
        theta -= dx * 0.0025;
        phi -= dy * 0.0025;
        if (phi > Math.PI - 0.1) phi = Math.PI - 0.1;
        if (phi < 0.1) phi = 0.1;
        g_lookat.x = g_eye.x + Math.sin(phi) * Math.cos(theta);
        g_lookat.y = g_eye.y + Math.cos(phi);
        g_lookat.z = g_eye.z + Math.sin(phi) * Math.sin(theta);
}

let bf = [-1,9,9,9,9,-1]; // basic floor with roof
let cf = [2,9,9,9,9,-1]; // complex floor with roof
let pl = [-1,-1,-1,-1,-1,-1]; // pillar
// let bc = [-1,9,9,9,9,2]; // basic floor with roof
// let cc = [2,9,9,9,9,2]; // complex floor with roof

let g_map = [
    [pl,pl,pl,pl,pl,pl,pl,pl,pl,pl],
    [pl,pl,pl,[-1,2,2,2,-1,-1],[-1,2,0,2,-1,-1],[-1,2,2,2,-1,-1],[-1,2,0,2,-1,-1],[-1,2,2,2,-1,-1],pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,[-1,2,2,-1,9,-1],cf,cf,cf,cf,cf,cf,[-1,2,2,2,-1,-1],pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,cf,bf,bf,bf,bf,bf,cf,[-1,2,0,2,-1,-1],pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,cf,cf,cf,cf,cf,bf,cf,[-1,2,2,2,-1,-1],pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,pl,[-1,-1,-1,2,-1,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,-1,-1],[-1,0,0,0,0,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,0,0,0,0,-1],[-1,-1,2,-1,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,-1,-1,-1],pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,0,-1,-1],[-1,-1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,[-1,-1,-1,2,-1,-1],cf,[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[-1,-1,2,9,9,-1],cf,[2,9,9,1,9,-1],[2,9,9,-1,9,-1],[2,9,9,-1,9,-1],[2,0,-1,-1,9,-1],[2,9,9,-1,9,-1],[2,9,9,-1,9,-1],[2,9,9,1,-1,-1],cf,[-1,2,9,9,9,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[-1,-1,2,-1,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,pl],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],cf,bf,[2,9,9,0,9,-1],[-1,0,0,0,0,-1],[-1,0,0,0,0,-1],bf,bf,bf,bf,cf,bf,bf,[-1,9,9,-1,9,-1],bf,bf,[-1,9,9,-1,9,-1],bf,bf,bf,bf,bf,[2,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,0,0,-1,-1],cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,[-1,2,2,2,2,-1],pl],
    [pl,[-1,-1,-1,0,-1,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,9,9,-1],cf,bf,[2,9,9,-1,9,-1],bf,bf,bf,bf,bf,bf,cf,[-1,9,9,0,-1,-1],cf,[2,9,9,-1,9,-1],cf,cf,[2,9,9,-1,9,-1],cf,cf,[2,9,9,0,9,-1],[2,9,9,-1,9,-1],[-1,9,9,0,-1,-1],[2,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,4,4,4,4,-1],[-1,4,4,4,4,-1],bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl],
    [pl,[-1,-1,9,9,9,-1],cf,cf,[2,9,9,0,-1,-1],[2,9,9,-1,9,-1],[-1,9,9,-1,9,-1],[2,9,9,0,9,-1],bf,bf,bf,bf,[-1,-1,2,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,-1,9,9,9,-1],[-1,9,9,-1,9,-1],cf,[-1,0,-1,0,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,0,-1,-1,-1,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,-1,9,-1],cf,bf,[-1,2,2,-1,-1,-1],[-1,-1,2,-1,2,-1],[-1,0,9,9,9,-1],bf,bf,[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],pl],
    [pl,[-1,-1,9,9,9,-1],[-1,3,9,9,9,-1],bf,bf,bf,bf,[2,9,9,-1,9,-1],bf,bf,bf,bf,[-1,-1,2,2,-1,-1],[-1,2,2,2,2,-1],[-1,-1,9,9,9,-1],[-1,9,9,-1,9,-1],cf,[-1,-1,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,-1,9,-1,9,-1],cf,bf,[-1,2,2,2,2,-1],[-1,-1,2,2,2,-1],[-1,0,9,9,9,-1],bf,bf,[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],bf,bf,bf,bf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl],
    [pl,[-1,-1,9,9,9,-1],cf,cf,cf,cf,bf,[2,9,9,-1,9,-1],bf,bf,bf,bf,[-1,-1,0,-1,2,-1],[-1,-1,0,2,2,-1],[-1,-1,9,9,9,-1],[-1,9,9,0,9,-1],[2,9,9,-1,9,-1],[-1,0,-1,0,-1,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,0,-1,0,-1,-1],cf,bf,[-1,-1,2,2,2,-1],[-1,-1,2,-1,-1,-1],[-1,0,9,9,9,-1],bf,bf,[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],[-1,2,2,2,2,-1],cf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl],
    [pl,[-1,-1,-1,0,-1,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,-1,0,9,-1],[2,9,9,-1,9,-1],[-1,9,9,-1,9,-1],[2,9,9,1,-1,-1],bf,bf,bf,bf,bf,bf,cf,bf,cf,cf,cf,cf,cf,cf,cf,[2,9,9,-1,9,-1],cf,bf,[2,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,4,4,4,4,-1],[-1,4,4,4,4,-1],bf,bf,bf,bf,cf,pl,cf,cf,cf,cf,cf,cf,cf,cf,bf,bf,cf,[-1,2,2,2,2,-1],pl],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],cf,bf,cf,[-1,0,0,0,0,-1],[-1,0,0,0,0,-1],bf,bf,bf,bf,cf,bf,bf,bf,cf,cf,cf,cf,cf,[-1,9,9,-1,9,-1],bf,bf,[2,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,0,0,-1,-1],bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],cf,bf,bf,bf,bf,bf,bf,bf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl],
    [pl,[-1,-1,9,0,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,[-1,-1,-1,2,-1,-1],cf,[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[-1,-1,2,9,9,-1],[2,9,9,9,9,0],[2,9,9,9,9,0],cf,cf,[-1,2,2,2,2,-1],[-1,2,2,2,2,-1],cf,[2,9,9,1,-1,-1],cf,[-1,2,9,9,9,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[-1,-1,2,-1,-1,-1],[-1,2,2,2,2,-1],bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],cf,bf,bf,bf,bf,bf,bf,cf,[2,1,9,9,9,-1],cf,cf,[-1,2,2,2,2,-1],pl],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,pl,[-1,-1,-1,2,-1,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,-1,-1],[-1,2,-1,2,0,-1],[-1,2,-1,2,0,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],pl,pl,[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,-1,2,-1,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,-1,-1,-1],pl,pl,[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],pl,pl,[-1,4,-1,-1,-1,-1],[-1,9,4,-1,-1,-1],[-1,9,9,4,-1,-1],[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],[-1,9,9,4,-1,-1],[-1,9,4,-1,-1,-1],[-1,4,-1,-1,-1,-1],[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],[-1,2,2,2,2,-1],pl,pl],
    [pl,[2,9,9,-1,9,-1],cf,cf,cf,cf,bf,cf,[-1,2,2,2,-1,-1],pl,[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],pl,[-1,4,-1,-1,-1,-1],[-1,9,4,-1,-1,-1],[-1,9,9,4,-1,-1],[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],[-1,9,9,4,-1,-1],[-1,9,4,-1,-1,-1],[-1,4,-1,-1,-1,-1],pl,[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],pl],
    [pl,[-1,9,9,0,-1,-1],[-1,9,9,-1,9,-1],[-1,9,9,-1,9,-1],[-1,9,9,0,9,-1],bf,bf,cf,[-1,2,0,2,-1,-1],pl,[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1]],
    [pl,[-1,2,2,-1,9,-1],cf,[2,9,9,9,9,0],[2,9,9,9,9,0],cf,cf,cf,[-1,2,2,2,-1,-1],pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1],[-1,1],[-1],[],[],[],[]],
    [pl,pl,pl,[-1,2,2,2,0,-1],[-1,2,0,2,0,-1],[-1,2,2,2,-1,-1],[-1,2,0,2,-1,-1],[-1,2,2,2,-1,-1],pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1],[-1],[-1],[],[],[],[]],
    [pl,pl,pl,pl,pl,pl,pl,pl,pl,pl]
];

let stack_len = 0;
function drawMap() {
    let cube = new Cube();
    cube.color = [.1, .15, .15, 1];
    for (let i = 0; i < g_map.length; i++) {
        for (let j = 0; j < g_map[i].length; j++) {
            stack_len = g_map[i][j].length;
            for (let k = 0; k < stack_len; k++) {
                if (g_map[i][j][k] != 9) {
                    cube.textureNum = g_map[i][j][k];
                    cube.matrix.setTranslate(26-j, k, 12-i);
                    cube.render();
                }
            }
            if (stack_len == 6) {
                cube.textureNum = -1;
                cube.matrix.setTranslate(26-j, 6, 12-i);
                cube.render();
            } 
        }
    }
}

function renderAllShapes() {
    // projection matrix
    let projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width/canvas.height, .1, 110);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMat.elements);

    // view matrix
    let viewMat = new Matrix4();
    viewMat.setLookAt(g_eye.x, g_eye.y, g_eye.z, g_lookat.x, g_lookat.y, g_lookat.z, g_up.x, g_up.y, g_up.z);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // global rotation matrix
    // let globalRotMat = new Matrix4()
    // globalRotMat.rotate(g_globalVert, 1, 0, 0);
    // globalRotMat.rotate(g_globalAngle, 0, 1, 0);
    // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw floor
    let floor = new Cube();
    floor.textureNum = -1;
    floor.color = [.8, .7, .5, 1.0];
    floor.matrix.setTranslate(-19.5, .49, .5);
    floor.matrix.scale(20, 0, 32);
    floor.render();

    // draw ocean
    let ocean = new Cube();
    ocean.textureNum = -1;
    ocean.color = [.2, .2, .8, 1.0];
    ocean.matrix.setTranslate(10.5, .49, .5);
    ocean.matrix.scale(40, 0, 32);
    ocean.render();

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
}

function sendTextToHTML(text) {
    let htmlElm = document.getElementById('out');
    if (!htmlElm) {
        console.log('Failed to get HTML element with id "out"');
        return;
    }
    htmlElm.innerHTML = text;
}