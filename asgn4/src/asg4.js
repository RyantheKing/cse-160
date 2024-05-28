let VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    void main() {
        gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        // v_Normal = a_Normal;
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
        v_VertPos = u_ModelMatrix * a_Position;
    }`;

let FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform vec3 u_LightPos;
    uniform vec3 u_LightColor;
    uniform vec3 u_cameraPos;
    uniform bool u_lightOn;
    uniform bool u_normalsOn;
    varying vec4 v_VertPos;
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
        if (u_normalsOn) {
            gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
        } else if (u_whichTexture == -1) {
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
        vec3 lightVector = normalize(u_LightPos - vec3(v_VertPos));
        vec3 normal = normalize(v_Normal);
        float r = length(lightVector);

        float nDotL = max(dot(normal, lightVector), 0.0);

        vec3 eye = normalize(u_cameraPos - vec3(v_VertPos));
        float specular = pow(max(dot(eye, reflect(-lightVector, normal)), 0.0), 30.0);

        vec3 diffuse = vec3(gl_FragColor) * u_LightColor * nDotL * 0.8;
        vec3 ambient = vec3(gl_FragColor) * u_LightColor * 0.3;
        if (u_lightOn) {
            gl_FragColor = vec4(diffuse + ambient + u_LightColor*specular, 1.0);
        }
    }`;

let canvas, gl, a_Position, a_UV, u_FragColor, u_Size, u_ModelMatrix, u_lightOn, u_LightColor,
u_ViewMatrix, u_ProjMatrix, u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3, u_normalsOn, 
u_Sampler4, u_Sampler5, u_whichTexture, a_Normal, u_LightPos, u_cameraPos, u_NormalMatrix;
let dragging = false;
let prevx = 0;
let prevy = 0;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    initTrianges();
    Sphere.generateSphere();
    addActionsForHtmlUI();

    document.onkeydown = keydown;

    initTextures();

    canvas.onmousedown = function(ev) {
        dragging = true;
        prevx = ev.clientX;
        prevy = ev.clientY;
    };

    canvas.onmouseup = function() {
        dragging = false;
    };

    canvas.onmousemove = mousemove;

    gl.clearColor(0, 0, 0, 1.0);
}

function setupWebGL() {
    canvas = document.getElementById('asgn4');
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
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    u_normalsOn = gl.getUniformLocation(gl.program, 'u_normalsOn');
    u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');

    if (a_Position < 0 || a_UV < 0 || !u_FragColor || !u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix
        || !u_ProjMatrix || !u_whichTexture || a_Normal < 0 || !u_LightPos || !u_cameraPos) {
        console.log('Failed to get the storage location of a glsl variable.');
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
let g_lightPos = [-1, -1, 1];
let g_lightColor = [1, 1, 1];
let g_lightOn = true;
let g_normalsOn = false;
let y_movement_enabled = true;
let saveslot1, saveslot2, saveslot3;
let animated = false;

function addActionsForHtmlUI() {
    y_movement_enabled = document.getElementById('yMove').checked;
    document.getElementById('yMove').addEventListener('change', function() {y_movement_enabled = this.checked;});
    document.getElementById('resetY').addEventListener('click', function() {
        // d = new Vector3([g_lookat.x - g_eye.x, 0, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = 0;
        d.z = g_lookat.z - g_eye.z;
        d.normalize();
        g_lookat.x = g_eye.x + d.x;
        g_lookat.y = g_eye.y;
        g_lookat.z = g_eye.z + d.z;
    });

    // light sliders
    document.getElementById('lightX').value = g_lightPos[0];
    document.getElementById('lightY').value = g_lightPos[1];
    document.getElementById('lightZ').value = g_lightPos[2];
    document.getElementById('lightX').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[0] = +this.value;}});
    document.getElementById('lightY').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[1] = +this.value;}});
    document.getElementById('lightZ').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightPos[2] = +this.value;}});
    document.getElementById('resetLight').addEventListener('click', function() {
        g_lightPos = [3, 0, 0];
        document.getElementById('lightX').value = g_lightPos[0];
        document.getElementById('lightY').value = g_lightPos[1];
        document.getElementById('lightZ').value = g_lightPos[2];
    });

    document.getElementById('lightRed').value = g_lightColor[0];
    document.getElementById('lightGreen').value = g_lightColor[1];
    document.getElementById('lightBlue').value = g_lightColor[2];
    document.getElementById('lightRed').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightColor[0] = +this.value;}});
    document.getElementById('lightGreen').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightColor[1] = +this.value;}});
    document.getElementById('lightBlue').addEventListener('mousemove', function(ev) {if (ev.buttons == 1) {g_lightColor[2] = +this.value;}});

    g_lightOn = document.getElementById('lightOn').checked;
    gl.uniform1i(u_lightOn, g_lightOn);
    document.getElementById('lightOn').addEventListener('change', function() {g_lightOn = this.checked; gl.uniform1i(u_lightOn, g_lightOn);});

    g_normalsOn = document.getElementById('normalsOn').checked;
    gl.uniform1i(u_normalsOn, g_normalsOn);
    document.getElementById('normalsOn').addEventListener('change', function() {g_normalsOn = this.checked; gl.uniform1i(u_normalsOn, g_normalsOn);});

    animated = document.getElementById('animateLight').checked;
    document.getElementById('animateLight').addEventListener('change', function() {
        animated = this.checked;
        // if (animated) {
        //     g_lightPos = [0,0,0];
        // }
    });

    saveslot1 = JSON.parse(localStorage.getItem('saveslot1'));
    saveslot2 = JSON.parse(localStorage.getItem('saveslot2'));
    saveslot3 = JSON.parse(localStorage.getItem('saveslot3'));
    
    document.getElementById('save1').addEventListener('click', function() {
        saveslot1 = JSON.parse(JSON.stringify(g_map));
        localStorage.setItem('saveslot1', JSON.stringify(saveslot1));
    });
    document.getElementById('load1').addEventListener('click', function() {
        if (saveslot1 != null) {
            g_map = JSON.parse(JSON.stringify(saveslot1));
        }});
    document.getElementById('save2').addEventListener('click', function() {
        saveslot2 = JSON.parse(JSON.stringify(g_map));
        localStorage.setItem('saveslot2', JSON.stringify(saveslot2));
    });
    document.getElementById('load2').addEventListener('click', function() {
        if (saveslot2 != null) {
            g_map = JSON.parse(JSON.stringify(saveslot2));
        }});
    document.getElementById('save3').addEventListener('click', function() {
        saveslot3 = JSON.parse(JSON.stringify(g_map));
        localStorage.setItem('saveslot3', JSON.stringify(saveslot3));
    });
    document.getElementById('load3').addEventListener('click', function() {
        if (saveslot3 != null) {
            g_map = JSON.parse(JSON.stringify(saveslot3));
        }});
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
    
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(sampler, index);

    texturesToLoad--;
    if (texturesToLoad == 0) {
        requestAnimationFrame(tick);
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
let g_eye = new Vector3([21.5, 2, 2]);
let g_lookat = new Vector3([22.5, 2, 2]);
let g_up = new Vector3([0, 10, 0]);
let d = new Vector3();

let moveSpeed = .25;

function keydown(ev) {
    // use wasd
    if (ev.keyCode == 87) { // w
        let y_diff;
        if (y_movement_enabled) {
            y_diff = g_lookat.y - g_eye.y;
        } else {
            y_diff = 0;
        }
        // d = new Vector3([g_lookat.x - g_eye.x, y_diff, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = y_diff;
        d.z = g_lookat.z - g_eye.z;
        d.normalize();
        g_eye.x += d.x * moveSpeed;
        g_lookat.x += d.x * moveSpeed;
        g_eye.z += d.z * moveSpeed;
        g_lookat.z += d.z * moveSpeed;
        g_eye.y += d.y * moveSpeed;
        g_lookat.y += d.y * moveSpeed;
    } else if (ev.keyCode == 83) { // s
        let y_diff;
        if (y_movement_enabled) {
            y_diff = g_lookat.y - g_eye.y;
        } else {
            y_diff = 0;
        }
        // d = new Vector3([g_lookat.x - g_eye.x, y_diff, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = y_diff;
        d.z = g_lookat.z - g_eye.z;
        d.normalize();
        g_eye.x -= d.x * moveSpeed;
        g_lookat.x -= d.x * moveSpeed;
        g_eye.z -= d.z * moveSpeed;
        g_lookat.z -= d.z * moveSpeed;
        g_eye.y -= d.y * moveSpeed;
        g_lookat.y -= d.y * moveSpeed;
    }
    if (ev.keyCode == 65) { // a
        let y_diff;
        if (y_movement_enabled) {
            y_diff = g_lookat.y - g_eye.y;
        } else {
            y_diff = 0;
        }
        // d = new Vector3([g_lookat.x - g_eye.x, y_diff, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = y_diff;
        d.z = g_lookat.z - g_eye.z;
        d.normalize();
        g_eye.x += d.z * moveSpeed;
        g_lookat.x += d.z * moveSpeed;
        g_eye.z -= d.x * moveSpeed;
        g_lookat.z -= d.x * moveSpeed;
        g_eye.y -= d.y * moveSpeed;
        g_lookat.y -= d.y * moveSpeed;
    } else if (ev.keyCode == 68) { // d
        let y_diff;
        if (y_movement_enabled) {
            y_diff = g_lookat.y - g_eye.y;
        } else {
            y_diff = 0;
        }
        // d = new Vector3([g_lookat.x - g_eye.x, y_diff, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = y_diff;
        d.z = g_lookat.z - g_eye.z;
        d.normalize();
        g_eye.x -= d.z * moveSpeed;
        g_lookat.x -= d.z * moveSpeed;
        g_eye.z += d.x * moveSpeed;
        g_lookat.z += d.x * moveSpeed;
        g_eye.y += d.y * moveSpeed;
        g_lookat.y += d.y * moveSpeed;
    }
    // q and e to pan left and right
    if (ev.keyCode == 81) { // e
        // move g_lookat 30 degrees to the right
        // let d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = g_lookat.y - g_eye.y;
        d.z = g_lookat.z - g_eye.z;
        // d.normalize();
        g_lookat.x = g_eye.x + d.x * Math.cos(-Math.PI/10) - d.z * Math.sin(-Math.PI/10);
        g_lookat.z = g_eye.z + d.x * Math.sin(-Math.PI/10) + d.z * Math.cos(-Math.PI/10);
    } else if (ev.keyCode == 69) { // q
        // move g_lookat 30 degrees to the left
        // let d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
        d.x = g_lookat.x - g_eye.x;
        d.y = g_lookat.y - g_eye.y;
        d.z = g_lookat.z - g_eye.z;
        // d.normalize();
        g_lookat.x = g_eye.x + d.x * Math.cos(Math.PI/10) - d.z * Math.sin(Math.PI/10);
        g_lookat.z = g_eye.z + d.x * Math.sin(Math.PI/10) + d.z * Math.cos(Math.PI/10);
    }

    // check keycode for z press
    if (ev.keyCode == 90) { // z
        // place a cube at the lookat position
        x = Math.round(g_lookat.x);
        y = Math.round(g_lookat.y);
        z = Math.round(g_lookat.z);
        updateMap(x, y, z, selectedTexture);
    } else if (ev.keyCode == 88) { // x
        x = Math.round(g_lookat.x);
        y = Math.round(g_lookat.y);
        z = Math.round(g_lookat.z);
        updateMap(x, y, z, 9);
    }


    // check keys 1-7
    if (ev.keyCode == 49) { // 1
        selectedTexture = -1;
    } else if (ev.keyCode == 50) { // 2
        selectedTexture = 0;
    } else if (ev.keyCode == 51) { // 3
        selectedTexture = 1;
    } else if (ev.keyCode == 52) { // 4
        selectedTexture = 2;
    } else if (ev.keyCode == 53) { // 5
        selectedTexture = 3;
    } else if (ev.keyCode == 54) { // 6
        selectedTexture = 4;
    } else if (ev.keyCode == 55) { // 7
        selectedTexture = 5;
    }
}

let selectedTexture = -1;
function updateMap(x, y, z, type) {
    let column = [...g_map[z*-1+12][x*-1+26]];
    let len = column.length;
    for (let i = 0; i < y-len; i++) {
        column[i] = 9;
    }
    column[y] = type;
    g_map[z*-1+12][x*-1+26] = column;
    
    if (x == 24 && y == 1 && z == 2) {
        console.log('YOU WIN!');
        winGame();
    }
}

function mousemove(ev) {
    if (!dragging) return;

    let x = ev.clientX;
    let y = ev.clientY;
    let dx = x - prevx;
    let dy = y - prevy;
    prevx = x;
    prevy = y;
    // d = new Vector3([g_lookat.x - g_eye.x, g_lookat.y - g_eye.y, g_lookat.z - g_eye.z]);
    d.x = g_lookat.x - g_eye.x;
    d.y = g_lookat.y - g_eye.y;
    d.z = g_lookat.z - g_eye.z;
    let theta = Math.atan2(d.z, d.x);
    let phi = Math.acos(d.y);
    theta -= dx * 0.005;
    phi -= dy * 0.005;
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
    [pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,pl,pl,[-1,2,2,2,-1,-1],[-1,2,0,2,-1,-1],[-1,2,2,2,-1,-1],[-1,2,0,2,-1,-1],[-1,2,2,2,-1,-1],pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,[-1,2,2,-1,9,-1],cf,cf,cf,cf,cf,cf,[-1,2,2,2,-1,-1],pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,cf,bf,bf,bf,bf,bf,cf,[-1,2,0,2,-1,-1],pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,cf,cf,cf,cf,cf,bf,cf,[-1,2,2,2,-1,-1],pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [pl,[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,pl,[-1,-1,-1,2,-1,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,-1,-1],[-1,0,0,0,0,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,0,0,0,0,-1],[-1,-1,2,-1,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,-1,-1,-1],pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,[],[],[],[]],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,0,-1,-1],[-1,-1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,[-1,-1,-1,2,-1,-1],cf,[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[-1,-1,2,9,9,-1],cf,[2,9,9,1,9,-1],[2,9,9,-1,9,-1],[2,9,9,-1,9,-1],[2,0,-1,-1,9,-1],[2,9,9,-1,9,-1],[2,9,9,-1,9,-1],[2,9,9,1,-1,-1],cf,[-1,2,9,9,9,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[-1,-1,2,-1,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],pl,pl,[],[],[],[]],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],cf,bf,[2,9,9,0,9,-1],[-1,0,0,0,0,-1],[-1,0,0,0,0,-1],bf,bf,bf,bf,cf,bf,bf,[-1,9,9,-1,9,-1],bf,bf,[-1,9,9,-1,9,-1],bf,bf,bf,bf,bf,[2,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,0,0,-1,-1],cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,[-1,2,2,2,2,-1],pl,[],[],[],[]],
    [pl,[-1,-1,-1,0,-1,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,9,9,-1],cf,bf,[2,9,9,-1,9,-1],bf,bf,bf,bf,bf,bf,cf,[-1,9,9,0,-1,-1],cf,[2,9,9,-1,9,-1],cf,cf,[2,9,9,-1,9,-1],cf,cf,[2,9,9,0,9,-1],[2,9,9,-1,9,-1],[-1,9,9,0,-1,-1],[2,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,4,4,4,4,-1],[-1,4,4,4,4,-1],bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl,[],[],[],[]],
    [pl,[-1,-1,9,9,9,-1],cf,cf,[2,9,9,0,-1,-1],[2,9,9,-1,9,-1],[-1,9,9,-1,9,-1],[2,9,9,0,9,-1],bf,bf,bf,bf,[-1,-1,2,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,-1,9,9,9,-1],[-1,9,9,-1,9,-1],cf,[-1,0,-1,0,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,0,-1,-1,-1,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,-1,9,-1],cf,bf,[-1,2,2,-1,-1,-1],[-1,-1,2,-1,2,-1],[-1,0,9,9,9,-1],bf,bf,[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],pl,[],[],[],[]],
    [pl,[-1,-1,9,9,9,-1],[-1,3,9,9,9,-1],bf,bf,bf,bf,[2,9,9,-1,9,-1],bf,bf,bf,bf,[-1,-1,2,2,-1,-1],[-1,2,2,2,2,-1],[-1,-1,9,9,9,-1],[-1,9,9,-1,9,-1],cf,[-1,-1,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,2,9,9,9,-1],[-1,-1,9,-1,9,-1],cf,bf,[-1,2,2,2,2,-1],[-1,-1,2,2,2,-1],[-1,0,9,9,9,-1],bf,bf,[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],bf,bf,bf,bf,cf,cf,cf,cf,cf,cf,cf,cf,cf,cf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl,[],[],[],[]],
    [pl,[-1,-1,9,9,9,-1],cf,cf,cf,cf,bf,[2,9,9,-1,9,-1],bf,bf,bf,bf,[-1,-1,0,-1,2,-1],[-1,-1,0,2,2,-1],[-1,-1,9,9,9,-1],[-1,9,9,0,9,-1],[2,9,9,-1,9,-1],[-1,0,-1,0,-1,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,-1,9,-1,9,-1],[-1,0,-1,0,-1,-1],cf,bf,[-1,-1,2,2,2,-1],[-1,-1,2,-1,-1,-1],[-1,0,9,9,9,-1],bf,bf,[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],pl,[-1,2,2,2,2,-1],[-1,2,2,2,2,-1],pl,[-1,-1,0,0,-1,-1],[-1,2,2,2,2,-1],cf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl,[],[],[],[]],
    [pl,[-1,-1,-1,0,-1,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,-1,0,9,-1],[2,9,9,-1,9,-1],[-1,9,9,-1,9,-1],[2,9,9,1,-1,-1],bf,bf,bf,bf,bf,bf,cf,bf,cf,cf,cf,cf,cf,cf,cf,[2,9,9,-1,9,-1],cf,bf,[2,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,9,9,9,0,-1],[-1,4,4,4,4,-1],[-1,4,4,4,4,-1],bf,bf,bf,bf,cf,pl,cf,cf,cf,cf,cf,cf,cf,cf,bf,bf,cf,[-1,2,2,2,2,-1],pl,[],[],[],[]],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],cf,bf,cf,[-1,0,0,0,0,-1],[-1,0,0,0,0,-1],bf,bf,bf,bf,cf,bf,bf,bf,cf,cf,cf,cf,cf,[-1,9,9,-1,9,-1],bf,bf,[2,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,9,9,9,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,0,0,-1,-1],bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],cf,bf,bf,bf,bf,bf,bf,bf,bf,bf,cf,[-1,-1,0,0,-1,-1],pl,[],[],[],[]],
    [pl,[-1,-1,9,0,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,[-1,-1,-1,2,-1,-1],cf,[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[2,9,9,9,9,0],[-1,-1,2,9,9,-1],[2,9,9,9,9,0],[2,9,9,9,9,0],cf,cf,[-1,2,2,2,2,-1],[-1,2,2,2,2,-1],cf,[2,9,9,1,-1,-1],cf,[-1,2,9,9,9,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[2,9,9,9,-1,-1],[-1,-1,2,-1,-1,-1],[-1,2,2,2,2,-1],bf,bf,bf,bf,cf,[-1,2,2,2,2,-1],cf,bf,bf,bf,bf,bf,bf,cf,[2,1,9,9,9,-1],cf,cf,[-1,2,2,2,2,-1],pl,[],[],[],[]],
    [pl,[-1,-1,9,-1,9,-1],[-1,-1,9,9,9,-1],[-1,-1,9,9,9,-1],[-1,1,9,9,9,-1],cf,bf,[2,9,0,-1,-1,-1],pl,pl,[-1,-1,-1,2,-1,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,0,-1],[-1,-1,-1,2,-1,-1],[-1,2,-1,2,0,-1],[-1,2,-1,2,0,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],pl,pl,[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,2,-1,2,-1,-1],[-1,-1,2,-1,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,0,-1,-1],[-1,-1,2,-1,-1,-1],pl,pl,[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],pl,pl,[-1,4,-1,-1,-1,-1],[-1,9,4,-1,-1,-1],[-1,9,9,4,-1,-1],[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],[-1,9,9,4,-1,-1],[-1,9,4,-1,-1,-1],[-1,4,-1,-1,-1,-1],[-1,2,2,2,2,-1],[-1,-1,0,0,-1,-1],[-1,2,2,2,2,-1],pl,pl,[],[],[],[]],
    [pl,[2,9,9,-1,9,-1],cf,cf,cf,cf,bf,cf,[-1,2,2,2,-1,-1],pl,[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],pl,[-1,4,-1,-1,-1,-1],[-1,9,4,-1,-1,-1],[-1,9,9,4,-1,-1],[-1,9,9,9,4,-1],[-1,9,9,9,4,-1],[-1,9,9,4,-1,-1],[-1,9,4,-1,-1,-1],[-1,4,-1,-1,-1,-1],pl,[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],[-1,3,3,3,-1,-1],pl,[],[],[],[]],
    [pl,[-1,9,9,0,-1,-1],[-1,9,9,-1,9,-1],[-1,9,9,-1,9,-1],[-1,9,9,0,9,-1],bf,bf,cf,[-1,2,0,2,-1,-1],pl,[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[-1],[],[],[],[]],
    [pl,[-1,2,2,-1,9,-1],cf,[2,9,9,9,9,0],[2,9,9,9,9,0],cf,cf,cf,[-1,2,2,2,-1,-1],pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1],[-1,1],[-1],[],[],[],[],[],[],[],[],[]],
    [pl,pl,pl,[-1,2,2,2,0,-1],[-1,2,0,2,0,-1],[-1,2,2,2,-1,-1],[-1,2,0,2,-1,-1],[-1,2,2,2,-1,-1],pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[-1],[-1],[-1],[],[],[],[],[],[],[],[],[]],
    [pl,pl,pl,pl,pl,pl,pl,pl,pl,pl,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],
    [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]
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
                    // cube.normalMatrix.setInverseOf(cube.matrix).transpose();
                    cube.renderfast();
                }
            }
            if (stack_len == 6) {
                cube.textureNum = -1;
                cube.matrix.setTranslate(26-j, 6, 12-i);
                // cube.normalMatrix.setInverseOf(cube.matrix).transpose();
                cube.renderfast();
            } 
        }
    }
}

let g_tailAngle = 0;
let g_tailHoriz = 0;
let g_headAngle = 0;
let g_mandibleAngle = 0;

let body = new Cylinder();
body.color = [.45, .75, .75, 1];
let subbody_cylinder = new Cylinder();
let head = new Cube();
head.color = [.6, .8, .9, 1];
let subhead_cylinder = new Cylinder();
let mandible1b = new Cylinder();
mandible1b.color = [.1, .2, .3, 1];
let mandible2b = new Cylinder();
mandible2b.color = [.1, .2, .3, 1];
let mandible3b = new Cylinder();
mandible3b.color = [.1, .2, .3, 1];
let mandible4b = new Cylinder();
mandible4b.color = [.1, .2, .3, 1];
let horn = new Cube();
horn.color = [.4, .1, 0, 1];
let floor = new Cube();
floor.color = [.8, .7, .5, 1.0];
let ocean = new Cube();
ocean.color = [.2, .2, .8, 1.0];
let tail = new Cylinder();
tail.color = [.4, .65, .65, 1];
let tailb = new Cylinder();
tailb.color = [.3, .60, .60, 1];
let subtail_cylinder = new Cylinder();
let ball = new Sphere();
ball.textureNum = -1;
ball.color = [.3, .7, .4, 1];
let light = new Cube();
light.color = g_lightColor;
light.textureNum = -1;

function drawPet() {
    g_mandibleAngle = Math.sin(g_seconds*5)*45/2+15/2;
    g_headAngle = Math.sin(g_seconds*2)*30;
    g_tailAngle = Math.sin(g_seconds*2)*16;
    g_tailHoriz = Math.sin(g_seconds)*8;

    // draw body
    body.matrix.setTranslate(-.3, 2, -10);
    body.matrix.scale(10,10,10);
    body.matrix.rotate(90, 0, 1, 0);
    {
        let flipper1 = subbody_cylinder;
        flipper1.matrix = new Matrix4(body.matrix);
        flipper1.color = [.4, .1, 0, 1];
        flipper1.matrix.translate(.2, -.11, -.1);
        flipper1.matrix.rotate(45, 1, 0, 0);
        flipper1.matrix.rotate(60, 0, 1, 0);
        flipper1.matrix.scale(.04, .04, .3);
        flipper1.render();
    }
    {
        let flipper2 = subbody_cylinder;
        flipper2.matrix = new Matrix4(body.matrix);
        flipper2.color = [.4, .1, 0, 1];
        flipper2.matrix.translate(-.2, -.11, -.1);
        flipper2.matrix.rotate(45, 1, 0, 0);
        flipper2.matrix.rotate(-60, 0, 1, 0);
        flipper2.matrix.scale(.04, .04, .3);
        flipper2.render();
    }
    {
        head.matrix = new Matrix4(body.matrix);
        head.matrix.translate(0, 0, -.28);
        head.matrix.rotate(-45, 0, 1, 0);
        head.matrix.scale(.11, .22, .11);
        head.matrix.translate(.5, 0, .5);
        head.matrix.rotate(g_headAngle, 0, 1, 0);
        head.matrix.translate(-.5, 0, -.5);
        {
            let mandible1 = subhead_cylinder;
            mandible1.color = [.6, .2, 0, 1];
            mandible1.matrix = new Matrix4(head.matrix);
            mandible1.matrix.translate(0.8, -0.1, -1.3);
            mandible1.matrix.rotate(-30, 0, 1, 0);
            mandible1.matrix.translate(0, 0, 1);
            mandible1.matrix.rotate(g_mandibleAngle, 0, 1, 0);
            mandible1.matrix.rotate(5, 1, 0, 0);
            mandible1.matrix.translate(0, 0, -1);
            {
                mandible1b.matrix = new Matrix4(mandible1.matrix);
                mandible1b.matrix.translate(-.6, -.02, -.30);
                mandible1b.matrix.rotate(2, 1, 0, 0);
                mandible1b.matrix.rotate(135, 0, 1, 0);
                mandible1b.matrix.scale(.4, .16, 2);
                mandible1b.render();
            }
            mandible1.matrix.scale(.4, .16, 2);
            mandible1.render();
        }
        {
            let mandible2 = subhead_cylinder;
            mandible2.color = [.6, .2, 0, 1];
            mandible2.matrix = new Matrix4(head.matrix);
            mandible2.matrix.translate(0.8, -0.3, -1.3);
            mandible2.matrix.rotate(-30, 0, 1, 0);
            mandible2.matrix.translate(0, 0, 1);
            mandible2.matrix.rotate(g_mandibleAngle, 0, 1, 0);
            mandible2.matrix.rotate(-5, 1, 0, 0);
            mandible2.matrix.translate(0, 0, -1);
            {
                mandible2b.matrix = new Matrix4(mandible2.matrix);
                mandible2b.matrix.translate(-.6, .02, -.30);
                mandible2b.matrix.rotate(-2, 1, 0, 0);
                mandible2b.matrix.rotate(135, 0, 1, 0);
                mandible2b.matrix.scale(.4, .16, 2);
                mandible2b.render();
            }
            mandible2.matrix.scale(.4, .16, 2);
            mandible2.render();
        }
        {
            let mandible3 = subhead_cylinder;
            mandible3.color = [.6, .2, 0, 1];
            mandible3.matrix = new Matrix4(head.matrix);
            mandible3.matrix.translate(-1.3, -0.1, 0.8);
            mandible3.matrix.rotate(120, 0, 1, 0);
            mandible3.matrix.rotate(180, 0, 0, 1);
            mandible3.matrix.translate(0, 0, 1);
            mandible3.matrix.rotate(g_mandibleAngle, 0, 1, 0);
            mandible3.matrix.rotate(-5, 1, 0, 0);
            mandible3.matrix.translate(0, 0, -1);
            {
                mandible3b.matrix = new Matrix4(mandible3.matrix);
                mandible3b.matrix.translate(-.6, .02, -.3);
                mandible3b.matrix.rotate(-2, 1, 0, 0);
                mandible3b.matrix.rotate(135, 0, 1, 0);
                mandible3b.matrix.scale(.4, .16, 2);
                mandible3b.render();
            }
            mandible3.matrix.scale(.4, .16, 2);
            mandible3.render();
        }
        {
            let mandible4 = subhead_cylinder;
            mandible4.color = [.6, .2, 0, 1];
            mandible4.matrix = new Matrix4(head.matrix);
            mandible4.matrix.translate(-1.3, -0.3, 0.8);
            mandible4.matrix.rotate(120, 0, 1, 0);
            mandible4.matrix.rotate(180, 0, 0, 1);
            mandible4.matrix.translate(0, 0, 1);
            mandible4.matrix.rotate(g_mandibleAngle, 0, 1, 0);
            mandible4.matrix.rotate(5, 1, 0, 0);
            mandible4.matrix.translate(0, 0, -1);
            {
                mandible4b.matrix = new Matrix4(mandible4.matrix);
                mandible4b.matrix.translate(-.6, -.02, -.3);
                mandible4b.matrix.rotate(2, 1, 0, 0);
                mandible4b.matrix.rotate(135, 0, 1, 0);
                mandible4b.matrix.scale(.4, .16, 2);
                mandible4b.render();
            }
            mandible4.matrix.scale(.4, .16, 2);
            mandible4.render();
        }
        {
            let eye1 = subhead_cylinder;
            eye1.color = [0, 0.1, 0, 1];
            eye1.matrix = new Matrix4(head.matrix);
            eye1.matrix.translate(0.2, 0.35, -0.01);
            eye1.matrix.scale(.4, .16, 1);
            eye1.render();
        }
        {
            let eye2 = subhead_cylinder;
            eye2.color = [0, 0.1, 0, 1];
            eye2.matrix = new Matrix4(head.matrix);
            eye2.matrix.translate(-0.01, 0.35, 0.2);
            eye2.matrix.rotate(90, 0, 1, 0);
            eye2.matrix.scale(.4, .16, 1);
            eye2.render();
        }
        {
            let eye3 = subhead_cylinder;
            eye3.color = [0, 0.1, 0, 1];
            eye3.matrix = new Matrix4(head.matrix);
            eye3.matrix.translate(-0.1, .16, -0.01);
            eye3.matrix.scale(.25, .10, 1);
            eye3.render();
        }
        {
            let eye4 = subhead_cylinder;
            eye4.color = [0, 0.1, 0, 1];
            eye4.matrix = new Matrix4(head.matrix);
            eye4.matrix.translate(-0.01, .16, -0.1);
            eye4.matrix.rotate(90, 0, 1, 0);
            eye4.matrix.scale(.25, .10, 1);
            eye4.render();
        }
        {
            horn.matrix = new Matrix4(head.matrix);
            horn.matrix.translate(-.35, .7, -.35);
            horn.matrix.scale(.4, .64, .4);
            horn.renderfast();
        }
        head.renderfast();
    }
    {
        tail.matrix = new Matrix4(body.matrix);
        let scale = [.15, .15, 0.6];
        tail.matrix.translate(0, 0, .5);
        tail.matrix.translate(0, 0, -scale[2]/2);
        tail.matrix.rotate(g_tailAngle, 1, 0, 0);
        tail.matrix.rotate(g_tailHoriz, 0, 1, 0);
        tail.matrix.translate(0, 0, scale[2]/2);
        {
            tailb.matrix = new Matrix4(tail.matrix);
    
            tailb.matrix.translate(0, 0, .48);
            tailb.matrix.translate(0, 0, -scale[2]*.7/2);
            tailb.matrix.rotate(g_tailAngle, 1, 0, 0);
            tailb.matrix.rotate(g_tailHoriz, 0, 1, 0);
            tailb.matrix.translate(0, 0, scale[2]*.7/2);
            {
                let fin1 = subtail_cylinder;
                fin1.matrix = new Matrix4(tailb.matrix);
                fin1.color = [.4, .1, 0, 1];
                fin1.matrix.translate(.15, .06, .25);
                fin1.matrix.rotate(-30, 1, 0, 0);
                fin1.matrix.rotate(60, 0, 1, 0);
                fin1.matrix.scale(.05, .05, .3);
                fin1.render();
            }
            {
                let fin2 = subtail_cylinder;
                fin2.matrix = new Matrix4(tailb.matrix);
                fin2.color = [.4, .1, 0, 1];
                fin2.matrix.translate(-.15, .06, .25);
                fin2.matrix.rotate(-30, 1, 0, 0);
                fin2.matrix.rotate(-60, 0, 1, 0);
                fin2.matrix.scale(.05, .05, .3);
                fin2.render();
            }
            {
                let fin3 = subtail_cylinder;
                fin3.matrix = new Matrix4(tailb.matrix);
                fin3.color = [.4, .1, 0, 1];
                fin3.matrix.translate(-.07, -.1, .15);
                fin3.matrix.rotate(60, 1, 0, 0);
                fin3.matrix.rotate(-30, 0, 1, 0);
                fin3.matrix.scale(.04, .04, .15)
                fin3.render();
            }
            {
                let fin4 = subtail_cylinder;
                fin4.matrix = new Matrix4(tailb.matrix);
                fin4.color = [.4, .1, 0, 1];
                fin4.matrix.translate(.07, -.1, .15);
                fin4.matrix.rotate(60, 1, 0, 0);
                fin4.matrix.rotate(30, 0, 1, 0);
                fin4.matrix.scale(.04, .04, .15)
                fin4.render();
            }
            tailb.matrix.scale(scale[0]*.7, scale[1]*.7, scale[2]*.7);
            tailb.render();
        }
        tail.matrix.scale(scale[0], scale[1], scale[2]);
        tail.render();
    }
    body.matrix.scale(.2, .2, 0.5);
    body.render();
}

function renderAllShapes() {
    // projection matrix
    let projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width/canvas.height, .1, 110);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMat.elements);

    light.matrix.setTranslate(24+g_lightPos[0], 2+g_lightPos[1], 2+g_lightPos[2]);
    if (animated) {
        g_lightPos[0] = Math.sin(g_seconds);
        g_lightPos[1] = Math.sin(g_seconds);
        g_lightPos[2] = Math.cos(g_seconds);
    }

    gl.uniform3f(u_LightPos, 24+g_lightPos[0], 2+g_lightPos[1], 2+g_lightPos[2]);
    gl.uniform3f(u_LightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
    gl.uniform3f(u_cameraPos, g_eye.x, g_eye.y, g_eye.z);

    // view matrix
    let viewMat = new Matrix4();
    viewMat.setLookAt(g_eye.x, g_eye.y, g_eye.z, g_lookat.x, g_lookat.y, g_lookat.z, g_up.x, g_up.y, g_up.z);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw floor
    floor.textureNum = -1;
    floor.matrix.setTranslate(-19.5, .49, .5);
    floor.matrix.scale(20, 0, 32);
    floor.renderfast();

    // draw ocean
    ocean.textureNum = -1;
    ocean.matrix.setTranslate(10.5, .49, .5);
    ocean.matrix.scale(40, 0, 32);
    ocean.renderfast();

    // draw sky
    let sky = new Cube();
    sky.textureNum = 5;
    sky.color = [.5, .7, .9, 1.0];
    sky.matrix.scale(-100, -100, -100);
    sky.renderfast();

    ball.matrix.setTranslate(24, 2, 2);
    ball.matrix.scale(.5, .5, .5);
    ball.renderfast();

    light.matrix.scale(-.1, -.1, -.1);
    light.renderfast();

    drawMap();
    drawPet();

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

function winGame() {
    let htmlElm = document.getElementById('game');
    if (!htmlElm) {
        console.log('Failed to get HTML element with id "game"');
        return;
    }
    htmlElm.innerHTML = "<b>YOU WIN!&nbsp;&nbsp;</b>";
}